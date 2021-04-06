import { Structures } from "discord.js";

class MandrocUser extends Structures.get("User") {}

Structures.extend("User", () => MandrocUser);
