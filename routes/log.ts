
import { Router } from '../deps.ts';
import { persistence } from '../services/persistence.ts';

export const logRouter = new Router();
logRouter
  .get('/log/:id', ctx => {
    ctx.response.headers.set('Content-Type', 'application/json');
    if (!ctx.params.id) ctx.throw(400);
    try {
      const p = persistence.getPersistence(ctx.params.id || "");
      if (!p) ctx.response.body = { _log: ['No active process. Publishing complete!'] };
      else ctx.response.body = p;
    }
    catch (e) {
      // Error in getting Persistence means it doesn't exist, and thus no process is active
      ctx.response.body = { _log: ['No active process. Publishing complete!'] };
    }
  });