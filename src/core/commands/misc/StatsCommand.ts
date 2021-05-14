import { command, MandrocCommand, Embed } from "@lib";
import type { Message } from "discord.js";
import fetch from "node-fetch";
import { config } from "@lib";
import moment from "moment";

@command("stats", {
  aliases: ["stats", "statistics"],
  description: "Displays social stats for Menudocs!"
})
export default class StatsCommand extends MandrocCommand {
  private queries = [
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCpGGFqJP9vYvzFudqnQ-6IA&key=${config.get<string>("apis.youtube")}`,
    `https://www.googleapis.com/youtube/v3/search?part=snippet,id&maxResults=5&channelId=UCpGGFqJP9vYvzFudqnQ-6IA&key=${config.get<string>("apis.youtube")}&order=date`
  ];

  public async exec(message: Message) {
    const requests = this.queries.map((x) => fetch(x).then((result) => result.json()));
    const [ytStats, ytBody] = await Promise.all(requests);

    const {
      statistics: { subscriberCount, videoCount }
    } = ytStats.items[0];
    const {
      id: { videoId },
      snippet: { publishedAt }
    } = ytBody.items[0];


    return message.util?.send(Embed.Primary()
      .addField("Youtube", [
        `MenuDocs has **${subscriberCount}** subscribers and has uploaded **${videoCount}** videos!\n`,
        `❯ [Latest Video](https://www.youtube.com/watch?v=${videoId}) | *Published at: ${moment(publishedAt).format("MMMM Do YYYY")}*`,
        `❯ [D.JS Series](https://www.youtube.com/watch?v=8qvO24Uqfps&list=PLWnw41ah3I4aduzCTL98zw8PbDO6rGsWm)`,
        `❯ [JDA4 Series](https://www.youtube.com/playlist?list=PLWnw41ah3I4YxBetY8iCa-b9t1JwV2jsW)`,
        `❯ [D.PY Series](https://www.youtube.com/playlist?list=PLWnw41ah3I4Z3pJ3_IzohfSu4A1x37KeE)`,
        `❯ [All Playlists](https://www.youtube.com/c/MenuDocs/playlists)`
      ])
      .setThumbnail(message.guild?.iconURL({ dynamic: true })!)
    );
  }
}
