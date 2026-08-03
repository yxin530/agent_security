import express from "express";
import rateLimit from "express-rate-limit";
const app = express();

const loginLimiter = rateLimit({ windowMs: 900000, max: 10 });

app.post("/login", loginLimiter, loginHandler);
app.post("/auth/token", rateLimit({ windowMs: 900000, max: 5 }), authHandler);
