import { ChatInputCommandErrorPayload, Events, Listener } from "@sapphire/framework";

import { handleCommandError } from "../../functions/handleError.js";

export class ChatInputCommandErrorListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      once: false,
      event: Events.ChatInputCommandError,
    });
  }
  public async run(error: Error, { interaction }: ChatInputCommandErrorPayload) {
    const messageUrl = await handleCommandError(
      error,
      `Caught exception in a slash command (/${interaction.commandName})`,
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
