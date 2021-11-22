
import { Flattenable } from './mod.ts';

export interface PaginationResult {
  results: Flattenable[]
  next_cursor: string
  has_more: boolean
}