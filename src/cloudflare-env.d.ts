declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
  export class DurableObject<Env = unknown> {
    protected env: Env;
    protected ctx: unknown;
  }
}

interface DurableObjectNamespace<T> {
  idFromName(name: string): unknown;
  get(id: unknown, options?: { locationHint?: string }): { fetch(request: Request): Promise<Response> };
}

interface D1Result<T> {
  results: T[];
  meta: { changes: number; last_row_id: number };
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result<unknown>>;
}

interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
}

declare module "vinext/server/fetch-handler" {
  const handler: { fetch(request: Request, env: unknown, ctx: unknown): Promise<Response> };
  export default handler;
}
