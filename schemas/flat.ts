
import { BaseObject } from './base.ts';

export interface Flattenable extends BaseObject {
  properties: { [key: string]: any }
}
export interface Flattened extends BaseObject {
  [key: string]: any
}