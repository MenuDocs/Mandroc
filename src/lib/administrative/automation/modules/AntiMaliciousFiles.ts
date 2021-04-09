import { buildString, PermissionLevel } from "@lib";

import { Module } from "../Module";
import { AntiInvites } from "./AntiInvites";

import type { Message } from "discord.js";
import { captureException } from "@sentry/node";

export class AntiMaliciousFiles extends Module {
  static ALLOWED_EXTENSIONS = [
    "png",
    "jpg",
    "jpeg",
    "webm",
    "mp4",
    "gif",
    "bmp",
    "pdf",
    "txt",
    "tif",
    "svg",
    "webp",
    "mp3",
    "flac",
    "wav",
  ];

  async run(message: Message): Promise<boolean> {
    if (message.member?.above(PermissionLevel.TrialMod)) {
      return false;
    }

    return (
      (await this._runAttachments(message)) || (await this._runLinks(message))
    );
  }

  private async _runAttachments(message: Message): Promise<boolean> {
    const malicious = message.attachments.filter(
      (a) =>
        !AntiMaliciousFiles.ALLOWED_EXTENSIONS.includes(
          a.name?.split(".").pop()!
        )
    );

    if (malicious.size) {
      message.delete().catch(captureException);
      await this.moderation.actions.queue({
        subject: message.member!,
        description: buildString((b) => {
          b.appendLine(
            `Message by **${message.author.tag}** (${
              message.author.id
            }) may contain ${
              malicious.size > 1
                ? "multiple malicious attachments"
                : "a malicious attachment"
            }.`
          ).appendLine();

          let idx = 0;
          for (const [, att] of malicious) {
            b.appendLine(
              `\`${`${idx + 1}`.padStart(2, "0")}\` ${
                att.name ? `[${att.name}](${att.proxyURL})` : att.proxyURL
              }`
            );
            idx++;
          }
        }),
        reason: "Sent a malicious link/message attachment.",
      });

      return true;
    }

    return false;
  }

  private async _runLinks(message: Message) {
    const regex = new RegExp(
      `\.(${AntiMaliciousFiles.ALLOWED_EXTENSIONS.join("|")})$`,
      "mi"
    );

    if (AntiInvites.URL_REGEXP.test(message.content)) {
      const matches = [
        ...message.content.matchAll(AntiInvites.URL_REGEXP),
      ].filter(([url]) => /\.\w+$/m.test(url) && !regex.test(url));

      if (matches.length) {
        message.delete().catch(captureException);
        await this.moderation.actions.queue({
          subject: message.member!,
          description: buildString((b) => {
            b.appendLine(
              `Message by **${message.author.tag}** (${
                message.author.id
              }) may contain ${
                matches.length > 1
                  ? "multiple malicious links"
                  : "a malicious link"
              }.`
            ).appendLine();

            matches.forEach((link, idx) => {
              b.appendLine(`\`${`${idx + 1}`.padStart(2, "0")}\` ${link}`);
            });
          }),
          reason: "Sent a malicious link/message attachment.",
        });

        return true;
      }
    }

    return false;
  }
}
