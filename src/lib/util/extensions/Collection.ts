/*
 * Copyright (c) MenuDocs 2021.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Collection } from "discord.js";

Reflect.defineProperty(Collection.prototype, "multipleRandom", {
  value(this: Collection<any, any>, amount: number) {
    amount = Math.min(amount, this.size);

    const taken = [];
    while (amount--) {
      taken.push(this.random());
    }

    return taken;
  },
});
