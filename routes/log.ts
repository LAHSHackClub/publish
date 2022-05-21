
import { Router } from '../deps.ts';
import { persistence } from '../services/persistence.ts';

export const logRouter = new Router();
logRouter
  .get('/log/:id', ctx => {
    ctx.response.headers.set('Content-Type', 'application/json');
    if (!ctx.params.id) ctx.throw(400);
    const p = persistence.getPersistence(ctx.params.id || "");
    if (!p) ctx.response.body = { log: ['No active process. Publishing complete!'] };
    else ctx.response.body = p;
  });