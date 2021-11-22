
import {
  clubs,
  Application,
  send
} from './deps.ts';
import { apiRouter } from './routes/api.ts';

/* Startup - ensure needed directories exist */
await Deno.mkdir(`./app/cache`, { recursive: true });
await Deno.mkdir(`./app/meta`, { recursive: true });
clubs.forEach(async club => {
  club.databases.forEach(async (dbId: string) => {
    await Deno.mkdir(`./app/content/${dbId}`, { recursive: true });
    await Deno.mkdir(`./app/icon/${dbId}`, { recursive: true });
  });});
console.log(`[EVT] Completed setup at ${new Date().toUTCString()}`);

/* Application logic */
const app = new Application();

app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

/* Static file serving (publish widget + usercontent) */
app.use(async (ctx) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  try {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}/app`,
      index: 'index.html',
    });
  } catch (e) {
    console.log(`[ERR] ${e.name} - ${ctx.request.url}`);
    ctx.response.status = 404;
  }
})

/* Start server */
console.log(`[EVT] Listening on :8000`);
await app.listen({ port: 8000 });
