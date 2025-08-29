import "dotenv/config";
import express from "express";
import cors from "cors";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

import { PrismaClient } from "@prisma/client";

import authRouter from "./routes/auth.js";
import postsRouter from "./routes/posts.js";
import adminRouter from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(
	cors({
		origin: [
			"http://localhost:5173",
			"https://blog-project-green-three.vercel.app/",
		],
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);

app.options("*", cors());

// Attach prisma
app.use((req, res, next) => {
	req.prisma = prisma;
	next();
});
app.use(express.json());

// Passport JWT
const options = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_SECRET,
};

const strategy = new JwtStrategy(options, async (payload, done) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: payload.sub },
		});
		if (!user) return done(null, false);
		return done(null, user);
	} catch (err) {
		return done(err, false);
	}
});
passport.use(strategy);

app.use(passport.initialize());

function maybeAuth(req, res, next) {
	passport.authenticate("jwt", { session: false }, (err, user) => {
		if (err || !user) {
			return next();
		}
		req.user = user;
		next();
	})(req, res, next);
}

// --- health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// --- routes
app.use("/api/auth", authRouter);
app.use("/api/posts", maybeAuth, postsRouter);
app.use("/api/admin", adminRouter);

// --- error handler
app.use((err, _req, res, _next) => {
	console.error(err);
	res.status(500).json({ message: "Server error" });
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
