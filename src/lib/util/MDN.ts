/**
 * @file Taken from https://github.com/Anish-Shobith/mdn-api, thanks Anish
 */

import fetch from "node-fetch";
import { compareTwoStrings } from "string-similarity";

export namespace MDN {
  const BASE_URL = "https://developer.mozilla.org/api/v1/search/en-US";

  export async function search(
    query: string
  ): Promise<DocumentWithDifference[]> {
    query = query.replace(" ", "+").replace(/#/g, ".prototype.");

    const res: Result = await fetch(
      `${BASE_URL}?q=${encodeURIComponent(query)}&highlight=false`
    ).then(res => res.json());

    return res.documents
      .map(
        d =>
          ({
            ...d,
            diff: compareTwoStrings(query.toLowerCase(), d.title.toLowerCase())
          } as DocumentWithDifference)
      )
      .sort((a, b) => b.diff - a.diff);
  }

  interface Result {
    count: number;
    next: string | null;
    previous: string | null;
    query: string;
    page: number;
    pages: number;
    start: number;
    end: number;
    documents: Array<Document>;
  }

  interface Document {
    mdn_url: string;
    score: number;
    title: string;
    locale: string;
    slug: string;
    popularity: number;
    archived: boolean;
    summary: string;
    highlight: Object[];
  }

  export interface DocumentWithDifference extends Document {
    // idk lol
    diff: number;
  }
}
