import { AkairoHandler, AkairoHandlerOptions } from "discord-akairo";
import { captureException } from "@sentry/node";

import { Resolver } from "./Resolver";

import type { Mandroc } from "../../Client";

export class ResolverHandler extends AkairoHandler {
  constructor(client: Mandroc, options: AkairoHandlerOptions = {}) {
    super(client, {
      classToHandle: Resolver,
      ...options
    });
  }

  register(resolver: Resolver<any>) {
    resolver.handler = this;
    resolver.client = this.client;
    this.modules.set(resolver.id, resolver);

    this.client.commandHandler.resolver.addType(
      resolver.name,
      async (message, phrase) => {
        try {
          return await resolver.exec.bind(resolver)(message, phrase);
        } catch (e) {
          captureException(e);
          this.client.log.error(e);
        }
      }
    );
  }
}
