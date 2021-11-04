
import { config } from './deps.ts';  config,
  Application,
  Router,
  send
} from './deps.ts';

const app = new Application();
const router = new Router();
router
  .get('/api', (ctx) => {
    ctx.response.body = 'Hello World!';
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

