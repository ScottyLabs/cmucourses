import { FCE } from "../models/fce.js";
import { standardizeID, singleToArray } from "../util.js";

const projection = { _id: false, __v: false };

export const getFCEsByID = (req, res) => {
  const courseIDs = singleToArray(req.query.courseID).map(standardizeID);

  FCE.find(
    {
      courseID: { $in: courseIDs },
    },
    projection,
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result);
    }
  );
};
