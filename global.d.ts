declare module "bun" {
  interface Env {
    DATABASE_URL: string;
    TCG_API_KEY: string;
    TWITCH_EXTENSION_SECRET_KEY: string;
    NODE_ENV: "development" | "production";
  }
}
