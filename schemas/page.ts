
import { BaseObject } from './base.ts';

export interface Page extends BaseObject {
  properties: { [key: string]: any }
}

export interface FlatPage extends BaseObject {
  [key: string]: any
}