/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Structures } from "discord.js";

class MandrocUser extends Structures.get("User") {}

Structures.extend("User", () => MandrocUser);
