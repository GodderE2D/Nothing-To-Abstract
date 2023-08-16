import { ChatInputCommand } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { time } from "discord.js";
import ms from "ms";

import { botGuests, env } from "../index.js";

export class GuestCommand extends Subcommand {
  public constructor(context: Subcommand.Context, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: "guest",
      description: "Manage guests using the bot",
      subcommands: [
        { name: "list", chatInputRun: "chatInputList" },
        { name: "add", chatInputRun: "chatInputAdd" },
        { name: "remove", chatInputRun: "chatInputRemove" },
        { name: "clear", chatInputRun: "chatInputClear" },
      ],
    });
  }

  public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .setDefaultMemberPermissions(0)
          .addSubcommand((command) =>
            command
              .setName("list")
              .setDescription("See all guests using the bot.")
              .addBooleanOption((option) =>
                option.setName("hide").setDescription("Whether to hide the reply (default: true)"),
              ),
          )
          .addSubcommand((command) =>
            command
              .setName("add")
              .setDescription("Add a guest to use the bot for this session.")
              .addUserOption((option) =>
                option.setName("user").setDescription("The user to add as a guest").setRequired(true),
              )
              .addStringOption((option) =>
                option
                  .setName("expires")
                  .setDescription("When to remove guest access (e.g. 1d12h, default: session end)"),
              )
              .addBooleanOption((option) =>
                option.setName("hide").setDescription("Whether to hide the reply (default: true)"),
              ),
          )
          .addSubcommand((command) =>
            command
              .setName("remove")
              .setDescription("Remove a guest from using the bot.")
              .addUserOption((option) =>
                option.setName("user").setDescription("The user to remove as a guest").setRequired(true),
              )
              .addBooleanOption((option) =>
                option.setName("hide").setDescription("Whether to hide the reply (default: true)"),
              ),
          )
          .addSubcommand((command) =>
            command
              .setName("clear")
              .setDescription("Clear all guests from using the bot.")
              .addBooleanOption((option) =>
                option.setName("hide").setDescription("Whether to hide the reply (default: true)"),
              ),
          ),
      {
        idHints: [],
      },
    );
  }

  public async chatInputList(interaction: Subcommand.ChatInputCommandInteraction) {
    const hide = interaction.options.getBoolean("hide") ?? true;
    botGuests.sweep((date) => (date?.getTime() ?? Infinity) <= Date.now());

    return await interaction.reply({
      content:
        botGuests
          .map((expiresAt, userId) => `- <@${userId}> (expires ${expiresAt ? time(expiresAt, "R") : "at session end"})`)
          .join("\n") || "No guests found.",
      ephemeral: hide,
    });
  }

  public async chatInputAdd(interaction: Subcommand.ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user", true);
    const expires = ms(interaction.options.getString("expires") ?? "0");
    const hide = interaction.options.getBoolean("hide") ?? true;

    if (env.BOT_OWNER_IDS.split(",").includes(user.id)) {
      return await interaction.reply({ content: `${user} is already a bot owner.`, ephemeral: hide });
    }

    botGuests.set(user.id, expires ? new Date(Date.now() + expires) : null);

    return await interaction.reply({
      content: `${user} can now use the bot as a guest until ${
        expires
          ? `${time(new Date(Date.now() + expires))} (${time(new Date(Date.now() + expires), "R")})`
          : "session end"
      }.\n**⚠️ Warning: Guests can run all commands, including eval!**`,
      ephemeral: hide,
    });
  }

  public async chatInputRemove(interaction: Subcommand.ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user", true);
    const hide = interaction.options.getBoolean("hide") ?? true;
    botGuests.sweep((date) => (date?.getTime() ?? Infinity) <= Date.now());

    if (!botGuests.has(user.id)) {
      return await interaction.reply({ content: `${user} is not a guest.`, ephemeral: hide });
    }

    botGuests.delete(user.id);

    return await interaction.reply({
      content: `${user} has been removed as a guest.`,
      ephemeral: hide,
    });
  }

  public async chatInputClear(interaction: Subcommand.ChatInputCommandInteraction) {
    const hide = interaction.options.getBoolean("hide") ?? true;
    botGuests.sweep((date) => (date?.getTime() ?? Infinity) <= Date.now());

    const originalSize = botGuests.size;
    botGuests.clear();

    return await interaction.reply({
      content: `${originalSize} users have been removed as a guest.`,
      ephemeral: hide,
    });
  }
}
