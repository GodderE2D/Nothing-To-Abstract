import { Command, ContextMenuCommand } from "@sapphire/framework";
import { ApplicationCommandType, InteractionReplyOptions, MessageContextMenuCommandInteraction } from "discord.js";

import evalWithUtils from "../../functions/evalWithUtils.js";
import formatEvalReply from "../../functions/formatEvalReply.js";
import parseCode from "../../functions/parseCode.js";

export class EvaluateCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: "evaluate",
      description: "Evaluate JavaScript code.",
    });
  }

  public override registerApplicationCommands(registry: ContextMenuCommand.Registry) {
    registry.registerContextMenuCommand(
      (builder) => builder.setName("Evaluate").setType(ApplicationCommandType.Message).setDefaultMemberPermissions(0),
      {
        idHints: [],
      },
    );
  }

  public override async contextMenuRun(interaction: MessageContextMenuCommandInteraction) {
    let rawArgs = interaction.targetMessage.content.split(" ").slice(1).join(" ");
    const isAnsi = rawArgs.startsWith("-a ");
    if (isAnsi) rawArgs = rawArgs.slice("-a ".length);

    await interaction.deferReply();

    const code = parseCode(rawArgs);
    const startTime = Date.now();

    try {
      const result = await evalWithUtils(code, interaction);
      await interaction.editReply(formatEvalReply<InteractionReplyOptions>(result, startTime, false, isAnsi));
    } catch (error) {
      await interaction.editReply(formatEvalReply<InteractionReplyOptions>(error, startTime, true, isAnsi));
    }
  }
}
