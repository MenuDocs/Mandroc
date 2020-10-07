import { Module } from "../Module";

export class Invites extends Module {
  public readonly priority = 2;

  /**
   * Checks for invites.
   */
  public run(): Promise<boolean> {
    return Promise.resolve(false);
  }
}