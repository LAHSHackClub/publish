
import { nanoid, Image } from '../deps.ts';
import { Flattened } from "../schemas/mod.ts";

/* Convenience aliases for Deno file functions */
const root = `${Deno.cwd()}/app`;
export async function cacheFile(path: string, data: Uint8Array): Promise<void> {
  return Deno.writeFile(`${root}/${path}`, data);
}
export async function cacheText(path: string, data: string): Promise<void> {
  return Deno.writeTextFile(`${root}/${path}`, data);
}
export async function refreshDir(dir: string): Promise<void> {
  await Deno.remove(`${root}/${dir}`, { recursive: true });
  await Deno.mkdir(`${root}/${dir}`, { recursive: true });
}

/* Caching service */
export async function cachePages(dbId: string, pages: Flattened[]): Promise<void> {
  for (const page of pages)
    await cachePage(dbId, page);
}

async function cachePage(dbId: string, page: Flattened): Promise<void> {
  const keys = Object.keys(page).filter(k => page[k]?.type === 'files');
  for (const key of keys) {
    for (const item of page[key]) {
      const fileId = nanoid();
      const fileName = `${fileId}${item.name}`;
      try {
        // Get file data
        const f = await(await fetch(item.url)).arrayBuffer();

        // Create a smaller thumbnail
        const img = await Image.decode(f);
        img.resize(600, Image.RESIZE_AUTO).encodeJPEG()
          .then(ico => cacheFile(`/icon/${dbId}/${fileId}.jpg`, ico));
        item.icon = `https://db.lahs.club/icon/${dbId}/${fileId}.jpg`;
        // Update item with new paths
        item.url = `https://db.lahs.club/content/${dbId}/${fileName}`;

        // Save locally
        await cacheFile(`/content/${dbId}/${fileName}`, new Uint8Array(f));
      }
      catch (e) {
        console.log(`[LOG] ${dbId}:${fileId} is not a supported image - skipping`);
      }
    }
  }
}