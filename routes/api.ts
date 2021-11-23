
import { clubs, Router } from '../deps.ts';
import { cachePages, cacheText, createThumbnails, refreshDir } from '../services/cache.ts';
import { flattenDb, flattenResult } from '../services/flatten.ts';
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
      // Perform metadata check to see if DB needs to be updated
      const db = flattenDb(await getDatabase(dbId));
      try {
        const metaDb = JSON.parse(await Deno.readTextFile(`./app/meta/${dbId}.json`));
        if (db.last_edited_time !== metaDb.last_edited_time)
          throw new Error();
        else persistence.log(club.id, `${club.short}:${dbId} is up to date`);
        continue;
      } catch (e) {
        persistence.log(club.id, `Updating ${club.short}:${dbId}`);
      }

      // Query Notion database and flatten
      let res = await queryDatabase(dbId, undefined);
      let pages = flattenResult(res);
      while (res.next_cursor) {
        persistence.log(club.id, `Querying ${club.short}:${dbId} for more pages`);
        res = await queryDatabase(dbId, res.next_cursor);
        pages.push(...flattenResult(res));
      }

      // Delete and recreate cache dir (invalidate old files)
      await refreshDir(`/content/${dbId}`);
      await refreshDir(`/icon/${dbId}`);

      // Find properties with files and cache them
      await cachePages(dbId, pages);

      // Cache and save the flat response with updated URLs
      await cacheText(`/meta/${dbId}.json`, JSON.stringify(db));
      await cacheText(`/cache/${dbId}.json`, JSON.stringify(pages));

      // Create thumbnails for images
      await createThumbnails(club.id, dbId);
    }
    
    persistence.endProcess(club.id, `Publishing ${club.short}`);
    ctx.response.status = 204;
  });