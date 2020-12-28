/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

export function buildString(builder: (b: Builder) => void): string {
  let str = "";

  const _b: Builder = {
    append(text: string) {
      str += text;
      return this;
    },

    appendLine(text?: string): Builder {
      if (text) {
        this.append(text);
      }

      return this.append("\n");
    },
  };

  builder(_b);
  return str;
}

interface Builder {
  appendLine(text?: string): Builder;
  append(text: string): Builder;
}
