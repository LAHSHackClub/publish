
import { nanoid, Image } from '../deps.ts';
import { persistence } from '../services/persistence.ts';
import { Flattened } from '../schemas/mod.ts';

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
      item.icon = `https://db.lahs.club/icon/${dbId}/${fId}.jpg`;

      // Save locally
      cacheFile(`/content/${fPath}`, new Uint8Array(f));
    }
  }
}

export async function createThumbnails(clubId: string, dbId: string): Promise<void> {
  persistence.startProcess(clubId, `Creating thumbnails for ${dbId}`);
  let start = new Date().getTime();
  for await (const f of Deno.readDir(`${root}/content/${dbId}`)) {
    if (!f.isFile) continue;
    const fId = f.name.split('.').shift();
    if (!fId) continue;
    await createThumbnail(clubId, dbId, fId);
    if (new Date().getTime() - start > 10000) {
      persistence.log(clubId, `Creating thumbnails for ${dbId} still in progress`);
      start = new Date().getTime();
    }
  }
  persistence.endProcess(clubId, `Creating thumbnails for ${dbId}`);
}

async function createThumbnail(cId: string, dbId: string, fId: string) {
  for await (const f of Deno.readDir(`${root}/content/${dbId}`)) {
    if (!f.isFile) continue;
    const fName = f.name.split('.').shift();
    if (fName !== fId) continue;
    await Image.decode(await Deno.readFile(`${root}/content/${dbId}/${f.name}`))
      .then(i => i.resize(600, Image.RESIZE_AUTO).encodeJPEG())
      .then(i => cacheFile(`/icon/${dbId}/${fId}.jpg`, i))
      .catch(e => persistence.log(cId, `[LOG] ${dbId}:${fId} unsupported file type - skipping`));
    return;
  }
}