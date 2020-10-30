import fetch from "node-fetch";
import { Signale } from "signale";
import ms from "ms";
import { config } from "@lib";

import type { Mandroc } from "@lib";

export class Server {
  public readonly log = new Signale({ scope: "server" });

  #auth?: string;

  #interval?: NodeJS.Timeout;

  readonly #client: Mandroc;

  /**
   * @param client The client
   */
  public constructor(client: Mandroc) {
    this.#client = client;
    this.requestAuthentication().then(() => {});
    this.#interval?.refresh();
    this.encoded.bold();
  }

  /**
   * The URL of the website.
   */
  public get website(): WebsiteConfig {
    return config.get("website");
  }

  /**
   * The encoded authorization.
   * @private
   */
  private get encoded(): string {
    return Buffer.from(
      `${this.website.username}:${this.website.password}`
    ).toString("base64");
  }

  public launch() {
    this.#interval = this.#client.setInterval(async () => {
      if (!this.#auth) {
        const auth = await this.requestAuthentication();
        if (!auth) {
          this.log.warn("Couldn't fetch the authorization header.");
          return;
        }

        this.#auth = auth;
      }

      this.sendPing();
    }, ms("5s"));
  }

  private sendPing() {}

  private async requestAuthentication(): Promise<string | null> {
    try {
      const response = await fetch(`${this.website.url}/auth/local`, {
        headers: {
          authorization: `${this.website.username} ${this.website.password}`,
        },
      });

      const json = await response.json();
      console.log(json);

      return null;
    } catch (e) {
      this.log.error(e);
      return null;
    }
  }
}

interface WebsiteConfig {
  url: string;
  password: string;
  username: string;
  id: number;
}
