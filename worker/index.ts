import { DurableObject } from "cloudflare:workers";
import handler from "vinext/server/fetch-handler";

type Env = { RENDERER: DurableObjectNamespace<SiteRenderer> };

/**
 * Renders the whole site. A Worker on the free plan gets 10 ms of CPU per request, which
 * React rendering regularly exceeds (Error 1102). A Durable Object gets 30 seconds on the
 * same free plan, so the front Worker below only passes requests in here.
 */
export class SiteRenderer extends DurableObject<Env> {
  fetch(request: Request) {
    return handler.fetch(request, this.env, this.ctx);
  }
}

export default {
  fetch(request: Request, env: Env) {
    return env.RENDERER.get(env.RENDERER.idFromName("site"), { locationHint: "apac" }).fetch(request);
  },
};
