import fetch from "node-fetch";

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

export const loadResource = (
  base: Record<string, Resource>,
  resource: Resource
) => {
  base[resource.title] = resource;

  if (resource.subpages)
    for (let i = 0; i < resource.subpages.length; i++) {
      loadResource(base, resource.subpages[i]);
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
  const found = Object.values(keyed).find(
    (data) => data.title.toLowerCase() === query.toLowerCase()
  );

  return found ?? null;
};
