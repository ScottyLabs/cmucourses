import * as jose from "jose";
import axios from "axios";
import cron from "node-cron";
import { NextFunction, Request, Response } from "express";

let JWT_PUBKEY;

async function getLoginKey() {
  const pubkey = (await axios.get("https://login.scottylabs.org/login/pubkey"))
    .data;

  JWT_PUBKEY = await jose.importSPKI(pubkey, "RS256");
}

if (!JWT_PUBKEY) getLoginKey();

cron.schedule("0 0 * * *", getLoginKey);

const verifyUserToken = async (token: string) => {
  if (!JWT_PUBKEY) await getLoginKey();

  const { payload } = await jose.jwtVerify(token, JWT_PUBKEY, {
    algorithms: ["RS256"],
  });

  if (!payload) {
    throw "No token present. Did you forget to pass in the token with the API call?";
  } else if (
    payload.applicationId !== process.env.LOGIN_API_ID ||
    !payload.email
  ) {
    throw "Bad token";
  }
};

export const isUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token: string = req.body.token;
  if (process.env.AUTH_ENABLED !== "true") return next();

  verifyUserToken(token)
    .then(next)
    .catch((e) => {
      console.log(e);
      return res.status(401).send(e);
    });
};
