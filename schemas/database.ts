
import { BaseObject } from './base.ts';

export interface Database extends BaseObject {
  properties: { [key: string]: any }
}

export interface FlatDatabase extends BaseObject {
  [key: string]: any
}