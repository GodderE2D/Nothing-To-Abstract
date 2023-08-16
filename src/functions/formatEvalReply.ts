import { Buffer } from "node:buffer";
import { versions as nodeVersions } from "node:process";
import { inspect } from "node:util";

import Type from "@sapphire/type";
import {
  AttachmentBuilder,
  codeBlock,
  InteractionReplyOptions,
  MessageReplyOptions,
  version as djsVersion,
} from "discord.js";

import emojis from "../constants/emojis.js";

export default function formatEvalReply<TReturn>(
  result: unknown,
  startTime: number,
  error: boolean,
  isAnsi: boolean,
): TReturn extends InteractionReplyOptions ? InteractionReplyOptions : MessageReplyOptions {
  const metadata = [
    "\n",
    error && `**(Error)**`,
    `${emojis.djs} ${djsVersion}`,
    `${emojis.nodejs} ${nodeVersions.node}`,
    `${emojis.ts} \`${new Type(result)}\``,
    `${emojis.duration} ${Math.round((Date.now() - startTime + Number.EPSILON) * 100) / 100}ms`,
  ]
    .filter(Boolean)
    .join(" ");

  const formatted = codeBlock(isAnsi ? "ansi" : "js", typeof result === "string" ? result : inspect(result)) + metadata;

  if (formatted.length > 2000) {
    return {
      content: metadata,
      files: [
        new AttachmentBuilder(Buffer.from(typeof result === "string" ? result : inspect(result)), {
          name: "result.js",
        }),
      ],
    };
  } else {
    return { content: formatted };
  }
}
