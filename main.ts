
import {
  clubs,
  Application,
  Router,
  send
} from './deps.ts';
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
      const res = await queryDatabase(dbId);
      console.log(res);
    }
    ctx.response.status = 204;
  });

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx) => {
  await send(ctx, ctx.request.url.pathname, {
    root: `${Deno.cwd()}/app`,
    index: 'index.html',
  });
})

await app.listen({ port: 8000 });

