declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    BETTER_AUTH_SECRET?: string;
  }
}
