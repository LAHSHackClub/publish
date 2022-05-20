
const baseUrl = 'https://api.notion.com/v1';
const baseOpts = {
  headers: {
    'Authorization': `Bearer secret_jarb8inoeNyDvEqnhvECMrjEp9Xb9H3DaOjV68UQrVf`,
    'Notion-Version': '2021-08-16',
    'Content-Type': 'application/json'
  }
};

// Query database for pages and return a pagination result
export async function queryDatabase(
    dbId: string, cursor?: string, after?: Date): Promise<any> {
  // Database query options - pagination + filters
  const body = { start_cursor: cursor };
  // Make the query and return JSON response
  const res = await fetch(`${baseUrl}/databases/${dbId}/query`,
    { ...baseOpts, method: 'POST', body: JSON.stringify(body)});
  return res.json();
}

// Get database meta information from Notion
export async function getDatabase(dbId: string): Promise<any> {
  const res = await fetch(`${baseUrl}/databases/${dbId}`, baseOpts);
  return res.json();
}