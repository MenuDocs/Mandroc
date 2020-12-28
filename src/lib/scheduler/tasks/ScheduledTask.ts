import type { Mandroc } from "@lib";

export interface ScheduledTask<D extends Dictionary> {
  name: string;
  execute(client: Mandroc, meta: D, info: ScheduledTaskInfo): any;
}

export interface ScheduledTaskInfo {
  runAt: string;
  metaKey?: string;
}
