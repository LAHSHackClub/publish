
export interface Page {
  id: string
  created_time: string
  last_edited_time: string
  parent: { type: string, database_id: string }
  archived: boolean
  properties: any
  url: string
}