export * from "./classes/Module";
export * from "./classes/Command";
export * from "./classes/Listener";

export * from "./database/entities/profile.entity";

export * from "./util/Config";
export * from "./util/constants";
export * from "./util/DotNotation";
export * from "./util/Functions";

export * from "./Client";

declare global {
  type Dictionary<V = any> = Record<string, V>;

  interface String {
    /**
     * Capitalizes the first letter of the string and makes the rest lower case.
     * @param lowerRest
     */
    capitalize(lowerRest?: boolean): string;
  }

}
