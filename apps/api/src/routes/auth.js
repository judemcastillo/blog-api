import { Router } from "express";
import bcrypt from "bcrypt";
import { issueJWT } from "../utils/token.js";
import jwt from "jsonwebtoken";
import passport from "passport";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
	const prisma = req.prisma;
	const { email, username, password, role, accessCode } = req.body;

	try {
		if (!email || !password) {
			return res.status(400).json({ message: "Email and password required" });
		}

		const exists = await prisma.user.findUnique({ where: { email } });
		if (exists)
			return res.status(409).json({ message: "Email already in use" });

		// role gating
		let finalRole = "USER"; // default always USER

		if (role === "AUTHOR") {
			if (accessCode !== process.env.AUTHOR_ACCESS_CODE) {
				return res
					.status(403)
					.json({ message: "Invalid access code for AUTHOR" });
			}
			finalRole = "AUTHOR";
		} else if (role === "ADMIN") {
			if (accessCode !== process.env.ADMIN_ACCESS_CODE) {
				return res
					.status(403)
					.json({ message: "Invalid access code for ADMIN" });
			}
			finalRole = "ADMIN";
		}

		const hash = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: { email, username, password: hash, role: finalRole },
		});

		const token = issueJWT(user);
		return res.status(201).json({
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				role: user.role,
			},
			token,
		});
	} catch (err) {
		next(err);
	}
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
	const prisma = req.prisma;
	const { email, password } = req.body;

	try {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user)
			return res.status(401).json({ message: "Invalid email or password" });

		const ok = await bcrypt.compare(password, user.password);
		if (!ok)
			return res.status(401).json({ message: "Invalid email or password" });

		const token = issueJWT(user);

		return res.status(200).json({
			login_success: true,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				role: user.role,
			},
			token,
		});
	} catch (err) {
		next(err);
	}
});

// POST /api/auth/upgrade-acc
router.post(
	"/upgrade-acc",
	passport.authenticate("jwt", { session: false }),
	async (req, res, next) => {
		const prisma = req.prisma;
		const { accessCode } = req.body;

		try {
			// role gating
			let finalRole = req.user.role;

			if (role === "AUTHOR") {
				if (accessCode !== process.env.AUTHOR_ACCESS_CODE) {
					return res
						.status(403)
						.json({ message: "invalid access code for AUTHOR" });
				}
				finalRole = "AUTHOR";
			} else if (role === "ADMIN") {
				if (accessCode !== process.env.ADMIN_ACCESS_CODE) {
					return res
						.status(403)
						.json({ message: "invalid access code for ADMIN" });
				}
				finalRole = "ADMIN";
			} else {
				return res.status(400).json({ message: "unsupported role upgrade" });
			}

			// Update role in DB
			const user = await prisma.user.update({
				where: { id: req.user.id },
				data: { role: finalRole },
			});

			const token = issueJWT(user); // issue new token with updated role
			res.json({ user, token });
		} catch (err) {
			next(err);
		}
	}
);

export default router;
