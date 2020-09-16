import "reflect-metadata";
import "module-alias/register";

import signale from "signale";
import { Mandroc } from "@lib";

new Mandroc()
  .launch()
  .catch((e) => signale.fatal(e));
