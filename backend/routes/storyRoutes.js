import express from "express";
import {
  createStory,
  getStories,
  getStory,
  addComment,
  upvoteStory,
  upvoteComment,
  reactStory,
  shareStory,
  reactComment,
} from "../controller/storyController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Additional route to get current user's stories (must come before :id)
router.get("/mine/list", auth, (req, res, next) => {
  req.query.user = "me";
  return getStories(req, res, next);
});

router.post("/", auth, createStory);
router.get("/", getStories);
router.get("/:id", getStory);
router.post("/:id/comments", auth, addComment);
router.post("/:id/upvote", upvoteStory);
router.post("/comments/:id/upvote", upvoteComment);
router.post("/:id/react", auth, reactStory);
router.post("/:id/share", shareStory);
router.post("/comments/:id/react", auth, reactComment);

export default router;
