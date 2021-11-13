
import { config } from "../deps.ts";
import { Database, PaginationResult, Page } from "../schemas/mod.ts";

const baseUrl = 'https://api.notion.com/v1';
const baseOpts = {
  headers: { 'Authorization': `Bearer ${config.notion_token}`, 'Notion-Version': '2021-08-16' }
};

export async function queryDatabase(dbId: string, cursor?: string): Promise<PaginationResult<Page>> {
  const body = { start_cursor: cursor, page_size: 100 };
  const res = await fetch(`${baseUrl}/databases/${dbId}/query`,
    { ...baseOpts, method: 'POST', body: JSON.stringify(body)});
  return res.json();
}

export async function getDatabase(dbId: string): Promise<Database> {
  const res = await fetch(`${baseUrl}/databases/${dbId}`, baseOpts);
  return res.json();
}