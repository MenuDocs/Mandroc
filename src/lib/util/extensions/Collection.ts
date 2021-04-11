import { Collection } from "discord.js";

Reflect.defineProperty(Collection.prototype, "randomAmount", {
  value(this: Collection<any, any>, amount: number) {
    amount = Math.min(amount, this.size);

    const taken = new Collection();
    for (let i = 0; i < amount; i++) {
      const randomKey = this.filter((_, k) => !taken.has(k)).randomKey();

      taken.set(randomKey, this.get(randomKey));
    }

    return taken;
  }
});
