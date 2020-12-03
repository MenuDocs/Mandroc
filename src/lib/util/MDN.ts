/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import fetch from "node-fetch";

export namespace MDN {
  export interface Resource {
    id: number;
    label: string;
    locale: string;
    modified: string;
    slug: string;
    subpages: Resource[];
    summary: string;
    tags: string[];
    title: string;
    translations: Resource[];
    uuid: string;
    url: string;
  }

  const keyed = {} as Record<string, Resource>;

  const loadResource = (base: Record<string, Resource>, resource: Resource) => {
    base[resource.title] = resource;
    if (resource.subpages) {
      for (let i = 0; i < resource.subpages.length; i++) {
        loadResource(base, resource.subpages[i]);
      }
    }

    return base;
  };

  export const load = async () => {
    const endpoints: string[] = [
      "Global_Objects",
      "Operators",
      "Statements",
      "Functions",
      "Classes",
      "Errors",
    ];

    let raw = {} as Record<string, Resource>;

    for (const endpoint of endpoints) {
      const data: Resource = await (
        await fetch(
          `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/${endpoint}$children?expand`
        )
      ).json();

      raw = loadResource(raw, data);
    }

    for (let key of Object.keys(raw)) {
      if (key.includes(".prototype")) {
        let hash = key.replace(".prototype", "#");
        keyed[hash] = raw[key];
      }

      keyed[key] = raw[key];
    }

    return null;
  };

  export const search = (query: string): Resource | null => {
    query = query.toLowerCase();
    const found = Object.entries(keyed).find(([k, data]) =>
      [k, data.title.toLowerCase()].includes(query)
    );
    return found?.[1] ?? null;
  };
}
