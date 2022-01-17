
import { nanoid } from '../deps.ts';

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
export async function cachePages(dbId: string, pages: any[]): Promise<void> {
  for (const page of pages)
    await cachePage(dbId, page);
}

async function cachePage(dbId: string, page: any): Promise<void> {
  const metaDb = JSON.parse(await Deno.readTextFile(`./app/meta/${dbId}.json`));
  const keys = Object.keys(metaDb.properties).filter(p => metaDb.properties[p] === 'files');
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
      item.icon = `https://db.lahs.club/icon/${dbId}/${fId}.webp`;

      // Save locally
      await cacheFile(`content/${fPath}`, new Uint8Array(f));
      createThumbnail(dbId, fId, fType);
    }
  }
}

export async function createThumbnail(dbId: string, fId: string, fType: string) {
  const nodePath = './services/image/node.js';
  Deno.run({
    cmd: ['node', nodePath,
      '-f', `${root}/content/${dbId}/${fId}.${fType}`,
      '-o', `${root}/icon/${dbId}/${fId}.webp`
    ]
  });
}