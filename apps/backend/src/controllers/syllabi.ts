import { RequestHandler } from "express";
import { cleanID, PrismaReturn, SingleOrArray, singleToArray } from "~/util";
import db from "@cmucourses/db";

export interface Syllabus {
  id: string;
  season: string;
  year: number;
  number: string;
  url: string | null;
}

export interface GetSyllabi {
  params: unknown;
  resBody: Syllabus[];
  reqBody: unknown;
  query: { number?: string | string[] };
}

export const getSyllabi: RequestHandler<
  GetSyllabi["params"],
  GetSyllabi["resBody"],
  GetSyllabi["reqBody"],
  GetSyllabi["query"]
> = async (req, res, next) => {
  console.log(req.query.number);
  const numbers = singleToArray(req.query.number).map((n) => n);

  console.log("Fetching syllabi for numbers:", numbers);

  try {
    const syllabi = await db.syllabi.findMany({
      where: {
        number: { in: numbers },
      },
      select: {
        id: true,
        season: true,
        year: true,
        number: true,
        section: true,
        url: true,
      },
    });

    console.log(`Found ${syllabi.length} syllabi`);
    console.log("Syllabi:", syllabi);
    res.json(syllabi);
  } catch (e) {
    console.error("Error fetching syllabi:", e);
    res.json([]);
  }
};

// TODO: use a better caching system
const allSyllabiEntry = {
  allSyllabi: [] as Syllabus[],
  lastCached: new Date(1970),
};

const getAllSyllabiDbQuery = {
  select: {
    id: true,
    season: true,
    year: true,
    number: true,
    url: true,
  },
};

export interface GetAllSyllabi {
  params: unknown;
  resBody: Syllabus[];
  reqBody: unknown;
  query: { number?: string | string[] };
}

export const getAllSyllabi: RequestHandler<
  GetAllSyllabi["params"],
  GetAllSyllabi["resBody"],
  GetAllSyllabi["reqBody"],
  GetAllSyllabi["query"]
> = async (req, res, next) => {
  const filter: Record<string, any> = {};
  
  // // Add filtering logic if needed
  // if (req.query.number) {
  //   filter.number = Array.isArray(req.query.number)
  //     ? { in: req.query.number }
  //     : req.query.number;
  // }

  if (new Date().valueOf() - allSyllabiEntry.lastCached.valueOf() > 1000 * 60 * 60 * 24) {
    try {
      const syllabiFromDB = await db.syllabi.findMany({
        where: filter,
        select: getAllSyllabiDbQuery.select,
      });

      const syllabi: Syllabus[] = syllabiFromDB.map((s) => ({
        id: s.id,
        season: s.season ?? "",
        year: s.year ?? 0,
        number: s.number ?? "",
        url: s.url ?? null,
      }));

      allSyllabiEntry.lastCached = new Date();
      allSyllabiEntry.allSyllabi = syllabi;

      res.json(syllabi);
    } catch (e) {
      console.error("Error fetching all syllabi:", e);
      res.json([] as Syllabus[]);
    }
  } else {
    res.json(allSyllabiEntry.allSyllabi);
  }
};