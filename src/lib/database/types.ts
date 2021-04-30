import type { Prisma } from "@prisma/client";

export interface ToolItemMetadata {
  type: "axe" | "pickaxe" | "shovel";
}

export interface ToolMetadata extends Prisma.JsonObject {
  durability: number;
}
