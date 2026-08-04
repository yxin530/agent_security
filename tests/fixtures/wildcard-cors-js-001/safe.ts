import { Request, Response } from "express";

// Wildcard origin is set but credentials are NOT enabled — not flagged.
export function handler(req: Request, res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({ ok: true });
}
