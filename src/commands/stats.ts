import { ChatInputCommand, Command } from "@sapphire/framework";
import { EmbedBuilder, MessageFlags } from "discord.js";

import colours from "../constants/colours.js";

export class StatsCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: "stats",
      description: "See statistics and information about the bot.",
    });
  }

  public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .setDefaultMemberPermissions(0)
          .addBooleanOption((option) =>
            option.setName("hide").setDescription("Whether to hide the reply (default: true)"),
          ),
      {
        idHints: [],
      },
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const hide = interaction.options.getBoolean("hide") ?? true;
    const { client } = interaction;

    const messageCount = client.channels.cache.reduce(
      (acc, channel) => acc + ("messages" in channel ? channel.messages.cache.size : 0),
      0,
    );
    const memberCount = client.guilds.cache.reduce((acc, guild) => acc + guild.members.cache.size, 0);

    const embed = new EmbedBuilder().setColor(colours.green).addFields(
      {
        name: "Bot statistics",
        value: [
          `- **Server count**: \`${client.guilds.cache.size}\``,
          `- **Member count**: \`${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}\``,
          `- **Channel count**: \`${client.channels.cache.size}\``,
        ].join("\n"),
        inline: true,
      },
      {
        name: "Cache information",
        value: [
          `- **Cached guilds**: \`${client.guilds.cache.size}\``,
          `- **Cached channels**: \`${client.channels.cache.size}\``,
          `- **Cached messages**: \`${messageCount}\``,
          `- **Cached users**: \`${client.users.cache.size}\``,
          `- **Cached members**: \`${memberCount}\``,
        ].join("\n"),
        inline: true,
      },
    );

    return await interaction.reply({
      embeds: [embed],
      flags: hide ? MessageFlags.Ephemeral : undefined,
    });
  }
}
