import { generateSigningRequestHandler, KeyStore } from "passlink-server";
import * as jose from "jose";
import axios from "axios";

let JWT_PUBKEY = null;

async function getLoginKey() {
  const pubkey = (await axios.get("https://login.scottylabs.org/login/pubkey"))
    .data;

  JWT_PUBKEY = await jose.importSPKI(pubkey, "RS256");
}

//@ts-ignore
KeyStore.readKey(process.env.LOGIN_API_KEY.replace(/\\n/gm, "\n"));
const secretKey = KeyStore.getSecretKey();

export const signingRequestHandler = generateSigningRequestHandler(
  //@ts-ignore
  {
    restrictDomain: true,
    applicationId: process.env.LOGIN_API_ID
  },
  secretKey,
  true
);

const verifyUserToken = async (token) => {
  if (!JWT_PUBKEY)
    await getLoginKey();

  const { payload } = await jose.jwtVerify(token, JWT_PUBKEY, { algorithms: ["RS256"] });

  if (!payload) {
    throw "No token present. Did you forget to pass in the token with the API call?";

    if (payload.applicationId !== process.env.LOGIN_API_ID || !payload.email)
      throw "Bad token";
  }
};

export const isUser = async (req, res) => {
  let token = req.body.token;

  if (process.env.AUTH_ENABLED !== "true") return true;

  try {
    await verifyUserToken(token);
    return true;
  } catch (e) {
    console.log(e);
    res.status(401).send(e);
    return false;
  }
}