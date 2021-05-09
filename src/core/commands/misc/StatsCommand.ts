import { command, MandrocCommand, Embed } from "@lib";
import type { Message } from "discord.js";
import fetch from "node-fetch";
import { config } from "@lib";

@command("stats", {
  aliases: ["stats", "statistics"],
  description: "Displays social stats for Menudocs!"
})
export default class StatsCommand extends MandrocCommand {
  private queries = [
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${config.get<string>(
      "apis.youtube_channelID"
    )}&key=${config.get<string>("apis.youtube_key")}`,
    `https://www.googleapis.com/youtube/v3/search?part=snippet,id&maxResults=5&channelId=${config.get<string>(
      "apis.youtube_channelID"
    )}&key=${config.get<string>("apis.youtube_key")}&order=date`
  ];

  public async exec(message: Message) {
    return message.util?.send(
      Embed.primary("Sorry, this command is still WIP")
    );

    /**
     * TODO - ADD A FUCKING COOLDOWN
     * TODO - GET YOUTUBE | TWITCH | TWITTER API ACCESS
     * TODO - FIND OUT WHAT INFORMATION API GIVE ME ACCESS TOO
     * Embed Structure:
     *    Youtube
     *    Information
     *
     *    Twitter
     *    Information
     *
     *    Twitch
     *    Information
     *
     *    Some sort of thank you message
     *    footer
     */
    const requests = this.queries.map(x =>
      fetch(x).then(result => result.json())
    );
    const [ytStats, ytBody] = await Promise.all(requests);
    const {
      statistics: { subscriberCount, videoCount }
    } = ytStats.items[0];
    const {
      id: { videoId },
      snippet: { publishedAt }
    } = ytBody.items[0];

    return message.util?.send(
      Embed.primary()
        .addField("Youtube", [
          `MenuDocs has **${subscriberCount}** subscribers and has uploaded **${videoCount}** videos!`,
          `❯ [Latest Video](https://www.youtube.com/watch?v=${videoId}) | *Published at: ${publishedAt}*`, //format this when I can be bothered
          `❯ [D.JS Series](https://www.youtube.com/watch?v=8qvO24Uqfps&list=PLWnw41ah3I4aduzCTL98zw8PbDO6rGsWm)`,
          `❯ [JDA4 Series](https://www.youtube.com/playlist?list=PLWnw41ah3I4YxBetY8iCa-b9t1JwV2jsW)`,
          `❯ [D.PY Series](https://www.youtube.com/playlist?list=PLWnw41ah3I4Z3pJ3_IzohfSu4A1x37KeE)`,
          `❯ [All Playlists](https://www.youtube.com/c/MenuDocs/playlists)`
        ])
        .addField("Twitter", "TODO")
        .addField("Twitch", "TODO")
        .setThumbnail(message.guild?.iconURL({ dynamic: true })!)
    );
  }
}
