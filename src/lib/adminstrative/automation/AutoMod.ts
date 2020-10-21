import { ModLog } from "../../util/ModLog";
import { Collection, GuildMember, Message } from "discord.js";
import { InfractionType } from "../../database/entities/infraction.entity";
import { PermissionLevel } from "../../classes/Command"

import { Invites } from "./modules/Invites";
import { Slurs } from "./modules/Slurs";

import type { Module } from "./Module";
import type { Moderation } from "../Moderation";
import type { Profile } from "../../database/entities/profile.entity";

export class AutoMod {
	public readonly moderation: Moderation;

	/**
	 * The modules used to moderate messages.
	 */
	public readonly modules: Collection<string, Module>;

	/**
	 * @param moderation The moderation instance.
	 */
	public constructor(moderation: Moderation) {
		this.moderation = moderation;

		this.modules = new Collection<string, Module>()
			.set("invites", new Invites(this))
			.set("slurs", new Slurs(this));

		moderation.client.on("message", this._runModules.bind(this));
		moderation.client.on("messageUpdate", async (old, message) => {
			if (message.partial) {
				await message.fetch();
			}

			if (old.content !== message.content) {
				return this._runModules(message as Message);
			}
		});
	}

	/**
	 * Checks a profile for the warn thresholds.
	 * @param profile The profile to check.
	 * @param target The guild member of the profile.
	 */
	public runProfile(profile: Profile, target: GuildMember): ModLog | null {
		const infractions = profile.infractions + 1;
		if (infractions >= 3) {
			const modLog = new ModLog(this.moderation.client)
				.setOffender(target)
				.setModerator("automod")
				.setReason(`(AutoMod) Reached ${infractions} Infractions.`);

			if (infractions >= 5) {
				modLog.type = InfractionType.Ban;

				if (infractions === 5) {
					modLog.setDuration("1w");
				}
			} else if (infractions <= 4) {
				modLog.type = InfractionType.Mute;
				modLog.setDuration(infractions === 4 ? "1w" : "30m");
			}

			return modLog;
		}

		return null;
	}

	private async _runModules(message: Message) {
		if (message.partial) {
			await message.fetch();
		}

		if (!message.guild) {
			return;
		}

		for (const [ , module ] of this.modules) {
			const doBreak = await module.run(message);
			if (doBreak) {
				if (message.member!.permissionLevel! >= PermissionLevel.TrialMod) {
					message.channel.send(
						"wow, getting reported to management, smh admin."
					);
				}

				break;
			}
		}
	}
}
