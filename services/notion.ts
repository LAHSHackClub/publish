
import { config } from "../deps.ts";

const baseUrl = 'https://api.notion.com/v1';

export async function queryDatabase(dbId: string) {
  const res = await fetch(`${baseUrl}/databases/${dbId}/query`);
  return res.json();
}