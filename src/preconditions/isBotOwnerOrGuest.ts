import { AllFlowsPrecondition } from "@sapphire/framework";
import { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from "discord.js";

import { botGuests, env } from "../index.js";

const FACTS = [
  "The largest planet in our solar system is Jupiter.",
  "The speed of light is approximately 299,792 kilometers per second.",
  "The Milky Way galaxy is estimated to contain over 100 billion stars.",
  "The Sun is so large that approximately 1.3 million Earths could fit inside it.",
  "The International Space Station (ISS) orbits the Earth at an average speed of about 28,000 kilometers per hour.",
  "The nearest star to our solar system is Proxima Centauri, located about 4.24 light-years away.",
  "Black holes are regions in space with extremely strong gravitational forces that nothing, not even light, can escape from.",
  "The Apollo 11 mission in 1969 was the first manned mission to land on the Moon.",
  "The Hubble Space Telescope, launched in 1990, has provided us with stunning images and valuable scientific data about the universe.",
  "The universe is believed to be approximately 13.8 billion years old.",
  "The largest known volcano in our solar system is Olympus Mons on Mars, which is about 13.6 miles (22 kilometers) high.",
  "Astronauts cannot cry in space because there is no gravity to pull tears down their faces.",
  "The coldest known place in the universe is the Boomerang Nebula, with a temperature of -272 degrees Celsius (-458 degrees Fahrenheit).",
  "The Great Red Spot on Jupiter is a massive storm that has been raging for at least 400 years.",
  "The International Space Station (ISS) orbits the Earth approximately once every 90 minutes.",
  "The Sun is about 109 times wider than Earth and about 330,000 times heavier.",
  "The first woman in space was Valentina Tereshkova from the Soviet Union, who flew aboard Vostok 6 in 1963.",
  "The Andromeda Galaxy, our closest neighboring galaxy, is on a collision course with the Milky Way and is expected to collide in about 4.5 billion years.",
  "Space is completely silent because there is no air or atmosphere to carry sound waves.",
  "The furthest humans have ever traveled from Earth was during the Apollo 13 mission, when the crew reached a distance of about 400,171 kilometers (248,655 miles) from Earth.",
];

export class IsBotOwnerOrGuestPrecondition extends AllFlowsPrecondition {
  public constructor(context: AllFlowsPrecondition.LoaderContext, options: AllFlowsPrecondition.Options) {
    super(context, {
      ...options,
      position: 20,
    });
  }

  private isAllowed(userId: Snowflake) {
    return [
      ...env.BOT_OWNER_IDS.split(","),
      botGuests.filter((date) => date?.getTime() ?? Infinity > Date.now()).keys(),
    ].includes(userId);
  }

  public override chatInputRun(interaction: ChatInputCommandInteraction) {
    if (this.isAllowed(interaction.user.id)) {
      return this.ok();
    } else {
      interaction.reply({
        content: `**\` 403 \`** ${FACTS[Math.floor(Math.random() * FACTS.length)]}`,
        ephemeral: true,
      });
      return this.error();
    }
  }

  public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
    if (this.isAllowed(interaction.user.id)) {
      return this.ok();
    } else {
      interaction.reply({
        content: `**\` 403 \`** ${FACTS[Math.floor(Math.random() * FACTS.length)]}`,
        ephemeral: true,
      });
      return this.error();
    }
  }

  public override messageRun(message: Message) {
    if (this.isAllowed(message.author.id)) {
      return this.ok();
    } else {
      return this.error();
    }
  }
}
