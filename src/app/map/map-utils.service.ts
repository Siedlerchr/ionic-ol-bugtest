import { ElementRef, Injectable } from '@angular/core';
import { Feature, Map, Overlay } from 'ol';
import { ScaleLine } from 'ol/control';
import { Units } from 'ol/control/ScaleLine';
import { getCenter } from 'ol/extent';
import Interaction from 'ol/interaction/Interaction';
import OverlayPositioning from 'ol/OverlayPositioning';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import IconAnchorUnits from 'ol/style/IconAnchorUnits';

export const HIT_TOLERANCE = 3; // number of pixels

@Injectable({
  providedIn: 'root'
})
export class MapUtilsService {

  constructor() { }

  addInteractionsAndOverlays(interactions: Interaction[], overlays: Overlay[], map: Map) {
    interactions.map(async interaction => {
      map.addInteraction(interaction);
    });
    overlays.map(async overlay => {
      map.addOverlay(overlay);
    });
  }
  addPopupForFeature(feature: Feature, overlayId: string, map: Map) {
    map.getTargetElement().style.cursor = 'pointer';

    const geometry = feature.getGeometry();
    const coordinate = getCenter(geometry.getExtent());
    map.getOverlayById(overlayId).setPosition(coordinate);
  }
  setPopupUndefined(overlayId: string, map: Map) {
    map.getOverlayById(overlayId).setPosition(undefined);
  }
  getCustomPopup(id: string, element: ElementRef, position?: OverlayPositioning, offset?: number[]) {
    return new Overlay({
      element: element.nativeElement,
      positioning: position || OverlayPositioning.TOP_CENTER,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      },
      offset,
      id,
    });
  }

  getScaleControl() {
    return new ScaleLine({
      units: Units.METRIC
    });
  }



}
