import { getArea, getLength } from 'ol/sphere';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';


export class MapUtils {

    // convert radians to degrees
    static radToDeg(rad: number) {
        return rad * 360 / (Math.PI * 2);
    }
    // convert degrees to radians
    static degToRad(deg: number) {
        return deg * Math.PI * 2 / 360;
    }
    // modulo for negative values
    static mod(n: number) {
        return ((n % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    }


    /**
    * Format length output.
    * @param {LineString} line The line.
    * @return {string} The formatted length.
    */
    static formatLength(line: LineString): string {
        let length = getLength(line);
        let output: string;
        if (length > 100) {
            output = (Math.round(length / 1000 * 100) / 100) +
                ' ' + 'km';
        } else {
            output = (Math.round(length * 100) / 100) +
                ' ' + 'm';
        }
        return output;
    };


    /**
    * Format area output.
    * @param {Polygon} polygon The polygon.
    * @return {string} Formatted area.
    */
    static formatArea(polygon: Polygon): string {
        let area = getArea(polygon);
        let output: string;
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) +
                ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) +
                ' ' + 'm<sup>2</sup>';
        }
        return output;
    };

    static formatRadius(poly: Polygon): string {

        const center = poly.getInteriorPoint().getCoordinates()
        const coord = poly.getLastCoordinate()

        const str = new LineString([center, coord])
        return "Radius " + this.formatLength(str)
    }
}