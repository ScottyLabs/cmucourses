import * as jose from "jose";
import cron from "node-cron";
import { NextFunction, Request, Response } from "express";

let JWT_PUBKEY: jose.KeyLike | undefined;

async function fetchLoginKey() {
  const pubkey = process.env.CLERK_PEM_KEY || "";

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
    algorithms: ["RS256"]
  });

  const currentTime = Math.floor(Date.now() / 1000);

  if (!payload) {
    throw "No token present. Did you forget to pass in the token with the API call?";
  } else if (payload.exp && payload.exp < currentTime) {
    throw "Token has expired.";
  } else if (payload.nbf && payload.nbf > currentTime) {
    throw "Token is not valid yet.";
  } else if (payload.azp && payload.azp !== process.env.CLERK_LOGIN_HOST) {
    throw "Token is not valid for this host.";
  }
};

export type IsUserReqBody<T> = T & { token: string };

export function isUser<P, ResBody, ReqBody, ReqQuery, Locals extends Record<string, unknown>>(
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
