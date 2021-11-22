
import { nanoid, Image } from '../deps.ts';

export async function cachePages(dbId: string, pages: any[]): Promise<void> {
  for (const page of pages)
    await cachePage(dbId, page);
}

async function cachePage(dbId: string, page: any): Promise<void> {
  const keys = Object.keys(page).filter(key => page[key]?.type === 'files');
  for (const key of keys) {
    for (const item of page[key]) {
      const fileId = nanoid();
      const fileName = `${fileId}${item.name}`;

      // Download file, generate new UUID and save locally
      const f = await(await fetch(item.url)).arrayBuffer();
      await Deno.writeFile(`${Deno.cwd()}/app/content/${dbId}/${fileName}`, new Uint8Array(f));
      
      // Create a smaller thumbnail
      const img: Image = await Image.decode(f);
      const ico: Uint8Array = await img.resize(600, Image.RESIZE_AUTO).encodeJPEG();
      await Deno.writeFile(`${Deno.cwd()}/app/icon/${dbId}/${fileId}.jpg`, ico);

      // Update item with new paths
      item.url = `https://db.lahs.club/content/${dbId}/${fileName}`;
      item.icon = `https://db.lahs.club/icon/${dbId}/${fileId}.jpg`;
    }
  }
}