import { Coordinate } from './coordinate';
import { Dimension } from './dimension';

/**
 * Region conveys information of a rectangle in a 2D plane, with location and
 * size information.
 */
export interface Region extends Dimension, Coordinate {
}
