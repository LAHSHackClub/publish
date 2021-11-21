
import { nanoid } from '../deps.ts';

export async function cachePages(dbId: string, pages: any[]): Promise<void> {
  for (const page of pages)
    await cachePage(dbId, page);
}

async function cachePage(dbId: string, page: any): Promise<void> {
  const keys = Object.keys(page).filter(key => page[key]?.type === 'files');
  for (const key of keys) {
    for (const item of page[key]) {
      // Download file, generate new UUID and save locally
      const f = await(await fetch(item.url)).arrayBuffer();
      const uuid = `${nanoid()}-${item.name}`;
      await Deno.writeFile(`${Deno.cwd()}/app/content/${dbId}/${uuid}`, new Uint8Array(f));
      // Update URL with new path
      item.url = `https://db.lahs.club/content/${dbId}/${uuid}`;
    }
  }
}