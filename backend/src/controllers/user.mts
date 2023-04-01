import * as jose from "jose";
import axios from "axios";
import cron from "node-cron";
import { NextFunction, Request, Response } from "express";

let JWT_PUBKEY: jose.KeyLike | undefined;

async function fetchLoginKey() {
  const pubkey = (await axios.get("https://login.scottylabs.org/login/pubkey")).data;

  JWT_PUBKEY = await jose.importSPKI(pubkey, "RS256");
  return JWT_PUBKEY;
}

if (!JWT_PUBKEY) fetchLoginKey();

async function getLoginKey(): Promise<jose.KeyLike> {
  return JWT_PUBKEY ?? (await fetchLoginKey());
}

cron.schedule("0 0 * * *", fetchLoginKey);

const verifyUserToken = async (token: string) => {
  const { payload } = await jose.jwtVerify(token, await getLoginKey(), {
    algorithms: ["RS256"],
  });

  if (!payload) {
    throw "No token present. Did you forget to pass in the token with the API call?";
  } else if (payload.applicationId !== process.env.LOGIN_API_ID || !payload.email) {
    throw "Bad token";
  }
};

export type IsUserReqBody<T> = T & { token: string };

export async function isUser<P, ResBody, ReqBody, ReqQuery, Locals extends Record<string, unknown>>(
  req: Request<P, ResBody, IsUserReqBody<ReqBody>, ReqQuery, Locals>,
  res: Response<ResBody, Locals>,
  next: NextFunction
) {
  const token: string = req.body.token;
  if (process.env.AUTH_ENABLED !== "true") return next();

  verifyUserToken(token)
    .then(next)
    .catch((e) => {
      console.log(e);
      return res.status(401).send(e);
    });
}
