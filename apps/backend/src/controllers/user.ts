import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { clerkClient } from "@clerk/clerk-sdk-node";

const verifyUserToken = async (token: string): Promise<JwtPayload> => {
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

  const requireCmuAccount =
    process.env.REQUIRE_CMU_EMAIL === "true" || (BACKEND_ENV === "prod" && process.env.REQUIRE_CMU_EMAIL !== "false");
  if (requireCmuAccount) {
    if (!payload.sub) throw "Token has no subject.";
    const user = await clerkClient.users.getUser(payload.sub);
    const hasCmuEmail = user.emailAddresses.some(({ emailAddress }) => /@(andrew\.)?cmu\.edu$/i.test(emailAddress));
    if (!hasCmuEmail) throw "A CMU email account is required.";
  }

  return payload;
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
    .then(() => next())
    .catch((e) => {
      console.log(e);
      return res.status(401).send(e);
    });
}

export type UserLocals = { userId: string };

/**
 * Like isUser, but for routes that act on the caller's own data: it always verifies the token,
 * even when AUTH_ENABLED is off, and exposes the Clerk user id as res.locals.userId.
 */
export function requireUser<P, ResBody, ReqBody, ReqQuery>(
  req: Request<P, ResBody, IsUserReqBody<ReqBody>, ReqQuery, UserLocals>,
  res: Response<ResBody, UserLocals>,
  next: NextFunction
) {
  const token = req.body?.token;
  if (typeof token !== "string" || token === "") {
    res.status(401).send("No token present. Did you forget to pass in the token with the API call?" as ResBody);
    return;
  }

  verifyUserToken(token)
    .then((payload) => {
      if (!payload.sub) throw "Token has no subject.";
      res.locals.userId = payload.sub;
      next();
    })
    .catch((e) => {
      console.log(e);
      res.status(401).send((e instanceof Error ? e.message : e) as ResBody);
    });
}
