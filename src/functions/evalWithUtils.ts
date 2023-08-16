// Includes utility imports for eval
import d, {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MentionableSelectMenuBuilder,
  type Message,
  MessageContextMenuCommandInteraction,
  ModalBuilder,
  type ModalSubmitInteraction,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  TextInputStyle,
} from "discord.js";

import pkg from "../../package.json" assert { type: "json" };
import { botGuests, client, env, logger } from "../index.js";
import { cp, scp } from "./evalUtils/cp.js";
import { prepareInteractions } from "./evalUtils/createInteractions.js";
import { prepareHttp } from "./evalUtils/http.js";
export default async function evalWithUtils(
  input: string,
  ctx: ChatInputCommandInteraction | ModalSubmitInteraction | MessageContextMenuCommandInteraction | Message,
  type?: "default" | "f" | "fr",
) {
  // "Use" the imported variables so tsc doesn't tree-shake them
  [d, ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, EmbedBuilder];
  [MentionableSelectMenuBuilder, ModalBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, TextInputStyle, pkg];
  [botGuests, client, env, logger, cp, scp];

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const { connect, get, del, head, options, patch, post, put, trace } = prepareHttp({
    guild: ctx.guildId,
    channel: ctx.channelId,
    message: ctx.id,
    interaction: ctx.id,
    me: "author" in ctx ? ctx.author.id : ctx.user.id,
    bot: ctx.client.user.id,
  });

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const { button, menu } = prepareInteractions(ctx);

  const types = {
    default: input,
    f: `(async () => {\n${input}\n})()`,
    fr: `(async () => {\nreturn ${input}\n})()`,
  };

  return await eval(types[type ?? "default"]);
}
