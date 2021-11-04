
import {
  config,
  clubs,
  Application,
  Router,
  send
} from './deps.ts';

const app = new Application();
const router = new Router();
router
  .get('/club/:id', (ctx) => {
    ctx.response.headers.set('Content-Type', 'application/json');
    ctx.response.body = clubs.find(c => c.id === ctx.params.id);
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

