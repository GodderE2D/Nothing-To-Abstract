const Discord = require("discord.js");
const { Type } = require("@sapphire/type");
const { inspect } = require("util");
const package = require("./package.json");
require("dotenv").config();

const AsyncFunction = async function () {}.constructor;

const client = new Discord.Client({
  intents: [
    Discord.IntentsBitField.Flags.Guilds,
    Discord.IntentsBitField.Flags.GuildMessages,
    Discord.IntentsBitField.Flags.MessageContent,
    Discord.IntentsBitField.Flags.GuildPresences,
    Discord.IntentsBitField.Flags.GuildMembers,
  ],
  allowedMentions: {
    repliedUser: false,
    roles: [],
  },
  presence: {
    activities: [
      {
        name: `${process.env.PREFIX || "void"} eval`,
        type: Discord.ActivityType.Listening,
      },
    ],
  },
});

client.once(Discord.Events.ClientReady, () => {
  console.log(
    `Logged in as ${client.user.tag}!\nStart by typing ${
      process.env.PREFIX || "void"
    } eval <code> in Discord.`
  );
});

client.on(Discord.Events.MessageCreate, async (message) => {
  if (message.author.id !== process.env.BOT_OWNER) return;
  if (!message.content.startsWith(`${process.env.PREFIX || "void"} eval`))
    return;

  const regex = /(^```(js\n)?|```$)/g; // matches code blocks
  const code = message.content
    .slice(`${process.env.PREFIX || "void"} eval `.length)
    .replace(regex, "");

  await message.react("✅");

  const oldDate = Date.now();

  try {
    const rawResult = await new AsyncFunction(
      "client",
      "message",
      "Discord",
      "package",
      "exports",
      "module",
      "require",
      code
    )(client, message, Discord, package, exports, module, require);
    const type = new Type(rawResult);

    const newDate = Date.now();

    const result = inspect(rawResult);

    const embed = new Discord.EmbedBuilder()
      .setTitle("Eval successful")
      .addFields({
        name: "Details",
        value: [
          `**Type**: ${type}`,
          `**JS Type**: ${typeof rawResult}`,
          `**Duration**: ${Math.round(newDate - oldDate)}ms (${Math.round(
            (newDate - oldDate) / 1000
          )}s)`,
          `**d.js Version**: ${Discord.version}`,
          `**Node Version**: ${process.version.slice(1)}`,
        ].join("\n"),
      })
      .setColor("Green");

    if (result.length > 4088 || Discord.embedLength(embed) > 6000) {
      console.log(
        `Eval result for command invocation message ID ${message.id}:`,
        result
      );

      embed.setDescription(
        `Result is too long (${result.length} characters). See the attached file or the console for the result.`
      );
      embed.setColor("Yellow");

      const file = new Discord.AttachmentBuilder(Buffer.from(result), {
        name: `result_${message.id}.js`,
      });

      return await message.reply({
        embeds: [embed],
        files: [file],
      });
    }

    embed.setDescription(`\`\`\`js\n${result}\`\`\``);
    return await message.reply({ embeds: [embed] });
  } catch (err) {
    console.error(
      `Eval error for command invocation message ID ${message.id}:`,
      err
    );

    const error = inspect(err);

    const embed = new Discord.EmbedBuilder()
      .setTitle("Eval failed")
      .addFields({
        name: "Details",
        value: [
          `**Duration**: ${Math.round(Date.now() - oldDate)}ms (${Math.round(
            (Date.now() - oldDate) / 1000
          )}s)`,
          `**d.js Version**: ${Discord.version}`,
          `**Node Version**: ${process.version}`,
        ].join("\n"),
      })
      .setColor("Red");

    if (error.length > 4088 || Discord.embedLength(embed) > 6000) {
      embed.setDescription(
        `Error is too long (${error.length} characters). See the attached file or the console for the error.`
      );

      const file = new Discord.AttachmentBuilder(Buffer.from(error), {
        name: `error_${message.id}.js`,
      });

      return await message.reply({
        embeds: [embed],
        files: [file],
      });
    }

    embed.setDescription(`\`\`\`js\n${error}\`\`\``);
    return await message.reply({ embeds: [embed] });
  }
});

client.login();
