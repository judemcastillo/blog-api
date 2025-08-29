import { Router } from "express";
import passport from "passport";

const router = Router();
const requireAuth = passport.authenticate("jwt", { session: false });

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
}

// GET /api/admin/users  → list users with counts
router.get("/users", requireAuth, requireAdmin, async (req, res, next) => {
  const prisma = req.prisma;
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        _count: { select: { posts: true, comments: true } },
      },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id  → change role
router.patch("/users/:id", requireAuth, requireAdmin, async (req, res, next) => {
  const prisma = req.prisma;
  const id = Number(req.params.id);
  const { role } = req.body; // "USER" | "AUTHOR" | "ADMIN"
  if (!["USER", "AUTHOR", "ADMIN"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, username: true, role: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/posts  → all posts (drafts + published) with author
router.get("/posts", requireAuth, requireAdmin, async (req, res, next) => {
  const prisma = req.prisma;
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, username: true, email: true, role: true } },
      },
    });
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

export default router;
