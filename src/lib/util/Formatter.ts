import { Color, DEFAULT_FORMATTER_COLORS, DefaultFormatter, DefaultFormatterColor, Logger, LogLevel, LogMeta } from "@ayanaware/logger";
import colors from "ansi-styles";

const { dim, gray } = colors;
const { LOG_PACKAGE_PATH, LOG_TIMESTAMP } = DefaultFormatterColor;

DEFAULT_FORMATTER_COLORS.set(LOG_PACKAGE_PATH, Color.BRIGHT_BLUE).set(
  LOG_TIMESTAMP,
  Color.GRAY
);

export class Formatter extends DefaultFormatter {
  protected formatLevel(level: Exclude<LogLevel, LogLevel.OFF>): string {
    // const figures = {
    //   [LogLevel.TRACE]: "✈️",
    //   [LogLevel.DEBUG]: "🚧",
    //   [LogLevel.ERROR]: "💢",
    //   [LogLevel.INFO]: "📜",
    //   [LogLevel.WARN]: "⚠️",
    // };

    return `${super.formatLevel(level).toLowerCase()}`;
  }

  protected formatUniqueMarker(uniqueMarker?: string): string {
    return uniqueMarker
      ? `${gray.open}›${gray.close}${dim.open}${uniqueMarker}${dim.close}`
      : "";
  }

  protected formatPackagePath(packagePath: string, name: string): string {
    return `${gray.open}(${this["colors"].get(LOG_PACKAGE_PATH)(
      `${packagePath}${name}`
    )}${gray.open})${gray.close}`;
  }

  protected formatOrigin(origin: Logger, uniqueMarker?: string): string {
    const pn = this.formatPackageName(origin.packageName),
      um = this.formatUniqueMarker(uniqueMarker),
      pp = this.formatPackagePath(origin.packagePath, origin.name);

    return `${pn}${um} ${pp}`;
  }

  protected formatMessage(meta: Readonly<LogMeta>, message: string): string {
    return `${this.formatTimestamp()} ${this.formatLevel(
      meta.level
    )} ${this.formatOrigin(meta.origin, meta.uniqueMarker)}: ${message}`;
  }
}

Logger.setFormatter(new Formatter());
Logger.getDefaultTransport().setLevel(
  process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.TRACE
);
