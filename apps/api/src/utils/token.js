import jwt from "jsonwebtoken";
export function issueJWT(user) {
	const payload = {
		sub: user.id,
		role: user.role,
	};

	const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
	return token;
}
