import { ContextMenuCommandErrorPayload, Events, Listener } from "@sapphire/framework";

import { handleCommandError } from "../../functions/handleError.js";

export class ContextMenuCommandErrorListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      once: false,
      event: Events.ContextMenuCommandError,
    });
  }
  public async run(error: Error, { interaction }: ContextMenuCommandErrorPayload) {
    const messageUrl = await handleCommandError(
      error,
      `Caught exception in a context menu command (${interaction.commandName})`,
      interaction.channelId,
    );

    const text = `An error occurred while executing this command. See: ${messageUrl}`;

    if (!interaction.replied) {
      return await interaction.reply(text);
    } else if (interaction.deferred) {
      return await interaction.editReply(text);
    } else {
      return await interaction.followUp(text);
    }
  }
}
