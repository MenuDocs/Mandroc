import type { Prisma } from "@prisma/client";

export interface ToolItemMetadata {
  type: "axe" | "pickaxe" | "shovel" | "fishing_rod";
}

export interface ToolMetadata extends Prisma.JsonObject {
  durability: number;
}
