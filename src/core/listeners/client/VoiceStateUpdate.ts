import { Listener } from "discord-akairo";
import { listener } from "@lib";
import type { VoiceState, TextChannel } from "discord.js";
import { IDs } from "@lib";

@listener("voice-state-update", {
  event: "voiceStateUpdate",
  emitter: "client"
})
export default class VoiceStateUpdateListener extends Listener {
  async exec(oldState: VoiceState, newState: VoiceState) {
    const newMemberChannel = newState.channel;
    const oldMemberChannel = oldState.channel;
    const newMember = newState.member;
    const oldMember = oldState.member;
    const voiceTextChannel = <TextChannel>(
      this.client.channels.cache.get(IDs.VOICE_TEXT_CHANNEL)
    );

    //Check if the member can be managed by Mandroc
    if (!oldMember?.manageable || !newMember?.manageable) return;

    //Check if a member joins a voice channel | leaves a voice channel
    if (!oldMemberChannel && newMemberChannel) {
      //Grant member "VIEW_CHANNEL permission"
      await voiceTextChannel!.overwritePermissions([
        {
          id: newMember!.id,
          allow: ["VIEW_CHANNEL"]
        }
      ]);
    } else if (!newMemberChannel) {
      //Revoke member "VIEW_CHANNEL" permission
      await voiceTextChannel!.overwritePermissions([
        {
          id: oldMember!.id,
          deny: ["VIEW_CHANNEL"]
        }
      ]);
    }
    return;
  }
}
