import express from "express";
const app = express();

// ponytail: no rate limiter — should be flagged by missing-rate-limit-001
app.post("/login", loginHandler);
app.post("/auth/token", authHandler);
