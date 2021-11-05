
import { config } from "../deps.ts";
import { PaginationResult, Page } from "../schemas/mod.ts";

const baseUrl = 'https://api.notion.com/v1';
const baseOpts = {
  headers: { 'Authorization': `Bearer ${config.notion_token}`, 'Notion-Version': '2021-08-16' }
};

export async function queryDatabase(dbId: string, cursor?: string): Promise<PaginationResult<Page>> {
  const res = await fetch(`${baseUrl}/databases/${dbId}/query`, { ...baseOpts, method: 'POST' });
  return await res.json();
}
