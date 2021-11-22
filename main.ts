
import {
  clubs,
  Application,
  Router,
  send
} from './deps.ts';
import { cachePages } from './services/cache.ts';
import { flatten } from './services/flatten.ts';
import { getDatabase, queryDatabase } from './services/notion.ts';

/* Startup - ensure needed directories exist */
await Deno.mkdir(`./app/cache`, { recursive: true });
await Deno.mkdir(`./app/meta`, { recursive: true });
clubs.forEach(async club => {
  club.databases.forEach(async (dbId: string) => {
    await Deno.mkdir(`./app/content/${dbId}`, { recursive: true });
  });});
console.log(`[EVT] Completed setup at ${new Date().toUTCString()}`);

/* Application logic */
const app = new Application();
const router = new Router();
router
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
    console.log(`[EVT] Publishing ${club.short} at ${new Date().toUTCString()}`);

    for (const dbId of club.databases) {
      // Perform metadata check to see if DB needs to be updated
      const db = await getDatabase(dbId);
      try {
        const metaDb = JSON.parse(await Deno.readTextFile(`./app/meta/${dbId}.json`));
        if (db.last_edited_time !== metaDb.last_edited_time) throw new Error();
        else console.log(`[LOG] ${club.short}:${dbId} is up to date`);
        continue;
      } catch (e) { console.log(`[LOG] Updating ${club.short}:${dbId}`); }

      // Query Notion database and flatten
      let res = await queryDatabase(dbId);
      let pages: any[] = flatten(res);
      while (res.next_cursor) {
        console.log(`[LOG] Querying ${club.short}:${dbId} for more pages`);
        res = await queryDatabase(dbId, res.next_cursor);
        pages.push(...flatten(res));
      }

      // Remove existing cache and recreate dir (nanoid will invalidate old files)
      await Deno.remove(`./app/content/${dbId}`, { recursive: true });
      await Deno.mkdir(`./app/content/${dbId}`, { recursive: true });
      // Find properties with files and cache them
      await cachePages(dbId, pages);

      // Cache and save the flat response with updated URLs
      await Deno.writeTextFile(`./app/meta/${dbId}.json`, JSON.stringify(db));
      await Deno.writeTextFile(`./app/cache/${dbId}.json`, JSON.stringify(pages));
    }
    
    console.log(`[EVT] Finished publishing ${club.short} at ${new Date().toUTCString()}`);
    ctx.response.status = 204;
  });

app.use(router.routes());
app.use(router.allowedMethods());

/* Static file serving (publish widget + usercontent) */
app.use(async (ctx) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  await send(ctx, ctx.request.url.pathname, {
    root: `${Deno.cwd()}/app`,
    index: 'index.html',
  });
})

console.log(`[EVT] Listening on :8000`);
await app.listen({ port: 8000 });
