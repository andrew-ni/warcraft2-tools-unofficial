/**
 * Represents the triplet found in each line in asset .dat files.
 * Some lines have no direction and/or index (e.g. "inactive" or "construct-0"), so they are optional.
 */
export interface Frame {
  action: string;
  direction?: string;
  index?: number;
}
