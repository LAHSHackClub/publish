
export interface PaginationResult<T> {
  results: T[]
  next_cursor: string
  has_more: boolean
}