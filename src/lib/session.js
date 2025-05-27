// src/lib/session.js
import { IronSessionOptions } from "iron-session";

export const sessionOptions = {
  password: process.env.SESSION_PASSWORD,
  cookieName: "app_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

// helper untuk getSession dan saveSession
export function withSession(handler) {
  return async (req, res) => {
    const { getIronSession } = await import("iron-session");
    req.session = await getIronSession(req, res, sessionOptions);
    return handler(req, res);
  };
}
