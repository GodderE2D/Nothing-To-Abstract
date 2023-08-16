import { Args, Command } from "@sapphire/framework";
import { Message, MessageReplyOptions } from "discord.js";

import evalWithUtils from "../../functions/evalWithUtils.js";
import formatEvalReply from "../../functions/formatEvalReply.js";
import parseCode from "../../functions/parseCode.js";

export class EvCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: "eval",
      description: "Evaluate JavaScript code.",
      aliases: ["ev"],
      quotes: [],
    });
  }

  public async messageRun(message: Message, args: Args) {
    let rawArgs = await args.rest("string").catch(() => "");
    const isAnsi = rawArgs.startsWith("-a ");
    if (isAnsi) rawArgs = rawArgs.slice("-a ".length);

    const code = parseCode(rawArgs);
    const startTime = Date.now();

    try {
      const result = await evalWithUtils(code, message);
      await message.reply(formatEvalReply<MessageReplyOptions>(result, startTime, false, isAnsi));
    } catch (error) {
      await message.reply(formatEvalReply<MessageReplyOptions>(error, startTime, true, isAnsi));
    }
  }
}