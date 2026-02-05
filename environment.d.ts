declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      TCG_API_KEY: string;
      TWITCH_EXTENSION_SECRET_KEY: string;
      TWITCH_EXTENSION_CLIENT_ID: string;
      TWITCH_SHARED_SECRET: string;
      NODE_ENV: "development" | "production";
      TWITCH_DEV_USER_ID: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
