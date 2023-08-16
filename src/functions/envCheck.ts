import process from "node:process";

import { z } from "zod";

import { logger } from "../index.js";

const envVarCheck = (env: NodeJS.ProcessEnv = process.env) => {
  const schema = z.object({
    DISCORD_TOKEN: z.string(),
    BOT_OWNER_IDS: z.string(),
    ERROR_LOGS_CHANNEL_ID: z.string(),
    COMMAND_PREFIX: z.string().optional(),
    NODE_ENV: z.enum(["development", "production"]),
  });

  const parsedEnv = schema.parse(env);
  logger.info("Environment variables are valid.");

  return parsedEnv;
};

export default envVarCheck;
