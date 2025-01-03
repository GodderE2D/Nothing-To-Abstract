import { ChatInputCommand } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import {
  ActionRowBuilder,
  InteractionReplyOptions,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

import evalWithUtils from "../../functions/evalWithUtils.js";
import formatEvalReply from "../../functions/formatEvalReply.js";
import parseCode from "../../functions/parseCode.js";

export class EvalCommand extends Subcommand {
  public constructor(context: Subcommand.Context, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: "eval-chat-input",
      description: "Evaluate JavaScript code.",
      subcommands: [
        { name: "script", chatInputRun: "chatInputScript" },
        { name: "modal", chatInputRun: "chatInputModal" },
      ],
    });
  }

  public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("eval")
          .setDescription(this.description)
          .setDefaultMemberPermissions(0)
          .addSubcommand((command) =>
            command
              .setName("script")
              .setDescription("Evaluate JavaScript code.")
              .addStringOption((option) =>
                option.setName("code").setDescription("The code to evaluate").setRequired(true),
              )
              .addStringOption((option) =>
                option
                  .setName("type")
                  .setDescription(
                    "Whether to wrap an async function, if so whether it should also automatically return",
                  )
                  .setChoices(
                    { name: "Default", value: "default" },
                    { name: "Wrap async function", value: "f" },
                    { name: "Wrap async function and automatically return", value: "fr" },
                  ),
              )
              .addBooleanOption((option) =>
                option.setName("ansi").setDescription("Whether to use ansi highlighting in the reply (default: false)"),
              )
              .addBooleanOption((option) =>
                option.setName("hide").setDescription("Whether to hide the reply (default: true)"),
              ),
          )
          .addSubcommand((command) =>
            command
              .setName("modal")
              .setDescription("Evaluate JavaScript code in a modal.")
              .addStringOption((option) =>
                option
                  .setName("type")
                  .setDescription(
                    "Whether to wrap an async function, if so whether it should also automatically return",
                  )
                  .setChoices(
                    { name: "Default", value: "default" },
                    { name: "Wrap async function", value: "f" },
                    { name: "Wrap async function and automatically return", value: "fr" },
                  ),
              )
              .addBooleanOption((option) =>
                option.setName("ansi").setDescription("Whether to use ansi highlighting in the reply (default: false)"),
              )
              .addBooleanOption((option) =>
                option.setName("hide").setDescription("Whether to hide the reply (default: true)"),
              ),
          ),
      {
        idHints: [],
      },
    );
  }

  public async chatInputScript(interaction: Subcommand.ChatInputCommandInteraction) {
    const hide = interaction.options.getBoolean("hide") ?? true;
    const isAnsi = interaction.options.getBoolean("ansi") ?? false;
    const code = parseCode(interaction.options.getString("code", true));
    const type = (interaction.options.getString("type") ?? undefined) as "f" | "fr" | "default" | undefined;

    await interaction.deferReply({ flags: hide ? MessageFlags.Ephemeral : undefined });
    const startTime = Date.now();

    try {
      const result = await evalWithUtils(code, interaction, type);
      await interaction.editReply(formatEvalReply<InteractionReplyOptions>(result, startTime, false, isAnsi));
    } catch (error) {
      await interaction.editReply(formatEvalReply<InteractionReplyOptions>(error, startTime, true, isAnsi));
    }
  }

  public async chatInputModal(interaction: Subcommand.ChatInputCommandInteraction) {
    const hide = interaction.options.getBoolean("hide") ?? true;
    const isAnsi = interaction.options.getBoolean("ansi") ?? false;
    const type = (interaction.options.getString("type") ?? undefined) as "f" | "fr" | "default" | undefined;

    const modal = new ModalBuilder()
      .setCustomId("eval_modal")
      .setTitle("Evaluate code")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder().setCustomId("code").setLabel("Code").setStyle(TextInputStyle.Paragraph),
        ),
      );

    await interaction.showModal(modal);
    const modalInteraction = await interaction
      .awaitModalSubmit({ time: 1000 * 60 * 14 })
      .catch(
        () => void interaction.followUp({ content: "You took too long to respond.", flags: MessageFlags.Ephemeral }),
      );

    if (!modalInteraction) return;
    await modalInteraction.reply({ content: "Evaluating...", flags: hide ? MessageFlags.Ephemeral : undefined });

    const code = parseCode(modalInteraction.fields.getTextInputValue("code"));
    const startTime = Date.now();

    try {
      const result = await evalWithUtils(code, modalInteraction, type);
      await modalInteraction.editReply(formatEvalReply<InteractionReplyOptions>(result, startTime, false, isAnsi));
    } catch (error) {
      await interaction.editReply(formatEvalReply<InteractionReplyOptions>(error, startTime, true, isAnsi));
    }
  }
}
