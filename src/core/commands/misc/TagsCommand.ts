import { command, MandrocCommand } from "@lib";
import { Flag } from "discord-akairo";

@command("tags", {
  aliases: ["tags", "tag"],
  description: {
    content: "The tags for MenuDocs",
    examples: [
      "!tags add ask this is some content lmao",
      "!tags add jonas Jonas is dumb --embedded --category People",
      "!tags show ask",
      "!tags source ask",
      "!tags info ask",
      "!tags category ask coding",
      "!tags alias ask question",
      "!tags rename ask lmao",
      "!tags type ask embedded",
      "!tags remove ask"
    ]
  }
})
export default class TagsCommand extends MandrocCommand {
  *args() {
    const method = yield {
      default: "tag-list",
      type: [
        ["tag-list", "list", "ls"],
        ["tag-show", "show"],
        ["tag-add", "add", "create", "+"],
        ["tag-remove", "remove", "delete", "rm", "-"],
        ["tag-source", "source", "src", "showcodepls"],
        ["tag-info", "info", "inf", "i"],
        ["tag-category", "category", "cat", "c"],
        ["tag-alias", "alias", "aliases", "a"],
        ["tag-rename", "rename", "mv"],
        ["tag-type", "type", "t"],
        ["tag-restrict", "restrict"]
      ]
    };

    return Flag.continue(method);
  }
}
