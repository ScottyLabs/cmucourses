import { RequestHandler } from "express";
import { cleanID, PrismaReturn, SingleOrArray, singleToArray } from "~/util";
import db from "@cmucourses/db";

export interface GetSyllabi {
  params: unknown;
  resBody: PrismaReturn<typeof db.syllabi.findMany>;
  reqBody: unknown;
  query: {
    number: SingleOrArray<string>;
  };
}

export const getSyllabi: RequestHandler <
  GetSyllabi["params"],
  GetSyllabi["resBody"],
  GetSyllabi["reqBody"],
  GetSyllabi["query"]
> = async (req, res, next) => {
  const numbers = singleToArray(req.query.number).map(cleanID);
  
  console.log('Fetching syllabi for numbers:', numbers); // Debugging line, delete later
  
  try {
    const syllabi = await db.syllabi.findMany({
      where: {
        number: { in: numbers },
      }
    });
    
    console.log(`Found ${syllabi.length} syllabi`); // Debugging line, delete later
    res.json(syllabi);
  } catch (e) {
    console.error('Error fetching syllabi:', e);
    res.json([]);
  }
};

// TODO: use a better caching system

const allSyllabiEntry = {
  allSyllabi: [] as GetAllSyllabi["resBody"],
  lastCached: new Date(1970),
};

const getAllSyllabiDbQuery = {
  select: {
    name: true,
    number: true,
  },
};
  
export interface GetAllSyllabi {
  params: unknown;
  resBody: PrismaReturn<typeof db.syllabi.findMany<typeof getAllSyllabiDbQuery>>;
  reqBody: unknown;
  query: { number?: string | string[]; name?: string | string[] };
}

export const getAllSyllabi: RequestHandler<
  GetAllSyllabi["params"],
  GetAllSyllabi["resBody"],
  GetAllSyllabi["reqBody"],
  GetAllSyllabi["query"]
> = async (req, res, next) => {
  if (new Date().valueOf() - allSyllabiEntry.lastCached.valueOf() > 1000 * 60 * 60 * 24) {
    try {
      const syllabi = await db.syllabi.findMany({
        select: getAllSyllabiDbQuery.select
      });
  
      console.log(`Fetched ${syllabi.length} syllabi for 'all' endpoint`);
      allSyllabiEntry.lastCached = new Date();
      allSyllabiEntry.allSyllabi = syllabi;
    
      res.json(syllabi);
    } catch (e) {
      console.error('Error fetching all syllabi:', e);
      res.json([]);
    }
  } else {
    res.json(allSyllabiEntry.allSyllabi);
  }
};