/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import "dotenv/config";
import "module-alias/register";

import { config, Mandroc } from "@lib";
import { Logger } from "@ayanaware/logger";
import { captureException, init } from "@sentry/node";

init({
  dsn: config.get("dsn"),
  tracesSampleRate: 1.0,
  maxBreadcrumbs: 30,
  environment: process.env.NODE_ENV,
  release: require("../package.json").version,
});

const main = Logger.get("main");
(() => new Mandroc().launch())().catch((e) => {
  main.error(e);
  captureException(e);
});
