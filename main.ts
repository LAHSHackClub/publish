
import {
  clubs,
  Application,
  Router,
  send
} from './deps.ts';
import { flatten } from "./services/flatten.ts";
import { queryDatabase } from './services/notion.ts';

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
    for (const dbId of club.databases) {
      // Query Notion database with ID
      const res = await queryDatabase(dbId);
      // Flatten the response
      const flat = flatten(res);
      // Cache and save the flat response
      await Deno.mkdir(`./app/cache`, { recursive: true });
      await Deno.writeTextFile(`./app/cache/${dbId}.json`, JSON.stringify(flat));

      // Cache first attached file per result
      for (const page of flat) {
        for (const key of Object.keys(page)) {
          if (page[key].type === 'files') {
            // Download file and save to usercontent folder
            const f = await(await fetch(page[key].url)).arrayBuffer();
            await Deno.mkdir(`./app/content/${dbId}`, { recursive: true });
            await Deno.writeFile(`./app/content/${dbId}/${page[key].name}`, new Uint8Array(f));
          }
        }
      }
    }
    ctx.response.status = 204;
  });

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  await send(ctx, ctx.request.url.pathname, {
    root: `${Deno.cwd()}/app`,
    index: 'index.html',
  });
})

await app.listen({ port: 8000 });

