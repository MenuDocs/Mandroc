/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { AkairoHandler, AkairoHandlerOptions } from "discord-akairo";
import { Resolver } from "./Resolver";
import { captureException } from "@sentry/node";

import type { Mandroc } from "@lib";

export class ResolverHandler extends AkairoHandler {
  constructor(client: Mandroc, options: AkairoHandlerOptions = {}) {
    super(client, {
      classToHandle: Resolver,
      ...options,
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
