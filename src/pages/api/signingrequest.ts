import { signingRequestHandler } from "../../lib/auth";

export default function handler(req, res) {
  signingRequestHandler(req, res);
}