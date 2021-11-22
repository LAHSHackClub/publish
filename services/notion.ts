
import { config } from "../deps.ts";
import { Flattenable, PaginationResult } from "../schemas/mod.ts";

const baseUrl = 'https://api.notion.com/v1';
const baseOpts = {
  headers: {
    'Authorization': `Bearer ${config.notion_token}`,
    'Notion-Version': '2021-08-16',
    'Content-Type': 'application/json'
  }
};

export async function queryDatabase(
    dbId: string, cursor?: string, after?: Date): Promise<PaginationResult> {
  // Database query options - pagination + filters
  const body = {
    start_cursor: cursor ?? undefined,
    filter: after ? {
      "property": "Modified",
      "last_edited_time": { "after": after.toISOString() }
    } : undefined
  };
  // Make the query and return JSON response
  const res = await fetch(`${baseUrl}/databases/${dbId}/query`,
    { ...baseOpts, method: 'POST', body: JSON.stringify(body)});
  return res.json();
}

export async function getDatabase(dbId: string): Promise<Flattenable> {
  const res = await fetch(`${baseUrl}/databases/${dbId}`, baseOpts);
  return res.json();
}