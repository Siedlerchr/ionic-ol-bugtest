import { Component, ViewChild } from '@angular/core';
import BaseLayer from 'ol/layer/Base';
import { Feature, Map, Overlay } from 'ol';
import { Draw, Interaction, Select } from 'ol/interaction';
import { HIT_TOLERANCE, MapUtilsService } from '../map/map-utils.service';
import GeometryType from 'ol/geom/GeometryType';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Fill, Stroke, Text as TextStyle } from 'ol/style';
import ControlBar from 'ol-ext/control/Bar';
import ControlButton from 'ol-ext/control/Button';
import ToggleControl from 'ol-ext/control/Toggle';
import { MapComponent } from '../map/map.component';


const drawingVectorSource = new VectorSource();
const drawingStyle = (feature: Feature) => {
  return [
    new Style({
      fill: new Fill({
        color: 'rgba(255,255,255,0.4)'
      }),
      stroke: new Stroke({
        color: '#3399CC',
        width: 1.25
      }),
      text: new TextStyle({
        font: '2em Calibri,sans-serif',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({
          color: '#3399CC', width: 2
        }),
        text: feature.get('description') || ''
      })
    })
  ];
};

const drawLayer = new VectorLayer({
  source: drawingVectorSource,
  style: drawingStyle,
  zIndex: 90
});


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  map: Map;
  layers: BaseLayer[] = [];

  // Generic popup
  popupcontent: HTMLElement;

  @ViewChild('mapcomp') mapcomp: MapComponent;


  interactions: Interaction[] = [];
  overlays: Overlay[] = [];
  constructor(private mapUtilsService: MapUtilsService) { }

  mapReady(map: Map) {
    this.map = map;
    this.mapUtilsService.addInteractionsAndOverlays(this.interactions, this.overlays, this.map);
    this.addDrawControls();

  }

  addDrawControls() {
    const drawInteractions: Draw[] = [];

    const nested = new ControlBar({ toggleOne: true, group: true });
    const mainbar = new ControlBar();
    mainbar.addControl(nested);
    this.map.addControl(mainbar);


    drawLayer.set('name', 'drawlayer');
    drawLayer.set('displayInLayerSwitcher', false);
    this.map.addLayer(drawLayer);

    const circleInteraction = new Draw({
      type: GeometryType.CIRCLE,
      source: drawLayer.getSource(),
      stopClick: true,
    });

    const pedit = new ToggleControl({
      // tslint:disable-next-line: max-line-length
      html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z" fill="white"/></svg>',
      className: 'edit',
      title: 'Circle',
      active: false,
      interaction: circleInteraction
    });

    drawInteractions.push(circleInteraction);
    nested.addControl(pedit);

    const polygonInteraction = new Draw({
      type: GeometryType.POLYGON,
      source: drawLayer.getSource(),
      stopClick: true,
    });
    polygonInteraction.set('name', 'drawpolygon');  // Required for drawing ROIs

    const polygonEdit = new ToggleControl({
      // tslint:disable-next-line: max-line-length
      html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M384 352c-.35 0-.67.1-1.02.1l-39.2-65.32c5.07-9.17 8.22-19.56 8.22-30.78s-3.14-21.61-8.22-30.78l39.2-65.32c.35.01.67.1 1.02.1 35.35 0 64-28.65 64-64s-28.65-64-64-64c-23.63 0-44.04 12.95-55.12 32H119.12C108.04 44.95 87.63 32 64 32 28.65 32 0 60.65 0 96c0 23.63 12.95 44.04 32 55.12v209.75C12.95 371.96 0 392.37 0 416c0 35.35 28.65 64 64 64 23.63 0 44.04-12.95 55.12-32h209.75c11.09 19.05 31.49 32 55.12 32 35.35 0 64-28.65 64-64 .01-35.35-28.64-64-63.99-64zm-288 8.88V151.12A63.825 63.825 0 0 0 119.12 128h208.36l-38.46 64.1c-.35-.01-.67-.1-1.02-.1-35.35 0-64 28.65-64 64s28.65 64 64 64c.35 0 .67-.1 1.02-.1l38.46 64.1H119.12A63.748 63.748 0 0 0 96 360.88zM272 256c0-8.82 7.18-16 16-16s16 7.18 16 16-7.18 16-16 16-16-7.18-16-16zM400 96c0 8.82-7.18 16-16 16s-16-7.18-16-16 7.18-16 16-16 16 7.18 16 16zM64 80c8.82 0 16 7.18 16 16s-7.18 16-16 16-16-7.18-16-16 7.18-16 16-16zM48 416c0-8.82 7.18-16 16-16s16 7.18 16 16-7.18 16-16 16-16-7.18-16-16zm336 16c-8.82 0-16-7.18-16-16s7.18-16 16-16 16 7.18 16 16-7.18 16-16 16z" fill="white"/></svg>',
      title: 'Polygon',
      class: 'edit',
      active: false,
      interaction: polygonInteraction
    });

    drawInteractions.push(polygonInteraction);
    nested.addControl(polygonEdit);

    const lineInteraction = new Draw({
      type: GeometryType.LINE_STRING,
      source: drawLayer.getSource(),
      stopClick: true,
    });

    const lineEdit = new ToggleControl(
      {
        html: '<ion-icon name="create"></ion-icon>',
        title: 'Line',
        class: 'edit',
        active: false,
        interaction: lineInteraction
      });

    drawInteractions.push(lineInteraction);
    nested.addControl(lineEdit);

    const currentLocation = new ControlButton({
      html: '<ion-icon name="locate"></ion-icon>',
      title: 'Locate current position',
      className: 'select',
      handleClick: () => {
      }
    });

    nested.addControl(currentLocation);

    const selectInteraction = new Select({
      layers: [drawLayer],
      hitTolerance: HIT_TOLERANCE
    });

    selectInteraction.on('select', evt => {
      console.log('selected feature', evt.selected);
    });

    const selectForLabel = new Select({
      multi: false,
      hitTolerance: HIT_TOLERANCE,
      style: drawingStyle
    });

    const addLabelControl = new ToggleControl(
      {
        html: '<ion-icon name="text"></ion-icon>',
        title: 'Add description',
        class: 'edit',
        active: false,
        interaction: selectForLabel
      }
    );

    nested.addControl(addLabelControl);

    const removeDrawingControl = new ToggleControl(
      {
        html: '<ion-icon name="trash"></ion-icon>',
        title: 'Delete selected drawing',
        class: 'edit',
        active: false,
        interaction: selectInteraction
      });
    nested.addControl(removeDrawingControl);
  }
}
