
import mongoose from "mongoose";
import Story from "../models/Story.js";
import Comment from "../models/Comment.js";
import {
  redactPII,
  rateLimit,
  sanitizeTags,
  ensureTextQuality,
  VALID_TAGS,
} from "../utils/helper.js";

// Create a new story
export const createStory = async (req, res) => {
  try {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (!rateLimit(`story:${ip}`, 5, 60 * 60 * 1000)) {
      return res.status(429).json({ error: "Too many stories; try later" });
    }
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const { text, tags } = req.body || {};
    const chk = ensureTextQuality(text);
    if (!chk.ok) return res.status(400).json({ error: chk.reason });

    const textRedacted = redactPII(text);
    const doc = await Story.create({
      userId: req.user.id,
      textOriginal: text,
      textRedacted,
      tags: sanitizeTags(tags),
    });
    return res.status(201).json({
      _id: doc._id,
      textRedacted: doc.textRedacted,
      tags: doc.tags,
      createdAt: doc.createdAt,
      upvotes: doc.upvotes,
      userId: doc.userId,
      reactions: doc.reactions,
      shares: doc.shares,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create story" });
  }
};

// List stories with optional tag/user filters
export const getStories = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, user } = req.query;
    const q = {};
    if (tag && VALID_TAGS.has(String(tag))) q.tags = String(tag);
    if (user) {
      if (user === "me") {
        if (!req.user || !req.user.id) {
          return res.status(401).json({ error: "Auth required for user filter" });
        }
        q.userId = req.user.id;
      } else if (mongoose.isValidObjectId(user)) {
        q.userId = user;
      }
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Story.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("textRedacted tags createdAt upvotes userId reactions shares reactionsByUser")
        .populate({ path: "userId", select: "name demographic" }),
      Story.countDocuments(q),
    ]);

    const userId = req.user && req.user.id;
    const sanitized = items.map((s) => {
      const obj = s.toObject();
      if (userId && s.reactionsByUser && s.reactionsByUser.has(userId)) {
        obj.myReaction = s.reactionsByUser.get(userId);
      }
      delete obj.reactionsByUser;
      return obj;
    });

    return res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      items: sanitized,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch stories" });
  }
};

// Get a single story and its comments
export const getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .select("textRedacted tags createdAt upvotes userId reactions shares reactionsByUser")
      .populate({ path: "userId", select: "name demographic" });
    if (!story) return res.status(404).json({ error: "Not found" });
    const userId = req.user && req.user.id;
    let myReaction = null;
    if (userId && story.reactionsByUser && story.reactionsByUser.has(userId)) {
      myReaction = story.reactionsByUser.get(userId);
    }
    const commentsRaw = await Comment.find({ storyId: story._id })
      .sort({ createdAt: 1 })
      .select("textRedacted createdAt upvotes reactions reactionsByUser userId")
      .populate({ path: "userId", select: "name demographic" });

    const comments = commentsRaw.map((c) => {
      const co = c.toObject();
      if (userId && c.reactionsByUser && c.reactionsByUser.has(userId)) {
        co.myReaction = c.reactionsByUser.get(userId);
      }
      delete co.reactionsByUser;
      return co;
    });

    const obj = story.toObject();
    delete obj.reactionsByUser;
    obj.myReaction = myReaction;
    return res.json({ story: obj, comments });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch story" });
  }
};

// Add a comment to a story
export const addComment = async (req, res) => {
  try {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (!rateLimit(`comment:${ip}`, 20, 60 * 60 * 1000)) {
      return res.status(429).json({ error: "Too many comments; try later" });
    }
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const story = await Story.findById(req.params.id).select("_id");
    if (!story) return res.status(404).json({ error: "Story not found" });

    const { text } = req.body || {};
    const plain = (text || "").trim();
    if (plain.length < 5) return res.status(400).json({ error: "Comment too short" });

    const textRedacted = redactPII(plain);
    const c = await Comment.create({
      userId: req.user.id,
      storyId: story._id,
      textOriginal: plain,
      textRedacted,
    });
    return res.status(201).json({
      _id: c._id,
      textRedacted: c.textRedacted,
      createdAt: c.createdAt,
      upvotes: c.upvotes,
      reactions: c.reactions,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to add comment" });
  }
};

// Upvote a story
export const upvoteStory = async (req, res) => {
  try {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (!rateLimit(`upvote:${ip}:${req.params.id}`, 5, 24 * 60 * 60 * 1000)) {
      return res.status(429).json({ error: "Upvote limit reached for this story" });
    }
    const updated = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    ).select("upvotes");
    if (!updated) return res.status(404).json({ error: "Story not found" });
    return res.json({ upvotes: updated.upvotes });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to upvote" });
  }
};

// React to a story
export const reactStory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const { reaction } = req.body || {};
    const allowed = ["like", "love", "laugh", "wow", "sad", "angry"];
    if (!allowed.includes(reaction)) {
      return res.status(400).json({ error: "Invalid reaction" });
    }
    const story = await Story.findById(req.params.id).select("reactions reactionsByUser");
    if (!story) return res.status(404).json({ error: "Story not found" });
    const prev = story.reactionsByUser.get(req.user.id);
    if (prev) story.reactions[prev] = Math.max(0, story.reactions[prev] - 1);
    story.reactionsByUser.set(req.user.id, reaction);
    story.reactions[reaction] = (story.reactions[reaction] || 0) + 1;
    await story.save();
    return res.json({ reactions: story.reactions, myReaction: reaction });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to react" });
  }
};

// Track a share action
export const shareStory = async (req, res) => {
  try {
    const { platform } = req.body || {};
    const allowed = ["whatsapp", "telegram", "instagram", "copy"];
    if (!allowed.includes(platform)) {
      return res.status(400).json({ error: "Invalid platform" });
    }
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { [`shares.${platform}`]: 1 } },
      { new: true }
    ).select("shares");
    if (!story) return res.status(404).json({ error: "Story not found" });
    return res.json({ shares: story.shares });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to record share" });
  }
};

// Upvote a comment
export const upvoteComment = async (req, res) => {
  try {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (!rateLimit(`cupvote:${ip}:${req.params.id}`, 5, 24 * 60 * 60 * 1000)) {
      return res.status(429).json({ error: "Upvote limit reached for this comment" });
    }
    const updated = await Comment.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    ).select("upvotes");
    if (!updated) return res.status(404).json({ error: "Comment not found" });
    return res.json({ upvotes: updated.upvotes });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to upvote comment" });
  }
};

// React to a comment
export const reactComment = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const { reaction } = req.body || {};
    const allowed = ["like", "love", "laugh", "wow", "sad", "angry"];
    if (!allowed.includes(reaction)) {
      return res.status(400).json({ error: "Invalid reaction" });
    }
    const comment = await Comment.findById(req.params.id).select("reactions reactionsByUser");
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    const prev = comment.reactionsByUser.get(req.user.id);
    if (prev) comment.reactions[prev] = Math.max(0, comment.reactions[prev] - 1);
    comment.reactionsByUser.set(req.user.id, reaction);
    comment.reactions[reaction] = (comment.reactions[reaction] || 0) + 1;
    await comment.save();
    return res.json({ reactions: comment.reactions, myReaction: reaction });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to react to comment" });
  }
};
