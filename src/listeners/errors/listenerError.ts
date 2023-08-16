import { Events, Listener, ListenerErrorPayload } from "@sapphire/framework";

import { handleCommandError } from "../../functions/handleError.js";

export class ContextMenuCommandErrorListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      once: false,
      event: Events.ListenerError,
    });
  }
  public async run(error: Error, { piece }: ListenerErrorPayload) {
    await handleCommandError(error, `Caught exception in a listener (${piece.name})`);
  }
}
