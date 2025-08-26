import { Router } from "express";
import bcrypt from "bcrypt";
import { issueJWT } from "../utils/token.js";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
	const prisma = req.prisma;
	const { email, username, password, role } = req.body;

	try {
		if (!email || !password) {
			return res.status(400).json({ message: "email and password required" });
		}

		const exists = await prisma.user.findUnique({ where: { email } });
		if (exists)
			return res.status(409).json({ message: "email already in use" });

		const hash = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: { email, username, password: hash, role: role || "USER" },
		});

		const token = issueJWT(user);
		return res.status(201).json({
			user: {
				id: user.Id,
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
			return res.status(401).json({ message: "invalid email or password" });

		const ok = await bcrypt.compare(password, user.password);
		if (!ok)
			return res.status(401).json({ message: "invalid email or password" });

		const token = issueJWT(user);

		return res.status(200).json({
			login_sucess: true,
			user: {
				id: user.Id,
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

export default router;
