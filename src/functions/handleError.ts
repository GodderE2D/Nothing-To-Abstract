import { inspect } from "node:util";

import { codeBlock, cutText } from "@sapphire/utilities";
import { EmbedBuilder, Snowflake } from "discord.js";

import colours from "../constants/colours.js";
import { client, env, logger } from "../index.js";

export async function handleCommandError(error: unknown, footer: string, channel?: Snowflake) {
  if (!client.isReady()) return;

  const embed = new EmbedBuilder()
    .setColor(colours.error)
    .setDescription(codeBlock("js", cutText(inspect(error), 4096)))
    .setFooter({ text: footer })
    .setTimestamp();

  const internalChannel = client.channels.cache.get(channel ?? env.ERROR_LOGS_CHANNEL_ID);

  if (!internalChannel?.isTextBased()) {
    return logger.warn(
      `Unable to send error log message, channel ${internalChannel?.id} is not text-based or doesn't exist.`,
    );
  }

  const message = await internalChannel.send({ embeds: [embed] });
  return message.url;
}
