import "dotenv/config";

import process from "node:process";

import { SapphireClient } from "@sapphire/framework";
import { Collection, Snowflake, version } from "discord.js";

import { intents } from "./constants/intents.js";
import { partials } from "./constants/partials.js";
import envVarCheck from "./functions/envCheck.js";
import { handleCommandError } from "./functions/handleError.js";
import Logger from "./logger.js";

// Logger
export const logger = new Logger();
logger.info("Logger initialised.");
logger.info(`Using Node.js version ${process.versions.node}`);
logger.info(`Using discord.js version ${version}`);

// Environment variables
export const env = envVarCheck(process.env);
logger.info(`Node environment: ${env.NODE_ENV}`);

// Sapphire client
export const client = new SapphireClient({
  intents,
  partials,
  defaultPrefix: env.COMMAND_PREFIX || ">",
  loadMessageCommandListeners: true,
  allowedMentions: { repliedUser: false },
});

client.login(env.DISCORD_TOKEN);

// Create collections
export const botGuests = new Collection<Snowflake, Date | null>();

// Catch uncaught errors
process.on("unhandledRejection", async (err) => {
  logger.error("Encountered an unhandled promise rejection:", err);
  await handleCommandError(err, `Uncaught promise rejection`);
});
process.on("uncaughtException", async (err) => {
  logger.error("Encountered an uncaught exception:", err);
  await handleCommandError(err, `Uncaught exception`);
});
