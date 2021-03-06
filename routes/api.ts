
import { clubs, Router } from '../deps.ts';
import { cachePages, cacheText, processCache, refreshDir } from '../services/cache.ts';
import { flattenDatabase, flattenQuery } from '../deps.ts';
import { getDatabase, queryDatabase } from '../services/notion.ts';
import { persistence } from '../services/persistence.ts';

export const apiRouter = new Router();
apiRouter
  .get('/club/:id', ctx => {
    ctx.response.headers.set('Content-Type', 'application/json');
    ctx.response.body = clubs.find(c => c.id === ctx.params.id);
  })
  .post('/club/:id', async ctx => {
    const club = clubs.find(c => c.id === ctx.params.id);
    if (!club) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'Club not found' };
      return;
    }
    persistence.startProcess(club.id, `Publishing ${club.short}`);

    for (const dbId of club.databases) {
      await dataDownloader(club, dbId);
    }

    if (club.dynamicDatabases) {
      for (const dbId of club.dynamicDatabases) {
        // Query Notion database and flatten
        let res = await queryDatabase(dbId, undefined);
        let pages = flattenQuery(res);
        while (res.next_cursor) {
          persistence.log(club.id, `Querying ${club.short}:${dbId} for more pages`);
          res = await queryDatabase(dbId, res.next_cursor);
          pages.push(...flattenQuery(res));
        }
        persistence.log(club.id, `Generating UDM ${club.short}:${dbId}`);

        for (const dynDbId of pages.map(p => p.ID)) {
          if (!dynDbId) continue;
          await dataDownloader(club, dynDbId);
        }
      }
    }
    
    persistence.endProcess(club.id, `Publishing ${club.short}`);
    ctx.response.status = 204;
  });

async function dataDownloader(club: any, dbId: string) {
  // Query Notion database and flatten
  let res = await queryDatabase(dbId, undefined);
  let pages = flattenQuery(res);
  while (res.next_cursor) {
    persistence.log(club.id, `Querying ${club.short}:${dbId} for more pages`);
    res = await queryDatabase(dbId, res.next_cursor);
    pages.push(...flattenQuery(res));
  }

  // Perform data check to see if DB needs to be updated
  const db = flattenDatabase(await getDatabase(dbId));
  try {
    const cached: any[] = JSON.parse(await Deno.readTextFile(`./app/cache/${dbId}.json`));
    const meta = JSON.parse(await Deno.readTextFile(`./app/meta/${dbId}.json`));

    if (meta.last_updated !== db.last_updated ||
        cached.length !== pages.length ||
        JSON.stringify(cached.map(p => p.last_edited_time)) !== JSON.stringify(pages.map(p => p.last_edited_time)))
      throw new Error();

    else persistence.log(club.id, `${club.short}:${dbId} is up to date`);
    return;
  } catch (e) {
    persistence.log(club.id, `Updating ${club.short}:${dbId}`);
  }

  // Save meta information
  await cacheText(`/meta/${dbId}.json`, JSON.stringify(db));

  // Delete and recreate cache dir (invalidate old files)
  await refreshDir(`/content/${dbId}`);
  await refreshDir(`/icon/${dbId}`);
  await refreshDir(`/view/${dbId}`);

  // Find properties with files and cache them
  await cachePages(dbId, pages);

  // Cache and save the flat response with updated URLs
  await cacheText(`/cache/${dbId}.json`, JSON.stringify(pages));

  // Generates thumbnails, view img
  const cache: any[] = JSON.parse(await Deno.readTextFile(`./app/cache/${dbId}.json`));
  await processCache(dbId, cache);
}