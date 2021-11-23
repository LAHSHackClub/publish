
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
      if (item.type !== 'file') continue;

      const fId = nanoid();
      const fType = item.name.split('.').pop();
      const fPath = `${dbId}/${fId}.${fType}`;
      const f = await(await fetch(item.url)).arrayBuffer();

      // Update item with new data
      item.id = fId;
      item.url = `https://db.lahs.club/content/${fPath}`;

      // Save locally
      cacheFile(`/content/${fPath}`, new Uint8Array(f));
    }
  }
}

/*
async function createThumbnails() {
  Image.decode(f)
    .then(i => i.resize(600, Image.RESIZE_AUTO).encodeJPEG())
    .then(i => cacheFile(`/icon/${fPath}`, i))
    .catch(e => {
      console.log(`[LOG] ${dbId}:${fId} is not a supported image - skipping`);
    })
    .finally(() => {
      item.icon = `https://db.lahs.club/icon/${fPath}.jpg`;
    });
}*/