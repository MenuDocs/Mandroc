// import { Listener } from "discord-akairo";
// import { Color, InfractionType, listener } from "@lib";
// import type { Message } from "discord.js";
// import { MessageEmbed } from "discord.js";
//
// @listener("message", { event: "message", emitter: "client" })
// export default class ReadyListener extends Listener {
//   private invitesCache: Map<string, number> = new Map<string, number>();
//
//   public async exec(message: Message) {
//     const member = message.member;
//
//     // Anti-Mod
//     if (!member?.user.bot && !member?.permissions.has("CHANGE_NICKNAME")) {
//       // Anti-Invite
//       if (message.content.includes("discord.gg")) {
//         const invites = this.invitesCache.get(member!!.id)!! + 1 || 1;
//
//         if (message.deletable) {
//           message.delete().catch((e) => this.client.log.error(e));
//         }
//
//         this.invitesCache.set(member!!.id, invites);
//
//         const embed = new MessageEmbed()
//           .setColor(Color.Warning)
//           .setDescription("Do not send invite links in here!");
//
//         message.channel.send(embed);
//
//         if (invites == 4) {
//           await member?.user.send("get banned kid").catch(this.client.log.warn);
//           member?.ban({ reason: "AutoMod™️ - Spamming invites." });
//           this.client.moderation.ban({
//             offender: message.guild?.members.cache.get(member!!.id)?.user!!,
//             moderator: this.client.user!!,
//             reason: "AutoMod™️ - Spamming invites.",
//             type: InfractionType.Ban,
//             duration: 259200000,
//           });
//         }
//       }
//
//       setInterval(
//         () =>
//           [...this.invitesCache.keys()].map((key) =>
//             this.invitesCache.delete(key)
//           ),
//         30000
//       );
//
//       // Anti-Spam
//       const mutedRole = message.guild?.roles.cache.find(
//         (role) => role.name.toLocaleLowerCase() === "muted"
//       );
//
//       const maxAge = 6e3;
//       const messages = message.channel.messages.cache.filter(
//         (msg) =>
//           msg.author.id === member?.id &&
//           Date.now() - message.createdTimestamp < maxAge
//       );
//
//       if (messages.size >= 10) {
//         if (messages.size === 10) {
//           message.channel.send(`${member}, stop spammming.`);
//         } else if (messages.size === 15) {
//           message.channel.send(`${member}, stop spamming! **Final warning!**`);
//         } else if (messages.size > 20) {
//           if (mutedRole) {
//             if (!member?.roles.cache.has(mutedRole.id)) {
//               member?.roles.add(mutedRole);
//               setTimeout(
//                 () =>
//                   member?.roles.cache.has(mutedRole.id)
//                     ? message.member?.roles.remove(mutedRole)
//                     : "",
//                 3600000
//               );
//             }
//           }
//         }
//       }
//     }
//   }
// }
