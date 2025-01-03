import { Events, Listener, MessageCommandErrorPayload } from "@sapphire/framework";

import { handleCommandError } from "../../functions/handleError.js";

export class MessageCommandErrorListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      once: false,
      event: Events.MessageCommandError,
    });
  }
  public async run(error: Error, { command, message }: MessageCommandErrorPayload) {
    const messageUrl = await handleCommandError(
      error,
      `Caught exception in a message command (>${command.name})`,
      message.channelId,
    );

    message.reply(`An error occurred while executing this command. See: ${messageUrl}`);
  }
}
