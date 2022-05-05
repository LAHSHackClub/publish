
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
  const metaDb = JSON.parse(await Deno.readTextFile(`./app/meta/${dbId}.json`));
  const keys = Object.keys(metaDb.properties).filter(p => metaDb.properties[p] === 'files');
  for (const page of pages)
    await cachePage(dbId, page, keys);
}

async function cachePage(dbId: string, page: any, keys: string[]): Promise<void> {
  for (const key of keys) {
    for (const item of page[key]) {
      if (item.type !== 'file') continue;

      const fId = nanoid();
      const fType = item.name.split('.').pop();
      const fPath = `${dbId}/${fId}.${fType}`;
      const f = await(await fetch(item.url)).arrayBuffer();

      // Update item with new data
      item.id = fId;
      item.name = `${fId}.${fType}`;
      item.icon = `https://db.lahs.club/icon/${dbId}/${fId}.webp`;
      item.url = `https://db.lahs.club/view/${dbId}/${fId}.webp`;
      item.original = `https://db.lahs.club/content/${dbId}/${fId}.${fType}`;

      // Save locally
      await cacheFile(`content/${fPath}`, new Uint8Array(f));
    }
  }
}

export async function processCache(dbId: string, pages: any[]) {
  const metaDb = JSON.parse(await Deno.readTextFile(`./app/meta/${dbId}.json`));
  const keys = Object.keys(metaDb.properties).filter(p => metaDb.properties[p] === 'files');
  for (const page of pages) {
    for (const key of keys) {
      for (const item of page[key]) {
        if (!item || item.type !== 'file') continue;
        
        const fType = item.name.split('.')[1];
        const fId = item.name.split('.')[0];
        await createThumbnail(dbId, fId, fType);
        await createView(dbId, fId, fType);
      }
    }
  }
}

async function createThumbnail(dbId: string, fId: string, fType: string) {
  const nodePath = './services/image/node.js';
  // Creates 600px thumbnail
  await Deno.run({
    cmd: ['node', nodePath,
      '-f', `${root}/content/${dbId}/${fId}.${fType}`,
      '-o', `${root}/icon/${dbId}/${fId}.webp`,
      '-w', '600',
    ]
  }).status();
}

async function createView(dbId: string, fId: string, fType: string) {
  const nodePath = './services/image/node.js';
  // Creates 4K view image
  await Deno.run({
    cmd: ['node', nodePath,
      '-f', `${root}/content/${dbId}/${fId}.${fType}`,
      '-o', `${root}/view/${dbId}/${fId}.webp`,
      '-w', '3840',
    ]
  }).status();
}