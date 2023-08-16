import { isGuildMember } from "@sapphire/discord.js-utilities";
import { Events, Listener } from "@sapphire/framework";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildFeature, Interaction, time } from "discord.js";

import { disableComponents } from "../functions/disableComponents.js";

export class SandboxListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      once: false,
      event: Events.InteractionCreate,
    });
  }
  public async run(interaction: Interaction) {
    if (!interaction.isButton() || !interaction.customId.startsWith("sb:")) return;

    const { guild, channel } = interaction;
    if (!interaction.inCachedGuild()) throw new Error("Sandbox button found outside of a cached guild.");
    if (!channel?.isTextBased()) throw new Error("Channel is null or not text-based.");
    if (!isGuildMember(interaction.member)) throw new Error("interaction.member is not cached.");
    if (guild?.ownerId !== interaction.client.user.id) {
      return await interaction.reply({
        content: "Please transfer ownership back to the bot to use these buttons.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    switch (interaction.customId) {
      case "sb:admin": {
        const role =
          guild.roles.cache.find((r) => r.name === "Admin (Toggled)") ??
          guild.roles.cache.find((r) => r.permissions.has("Administrator")) ??
          (await guild.roles.create({ name: "Admin (Toggled)", color: "#3498db", position: 0, hoist: true }));

        const hasRole = interaction.member.roles.cache.has(role.id);
        if (hasRole) {
          await interaction.member.roles.remove(role);
        } else {
          await interaction.member.roles.add(role);
        }

        return await interaction.editReply(`You ${hasRole ? "no longer" : "now"} have the ${role} role.`);
      }

      case "sb:pause": {
        if (!guild.features.includes(GuildFeature.Community)) {
          return await interaction.editReply("This server is not a community server and cannot have invites disabled.");
        }

        const isInvitesDisabled = guild.features.includes(GuildFeature.InvitesDisabled);
        if (isInvitesDisabled) {
          await guild.disableInvites(false);
        } else {
          await guild.disableInvites(true);
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId("sb:admin").setLabel("Toggle Admin").setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("sb:pause")
            .setLabel(`$${isInvitesDisabled ? "Disable" : "Enable"} Invites`)
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("sb:owner").setLabel("Transfer Ownership").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("sb:delete").setLabel("Delete Sandbox").setStyle(ButtonStyle.Danger),
        );

        await interaction.update({ components: [row] });

        return await interaction.followUp({
          content: `Invites for this server have been ${isInvitesDisabled ? "enabled" : "disabled"}.`,
          ephemeral: true,
        });
      }

      case "sb:owner": {
        await guild.setOwner(interaction.member);

        return await interaction.editReply("You are now the owner of this server.");
      }

      case "sb:delete": {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`confirm_delete:${interaction.id}`)
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary),
        );

        await interaction.editReply({
          content: `**💥 Deleting this sandbox ${time(new Date(Date.now() + 15_000), "R")}.**`,
          components: [row],
        });

        try {
          const buttonInteraction = await channel.awaitMessageComponent({
            filter: (i) => i.customId === `confirm_delete:${interaction.id}`,
            time: 15_000,
          });

          return await buttonInteraction.update({
            content: "Sandbox deletion cancelled.",
            components: [disableComponents(row)],
          });
        } catch {
          // Errors if time expired
          return await guild.delete();
        }
      }

      default:
        return;
    }
  }
}
