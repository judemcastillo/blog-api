import { Router } from "express";
import passport from "passport";

const router = Router();

const requireAuth = passport.authenticate("jwt", { session: false });
const requireAccess = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	if (req.user.role === "ADMIN" || req.user.role === "AUTHOR") {
		return next();
	}
	return res.status(403).json({ message: "Forbidden" });
};

// Show Posts /api/posts
router.get("/", async (req, res, next) => {
	const prisma = req.prisma;
	const { all } = req.query;
	try {
		const showPublished = all && req.user ? {} : { published: true };
		const posts = await prisma.post.findMany({
			where: showPublished,
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				title: true,
				content: true,
				published: true,
				authorId: true,
				createdAt: true,
				updatedAt: true,
				publishedAt: true,
			},
		});
		res.status(200).json(posts);
	} catch (err) {
		next(err);
	}
});

// Create Post
router.post("/", requireAuth, requireAccess, async (req, res, next) => {
	const prisma = req.prisma;
	const { title, content, published } = req.body;
	try {
		const post = await prisma.post.create({
			data: {
				title,
				content,
				published: !!published,
				authorId: req.user.id,
				publishedAt: published ? new Date() : null,
			},
		});
		res.status(201).json(post);
	} catch (err) {
		next(err);
	}
});

//Search Post
router.get("/:id", async (req, res, next) => {
	const prisma = req.prisma;
	const id = Number(req.params.id);
	try {
		const post = await prisma.post.findUnique({
			where: { id },
		});
		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}
		if (!post.published && !req.user) {
			return res.status(403).json({ message: "Forbidden" });
		}
		res.status(200).json(post);
	} catch (err) {
		next(err);
	}
});

//Update Post (Only Author or Admin)
router.put("/:id", requireAuth, requireAccess, async (req, res, next) => {
	const prisma = req.prisma;
	const id = Number(req.params.id);
	const { title, content, published } = req.body;
	try {
		const post = await prisma.post.findUnique({
			where: { id },
		});
		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}

		const updatedPost = await prisma.post.update({
			where: { id },
			data: {
				title,
				content,
				published: !!published,
				authorId: req.user.id,
				publishedAt: published ? new Date() : null,
			},
		});
		res.status(200).json(updatedPost);
	} catch (err) {
		next(err);
	}
});

//Delete Post (Only Author or Admin)
router.delete("/:id", requireAuth, requireAccess, async (req, res, next) => {
	const prisma = req.prisma;
	const id = Number(req.params.id);
	try {
		const post = await prisma.post.findUnique({
			where: { id },
		});
		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}
		if (!post.published && !req.user) {
			return res.status(403).json({ message: "Forbidden" });
		}
		await prisma.post.delete({
			where: { id },
		});
		res.status(204).send().json(`Post ${id} deleted`);
	} catch (err) {
		next(err);
	}
});

// Show Comments
router.get("/:id/comments", async (req, res, next) => {
	const prisma = req.prisma;
	const postId = Number(req.params.id);
	try {
		const comments = await prisma.comment.findMany({
			where: { postId },
			orderBy: { createdAt: "desc" },
		});
		res.status(200).json(comments);
	} catch (err) {
		next(err);
	}
});

// Add Comments (Logged In or Public)
router.post("/:id/comments", async (req, res, next) => {
	const prisma = req.prisma;
	const postId = Number(req.params.id);
	const { content, authorName, authorEmail } = req.body;
	try {
		const data = { content, postId, authorName, authorEmail };
		if (req.user?.id) data.userId = req.user.id;
		const comment = await prisma.comment.create({ data });
		res.status(201).json(comment);
	} catch (err) {
		next(err);
	}
});

// Delete Comment
router.delete("/:id/comments/:commentId", async (req, res, next) => {
	const prisma = req.prisma;
	const commentId = Number(req.params.commentId);
	try {
		const comment = await prisma.comment.findUnique({
			where: { id: commentId },
		});
		if (!comment) {
			return res.status(404).json({ message: "Comment not found" });
		}
		if (comment.userId !== req.user?.id) {
			return res.status(403).json({ message: "Forbidden" });
		}
		await prisma.comment.delete({
			where: { id: commentId },
		});
		res.status(204).send();
	} catch (err) {
		next(err);
	}
});

export default router;
