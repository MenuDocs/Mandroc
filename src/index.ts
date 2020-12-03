/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import "reflect-metadata";
import "module-alias/register";

import { Mandroc } from "@lib";
import { Logger } from "@ayanaware/logger";

const main = Logger.get("main");
const mandroc = new Mandroc();

(() => mandroc.launch())().catch((e) => {
  main.error(e);
  process.exit(1);
});
