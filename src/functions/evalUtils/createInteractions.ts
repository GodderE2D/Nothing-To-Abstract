import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Message,
  MessageContextMenuCommandInteraction,
  ModalSubmitInteraction,
  StringSelectMenuBuilder,
} from "discord.js";

type Context = ChatInputCommandInteraction | ModalSubmitInteraction | MessageContextMenuCommandInteraction | Message;

export function prepareInteractions(ctx: Context) {
  return {
    button: async () => button(ctx),
    menu: async () => menu(ctx),
  };
}

export async function button(ctx: Context) {
  if (!ctx.channel?.isSendable()) throw new Error("Cannot send messages in the channel");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("test-button").setLabel("Test button").setStyle(ButtonStyle.Primary),
  );

  return await ctx.channel?.send({ components: [row] });
}

export async function menu(ctx: Context) {
  if (!ctx.channel?.isSendable()) throw new Error("Cannot send messages in the channel");

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId("test-menu").setOptions({ label: "Test option", value: "test-option" }),
  );

  return await ctx.channel?.send({ components: [row] });
}
