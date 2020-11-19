import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Geolocation, Map, Overlay, View } from 'ol';
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import LayerPopup from 'ol-ext/control/LayerPopup';
import { defaults as defaultControls } from 'ol/control';
import { toStringHDMS } from 'ol/coordinate';
import GeometryLayout from 'ol/geom/GeometryLayout';
import LineString from 'ol/geom/LineString';
import { defaults as defaultInteractions, DragPan } from 'ol/interaction';
import { Tile as TileLayer } from 'ol/layer';
import BaseLayer from 'ol/layer/Base';
import OverlayPositioning from 'ol/OverlayPositioning';
import { fromLonLat, toLonLat } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import { OSM } from 'ol/source';
import proj4 from 'proj4';
import { BehaviorSubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { MapUtils } from './map-utils';
import { MapUtilsService } from './map-utils.service';



const positions = new LineString([], (GeometryLayout.XYZM));


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {

  @ViewChild('mapElementRef') mapElementRef: ElementRef;
  @ViewChild('popupElementRef') popupElementRef: ElementRef;
  @ViewChild('geolocationElementRef') geolocationElementRef: ElementRef;

  @Output() mapAvaiable = new EventEmitter<Map>();
  private layerData = new BehaviorSubject<BaseLayer[]>([]);

  @Input('layers')
  set layers(value: BaseLayer[]) {
    this.layerData.next(value);
  }
  get layers() {
    // get the latest value from _data BehaviorSubject
    return this.layerData.getValue();
  }


  @Input() popupcontent: HTMLElement;

  map: Map;
  private subscriptions: Subscription[] = [];
  private geolocation: Geolocation;
  imagePath = 'assets/geolocation_marker.png';
  private deltaMean = 500; // the geolocation sampling period mean in ms

  renderComplete = false;
  previousM = 0;


  constructor(
    private mapUtilsService: MapUtilsService,
    private platform: Platform,
  ) {
    proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
    register(proj4);
  }

  ngOnInit() {
    setTimeout(() => {
      this.initMapAndLayerData();
    }, 100);
  }

  initMapAndLayerData() {
    console.log('init map ');

    const osm = new TileLayer({
      source: new OSM()
    });
    osm.set('name', 'osm');
    osm.set('title', 'OpenStreetMap');
    osm.set('baselayer', true);

    this.map = new Map({
      target: this.mapElementRef.nativeElement,
      layers: [osm],
      view: new View({ zoom: 14, center: fromLonLat([8.75439, 51.71905]) }), // [51.71905, 8.75439]
      controls: defaultControls().extend([
        new LayerPopup(),
        this.mapUtilsService.getScaleControl()
      ]),
      interactions: defaultInteractions({
        dragPan: this.platform.is('desktop'),
        mouseWheelZoom: this.platform.is('desktop')
      }).extend([
        new DragPan({
          condition(this: DragPan, event) {
            return this.getPointerCount() === 2;
          }
        })
      ])
    });

    this.geolocation = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 600000
      },
      projection: this.map.getView().getProjection(),
    });

    const popup = this.mapUtilsService.getCustomPopup('popup', this.popupElementRef);
    this.map.addOverlay(popup);
    this.map.addOverlay(this.getGeomarkerOverlay());


    this.registerGeoLocationChange();

    const layersSubsr = this.layerData.pipe(map(layers => this.addLayers(layers))).subscribe();
    this.subscriptions.push(layersSubsr);

    this.map.render();

    this.mapAvaiable.emit(this.map);

    this.map.once('rendercomplete', () => {
      this.renderComplete = true;
    });

    this.map.on('pointermove', evt => {
      this.map.getTargetElement().style.cursor =
        this.map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
    });

    this.platform.resize.subscribe(() => {
      if (this.map) {
        this.map.updateSize();
      }
    });
  }

  addLayers(layers: BaseLayer[]) {
    layers.map(async (layer) => this.map.addLayer(layer));
  }

  closePopup(id: string) {
    const overlay = this.map.getOverlayById(id);
    overlay.setPosition(undefined);
    this.popupcontent = '' as any;
    return false;
  }

  getGeomarkerOverlay() {
    const image = this.geolocationElementRef.nativeElement;
    return new Overlay({
      positioning: OverlayPositioning.CENTER_CENTER,
      element: image,
      id: 'geomarker'
    });
  }

  showCurrentGeoPosition() {
    console.log('show current geo position');
    const coordinate = this.map.getOverlayById('geomarker').getPosition();
    this.popupcontent = `${toStringHDMS(toLonLat(coordinate))}` as any;
    this.map.getTargetElement().style.cursor = 'pointer';
    this.map.getOverlayById('popup').setPosition(coordinate);
    return false;
  }

  handleClickonGeolocationButton() {
    this.geolocation.setTracking(true);
    this.map.on('postcompose', () => {
      // use sampling period to get a smooth transition
      let m = Date.now() - this.deltaMean * 1.5;
      m = Math.max(m, this.previousM);
      this.previousM = m;
      // interpolate position along positions LineString
      const c = positions.getCoordinateAtM(m, true);
      if (c) {
        this.map.getOverlayById('geomarker').setPosition(c);
      }

    });
    this.map.render();
    if (this.geolocation.getPosition()) {
      const position = this.geolocation.getPosition();
      this.map.getView().setCenter(position);
    }
  }


  registerGeoLocationChange() {

    this.geolocation.on('change', () => {

      console.log('geo change');
      const position = this.geolocation.getPosition();
      const heading = this.geolocation.getHeading() || 0;
      const speed = this.geolocation.getSpeed() || 0;
      const m = Date.now();
      this.addPosition(position, heading, m, speed);

      const coords = positions.getCoordinates();
      const len = coords.length;
      if (len >= 2) {
        this.deltaMean = (coords[len - 1][3] - coords[0][3]) / (len - 1);
      }

    });
    this.geolocation.on('error', evt => {
        console.log('Geo Error' , evt.code, evt.message);
    });
  }

  addPosition(position: any[] | number[], heading: number, m: number, speed: number) {
    const x = position[0];
    const y = position[1];
    const fCoords = positions.getCoordinates();
    const previous = fCoords[fCoords.length - 1];
    const prevHeading = previous && previous[2];
    if (prevHeading) {
      let headingDiff = heading - MapUtils.mod(prevHeading);

      // force the rotation change to be less than 180°
      if (Math.abs(headingDiff) > Math.PI) {
        const sign = (headingDiff >= 0) ? 1 : -1;
        headingDiff = -sign * (2 * Math.PI - Math.abs(headingDiff));
      }
      heading = prevHeading + headingDiff;
    }
    positions.appendCoordinate([x, y, heading, m]);

    // only keep the 20 last coordinates
    positions.setCoordinates(positions.getCoordinates().slice(-20));

    if (heading && speed) {
      this.imagePath = 'assets/geolocation_marker_heading.png';
    } else {
      this.imagePath = 'assets/geolocation_marker.png';
    }
  }


  ngOnDestroy() {
    if (this.geolocation) {
      this.geolocation.setTracking(false);
    }
    this.layerData.complete();
  }

}
