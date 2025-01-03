import { ChatInputCommand, Command } from "@sapphire/framework";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  TextChannel,
  time,
} from "discord.js";

import colours from "../constants/colours.js";
import generateName from "../functions/generateName.js";

export class SandboxCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: "sandbox",
      description: "Create a sandboxed server that the bot owns.",
    });
  }

  public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .setDefaultMemberPermissions(0)
          .addStringOption((option) => option.setName("name").setDescription("The name for the server"))
          .addStringOption((option) =>
            option.setName("template").setDescription("A template url or code to create the server with"),
          )
          .addBooleanOption((option) =>
            option.setName("hide").setDescription("Whether to hide the response (default: true)"),
          ),
      {
        idHints: [],
      },
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const name = interaction.options.getString("name") ?? generateName();
    const templateUrl = interaction.options.getString("template") ?? "WjsDtfwPsxbU";
    const hide = interaction.options.getBoolean("hide") ?? true;

    if (interaction.client.guilds.cache.size >= 10) {
      return await interaction.reply({
        content:
          "The bot cannot create a server because the bot is in 10 or more servers. This is a Discord limitation.",
        flags: hide ? MessageFlags.Ephemeral : undefined,
      });
    }

    const template = await interaction.client.fetchGuildTemplate(templateUrl).catch(() => undefined);
    if (!template) {
      return await interaction.reply({
        content: `You provided an invalid server template.`,
        flags: hide ? MessageFlags.Ephemeral : undefined,
      });
    }

    await interaction.deferReply({ flags: hide ? MessageFlags.Ephemeral : undefined });

    const guild = await template.createGuild(name, interaction.client.user.displayAvatarURL({ forceStatic: true }));

    const possibleBotRole = guild.roles.cache.find((r) => r.name === "Bot");
    if (possibleBotRole) await guild.members.me?.roles.add(possibleBotRole);

    const channel =
      guild.systemChannel ??
      (guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).first() as TextChannel);

    const embed = new EmbedBuilder()
      .setColor(colours.blue)
      .setTitle("Welcome to your sandbox!")
      .setDescription(`This is a sandbox created by ${interaction.user} on ${time(new Date())}.`)
      .addFields(
        { name: "Name", value: name, inline: true },
        { name: "Template", value: `[${template.name}](${template.url})`, inline: true },
      );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("sb:admin").setLabel("Toggle Admin").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("sb:pause").setLabel("Pause Invites").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("sb:owner").setLabel("Transfer Ownership").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("sb:delete").setLabel("Delete Sandbox").setStyle(ButtonStyle.Danger),
    );

    const invite = await guild.invites.create(channel, { maxAge: 0 });
    (await channel.send({ content: `Limitless invite link: ${invite}`, embeds: [embed], components: [row] })).pin();

    return await interaction.editReply(`Sandbox server **${guild}** (\`${guild.id}\`) has been created: ${invite.url}`);
  }
}
