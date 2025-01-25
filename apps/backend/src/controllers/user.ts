import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const verifyUserToken = async (token: string) => {
  const pubkey = process.env.CLERK_PEM_KEY || "";

  const payload = jwt.verify(token, pubkey, {
    algorithms: ["RS256"],
  });

  const currentTime = Math.floor(Date.now() / 1000);
  const BACKEND_ENV = process.env.BACKEND_ENV || "dev";
  const CLERK_LOGIN_HOST = process.env.CLERK_LOGIN_HOST || "http://localhost:3010";

  if (!payload || typeof payload === "string") {
    throw "No token present. Did you forget to pass in the token with the API call?";
  } else if (payload.exp && payload.exp < currentTime) {
    throw "Token has expired.";
  } else if (payload.nbf && payload.nbf > currentTime) {
    throw "Token is not valid yet.";
  } else if (BACKEND_ENV === "prod" && payload.azp && payload.azp !== CLERK_LOGIN_HOST) {
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
