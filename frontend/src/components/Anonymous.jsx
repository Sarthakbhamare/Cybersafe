import React, { useState, useEffect, useCallback } from "react";

// AI-powered threat analysis simulation
const analyzeStoryThreat = (story) => {
  const text = story.text || story.textRedacted || "";
  const tags = story.tags || [];
  
  let riskScore = 0;
  let confidence = 0;
  let threatType = "Unknown";
  
  // High-risk patterns
  if (text.toLowerCase().includes("otp") || text.toLowerCase().includes("verification code")) {
    riskScore += 85;
    threatType = "Authentication Fraud";
  }
  if (text.toLowerCase().includes("bank") && text.toLowerCase().includes("urgent")) {
    riskScore += 90;
    threatType = "Banking Fraud";
  }
  if (text.toLowerCase().includes("job") && text.toLowerCase().includes("fee")) {
    riskScore += 75;
    threatType = "Employment Scam";
  }
  if (text.toLowerCase().includes("romance") || text.toLowerCase().includes("love")) {
    riskScore += 70;
    threatType = "Romance Scam";
  }
  
  // Calculate confidence based on story details
  confidence = Math.min(95, 60 + (text.length / 20) + (tags.length * 10));
  
  return {
    riskScore: Math.min(100, riskScore),
    confidence: Math.round(confidence),
    threatType,
    recommendation: riskScore > 80 ? "Immediate Alert" : riskScore > 60 ? "High Caution" : "Monitor"
  };
};

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  disabled,
  type = "button",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    default:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md hover:shadow-lg",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default", className = "" }) => {
  const variantStyles = {
    default: "bg-indigo-100 text-indigo-800 border-indigo-200",
    outline: "bg-white text-gray-700 border-gray-300",
    primary: "bg-indigo-600 text-white",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const Icons = {
  ArrowLeft: () => "←",
  ThumbsUp: () => "👍",
  MessageCircle: () => "💬",
  Clock: () => "⏰",
  Tag: () => "🏷️",
  Send: () => "📤",
  Close: () => "✕",
  Search: () => "🔍",
  Filter: () => "🔽",
  Sort: () => "⇅",
  Flag: () => "🚩",
  Shield: () => "🛡️",
  AlertTriangle: () => "⚠️",
  Trending: () => "📈",
  Brain: () => "🧠",
  Robot: () => "🤖",
  Globe: () => "🌍",
  Eye: () => "👁️",
  Zap: () => "⚡",
  Award: () => "🏆",
  Target: () => "🎯",
  Radar: () => "📡",
};

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const VALID_TAGS = [
  "UPI",
  "KYC",
  "Job",
  "Loan",
  "Crypto",
  "Romance",
  "Govt",
  "OTP",
];

const STATIC_STORIES = [
  {
    _id: "static-1",
    text: "I received a call from someone claiming to be from my bank asking me to verify an OTP. Thankfully I remembered never to share it, but the caller was very convincing and tried repeatedly.",
    textRedacted: "I received a call from someone claiming to be from my bank asking me to verify an OTP...",
  tags: ["OTP", "Govt"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    upvotes: 12,
    comments: [
      {
        _id: "static-comment-1",
        text: "Thanks for sharing, I got a similar call last week!",
        textRedacted: "Thanks for sharing, I got a similar call last week!",
        upvotes: 3,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    ],
  },
  {
    _id: "static-2",
    text: "An email promised a job offer if I paid a small processing fee. The website looked real, but a quick search showed many complaints. Always double-check the domain!",
    textRedacted: "An email promised a job offer if I paid a small processing fee...",
  tags: ["Job", "Loan"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    upvotes: 8,
    comments: [
      {
        _id: "static-comment-2",
        text: "These fake job offers are everywhere. Good catch!",
        textRedacted: "These fake job offers are everywhere. Good catch!",
        upvotes: 2,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
    ],
  },
];

const StoryCard = ({ story, onSelect, onUpvote, onReport }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  const getThreatLevel = (tags) => {
    const highRiskTags = ['OTP', 'UPI', 'KYC'];
    const mediumRiskTags = ['Job', 'Loan', 'Romance'];
    
    if (tags.some(tag => highRiskTags.includes(tag))) {
      return { level: 'High Risk', color: 'red', pulse: true };
    } else if (tags.some(tag => mediumRiskTags.includes(tag))) {
      return { level: 'Medium Risk', color: 'yellow', pulse: false };
    }
    return { level: 'Low Risk', color: 'green', pulse: false };
  };

  const threat = getThreatLevel(story.tags || []);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-transparent hover:border-l-cyan-500 overflow-hidden">
      <div className="p-6">
        {/* Threat Level & Verification */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 bg-${threat.color}-500 rounded-full ${threat.pulse ? 'animate-pulse' : ''}`}></div>
            <span className={`text-sm font-medium text-${threat.color}-600`}>{threat.level}</span>
            <div className="flex items-center gap-1 text-cyan-600">
              <span className="text-xs">{Icons.Shield()}</span>
              <span className="text-xs font-medium">Verified Report</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-orange-500 text-sm">{Icons.Trending()}</span>
            <span className="text-xs text-slate-500">Trending</span>
          </div>
        </div>

        {/* Story Title & Content */}
        <div className="mb-4">
          <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-cyan-700 transition-colors cursor-pointer line-clamp-2">
            {story.tags?.includes('OTP') ? 'Banking OTP Verification Scam' :
             story.tags?.includes('Job') ? 'Fake Job Offer Scam' :
             story.tags?.includes('Romance') ? 'Romance Scam Alert' :
             story.tags?.includes('UPI') ? 'UPI Payment Fraud' :
             'Cybersecurity Incident Report'}
          </h3>
          <p className="text-slate-600 leading-relaxed line-clamp-3">
            {truncateText(story.textRedacted || story.text)}
          </p>
        </div>

        {/* Enhanced Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {story.tags.map((tag) => {
              const tagColors = {
                'OTP': 'bg-red-100 text-red-700 border-red-200',
                'UPI': 'bg-blue-100 text-blue-700 border-blue-200',
                'Job': 'bg-purple-100 text-purple-700 border-purple-200',
                'Romance': 'bg-pink-100 text-pink-700 border-pink-200',
                'Crypto': 'bg-orange-100 text-orange-700 border-orange-200',
                'KYC': 'bg-indigo-100 text-indigo-700 border-indigo-200',
              };
              return (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${tagColors[tag] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                >
                  <span className="text-xs">{Icons.Tag()}</span>
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {/* Enhanced Metadata & Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <span>{Icons.Clock()}</span>
              {formatDate(story.createdAt)}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-green-500">{Icons.ThumbsUp()}</span>
              <span className="text-sm font-medium text-green-600">Helpful ({story.upvotes})</span>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpvote(story._id)}
              className="flex items-center gap-1 text-green-600 hover:text-green-700"
            >
              <span className="text-sm">{Icons.ThumbsUp()}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(story)}
              className="text-cyan-600 hover:text-cyan-700 font-medium"
            >
              Read Full Story →
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReport && onReport(story._id)}
              className="text-slate-500 hover:text-red-600"
              title="Report similar scam"
            >
              <span className="text-sm">{Icons.Flag()}</span>
            </Button>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 -mx-6 px-6 -mb-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <button className="text-xs text-slate-600 hover:text-cyan-600 flex items-center gap-1 transition-colors">
                <span>{Icons.MessageCircle()}</span>
                Discuss ({story.comments?.length || 0})
              </button>
              <button className="text-xs text-slate-600 hover:text-red-600 flex items-center gap-1 transition-colors">
                <span>{Icons.Flag()}</span>
                Report Similar
              </button>
            </div>
            <div className="text-xs text-slate-500">
              Impact Score: {Math.floor(Math.random() * 50) + 50}/100
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const StoryDetail = ({ story, onBack, onUpvoteStory }) => {
  const [storyData, setStoryData] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    setStoryData(story);
    setComments(story.comments || []);
    setLoading(false);
  }, [story]);

  // Backend story fetch disabled while API access is offline.
  /*
  const fetchStoryDetails = async () => {
    try {
      const response = await fetch(`${API_BASE}/stories/${story._id}`);
      const data = await response.json();
      setStoryData(data.story);
      setComments(data.comments);
    } catch (error) {
      console.error("Error fetching story details:", error);
    } finally {
      setLoading(false);
    }
  };
  */

  const handleSubmitComment = async () => {
    if (newComment.trim().length < 5) {
      alert("Comment must be at least 5 characters");
      return;
    }

    setSubmittingComment(true);
    try {
      // Backend comment creation call skipped while API access is offline.
      /*
      const response = await fetch(...)
      */
      const commentPayload = {
        _id: `local-comment-${Date.now()}`,
        text: newComment.trim(),
        textRedacted: newComment.trim(),
        upvotes: 0,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [...prev, commentPayload]);
      setNewComment("");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpvoteComment = async (commentId) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? { ...comment, upvotes: (comment.upvotes || 0) + 1 }
          : comment
      )
    );
    // Backend comment upvote skipped while API access is offline.
    /*
    try {
      const response = await fetch(`${API_BASE}/comments/${commentId}/upvote`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? { ...comment, upvotes: data.upvotes }
              : comment
          )
        );
      } else {
        const error = await response.json();
        alert(error.error || "Failed to upvote comment");
      }
    } catch (error) {
      console.error("Error upvoting comment:", error);
    }
    */
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <span>{Icons.ArrowLeft()}</span>
              Back to Stories
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Story Details</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 shadow-lg">
          <div className="p-8">
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              {storyData?.textRedacted || storyData?.text}
            </p>

            {storyData?.tags && storyData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {storyData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="primary"
                    className="flex items-center gap-1 text-sm px-3 py-1"
                  >
                    <span>{Icons.Tag()}</span>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-500">
                <span>{Icons.Clock()}</span>
                <span className="text-sm">
                  {formatDate(storyData?.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onUpvoteStory(story._id);
                    setStoryData((prev) =>
                      prev ? { ...prev, upvotes: (prev.upvotes || 0) + 1 } : prev
                    );
                  }}
                  className="flex items-center gap-2"
                >
                  <span>{Icons.ThumbsUp()}</span>
                  {storyData?.upvotes}
                </Button>
                <div className="flex items-center gap-2 text-gray-500">
                  <span>{Icons.MessageCircle()}</span>
                  <span className="text-sm">{comments.length} comments</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-8 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              Add a Comment
            </h3>
            <div className="space-y-4">
              <textarea
                className="w-full p-4 border text-black border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Share your thoughts (minimum 5 characters)..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="3"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {newComment.length}/5 minimum
                </span>
                <Button
                  onClick={handleSubmitComment}
                  disabled={submittingComment || newComment.trim().length < 5}
                  className="flex items-center gap-2"
                >
                  {submittingComment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <span className="text-sm">{Icons.Send()}</span>
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">
            Comments ({comments.length})
          </h3>

          {comments.length === 0 ? (
            <Card className="shadow-lg">
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">💭</div>
                <p className="text-gray-500">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            </Card>
          ) : (
            comments.map((comment) => (
              <Card
                key={comment._id}
                className="shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {comment.textRedacted}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="text-sm">{Icons.Clock()}</span>
                      <span className="text-sm">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpvoteComment(comment._id)}
                      className="flex items-center gap-1"
                    >
                      <span className="text-sm">{Icons.ThumbsUp()}</span>
                      {comment.upvotes}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

function Anonymous() {
  const [allStories, setAllStories] = useState(STATIC_STORIES);
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTag, setSelectedTag] = useState("");

  // New state for advanced features
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent, helpful, discussed
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStory, setNewStory] = useState("");
  const [newStoryTags, setNewStoryTags] = useState([]);
  const [creating, setCreating] = useState(false);

  const fetchStories = useCallback(
    async (pageNum = 1, tag = "", search = "", sort = "recent") => {
    setLoading(true);
    try {
      // Backend story fetch skipped while API access is offline.
      let filtered = allStories.filter((story) => {
        const matchesTag = tag ? story.tags?.includes(tag) : true;
        const matchesSearch = search ? 
          (story.text?.toLowerCase().includes(search.toLowerCase()) ||
           story.textRedacted?.toLowerCase().includes(search.toLowerCase()) ||
           story.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))) : true;
        return matchesTag && matchesSearch;
      });

      // Apply sorting
      switch (sort) {
        case "helpful":
          filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
          break;
        case "discussed":
          filtered.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
          break;
        case "recent":
        default:
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }

      const pageSize = 10;
      const endIndex = pageNum * pageSize;
      const visibleStories = filtered.slice(0, endIndex);

      setStories(visibleStories);
      setHasMore(filtered.length > endIndex);
      setPage(pageNum);
    } finally {
      setLoading(false);
    }
    },
    [allStories]
  );

  useEffect(() => {
    fetchStories(1, selectedTag, searchQuery, sortBy);
  }, [selectedTag, searchQuery, sortBy, fetchStories]);

  const handleCreateStory = async () => {
    if (newStory.trim().length < 30) {
      alert("Story must be at least 30 characters");
      return;
    }

    setCreating(true);
    try {
      // Backend story creation call skipped while API access is offline.
      /*
      const response = await fetch(`${API_BASE}/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newStory,
          tags: newStoryTags,
        }),
      });

      if (response.ok) {
        const newStoryData = await response.json();
        setStories((prev) => [newStoryData, ...prev]);
        setNewStory("");
        setNewStoryTags([]);
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create story");
      }
      */
      const trimmedStory = newStory.trim();
      const createdAt = new Date().toISOString();
      const createdStory = {
        _id: `local-story-${Date.now()}`,
        text: trimmedStory,
        textRedacted: trimmedStory,
        tags: newStoryTags,
        createdAt,
        upvotes: 0,
        comments: [],
      };
  setAllStories((prev) => [createdStory, ...prev]);
      setNewStory("");
      setNewStoryTags([]);
      setShowCreateForm(false);
    } finally {
      setCreating(false);
    }
  };

  const handleReportSimilar = (storyId) => {
    // Simulate reporting functionality
    alert(`Thank you for reporting. Our team will review this for similar scam patterns.`);
  };

  const handleTagToggle = (tag) => {
    if (newStoryTags.includes(tag)) {
      setNewStoryTags((prev) => prev.filter((t) => t !== tag));
    } else if (newStoryTags.length < 3) {
      setNewStoryTags((prev) => [...prev, tag]);
    }
  };

  const handleUpvoteStory = (storyId) => {
    setAllStories((prev) =>
      prev.map((story) =>
        story._id === storyId
          ? { ...story, upvotes: (story.upvotes || 0) + 1 }
          : story
      )
    );
    setStories((prev) =>
      prev.map((story) =>
        story._id === storyId
          ? { ...story, upvotes: (story.upvotes || 0) + 1 }
          : story
      )
    );
    setSelectedStory((prev) =>
      prev && prev._id === storyId
        ? { ...prev, upvotes: (prev.upvotes || 0) + 1 }
        : prev
    );
    // Backend story upvote call skipped while API access is offline.
    /*
    try {
      const response = await fetch(`${API_BASE}/stories/${storyId}/upvote`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setStories((prev) =>
          prev.map((story) =>
            story._id === storyId ? { ...story, upvotes: data.upvotes } : story
          )
        );
      } else {
        const error = await response.json();
        alert(error.error || "Failed to upvote");
      }
    } catch (error) {
      console.error("Error upvoting story:", error);
    }
    */
  };

  if (selectedStory) {
    return (
      <StoryDetail
        story={selectedStory}
        onBack={() => setSelectedStory(null)}
        onUpvoteStory={handleUpvoteStory}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Glassmorphism Header */}
      <div className="relative bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                💭 Anonymous Stories
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Share your scam experiences anonymously to help others stay safe
              </p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ✨ Share Your Story
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Enhanced Search and Filter Section with Glassmorphism */}
        <Card className="mb-8 shadow-xl bg-white/90 backdrop-blur-sm border-white/20 hover:shadow-2xl transition-all duration-300">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Enhanced Search Bar */}
              <div className="flex-1">
                <div className="relative group">
                  <span className="absolute left-3 top-3 text-slate-400 text-lg group-focus-within:text-cyan-500 transition-colors">{Icons.Search()}</span>
                  <input
                    type="text"
                    placeholder="AI-powered search: scam patterns, keywords, locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 placeholder-slate-500 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:bg-white"
                  />
                  {/* AI Processing Indicator */}
                  {searchQuery && (
                    <div className="absolute right-3 top-3 flex items-center gap-1">
                      <span className="text-xs text-cyan-600 font-medium">AI</span>
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Sort and Filter Controls */}
              <div className="flex gap-2">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="helpful">Most Helpful</option>
                  <option value="discussed">Most Discussed</option>
                </select>
                
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2"
                >
                  <span>{Icons.Filter()}</span>
                  Filters
                </Button>
              </div>
            </div>

            {/* Advanced Filters (Collapsible) */}
            {showAdvancedFilters && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Threat Level</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900">
                      <option>All Levels</option>
                      <option>High Risk</option>
                      <option>Medium Risk</option>
                      <option>Low Risk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Time Period</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900">
                      <option>All Time</option>
                      <option>Last Week</option>
                      <option>Last Month</option>
                      <option>Last 3 Months</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Verification Status</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900">
                      <option>All Reports</option>
                      <option>Verified Only</option>
                      <option>Community Validated</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">{allStories.length}</div>
            <div className="text-sm text-slate-600">Total Reports</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {allStories.filter(s => s.tags?.some(t => ['OTP', 'UPI', 'KYC'].includes(t))).length}
            </div>
            <div className="text-sm text-slate-600">High Risk</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {allStories.reduce((sum, s) => sum + (s.upvotes || 0), 0)}
            </div>
            <div className="text-sm text-slate-600">Lives Protected</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">24h</div>
            <div className="text-sm text-slate-600">Avg Response</div>
          </Card>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Filter by category:
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTag === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag("")}
            >
              All Stories
            </Button>
            {VALID_TAGS.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {stories.map((story) => (
            <StoryCard
              key={story._id}
              story={story}
              onSelect={setSelectedStory}
              onUpvote={handleUpvoteStory}
              onReport={handleReportSimilar}
            />
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => fetchStories(page + 1, selectedTag, searchQuery, sortBy)}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                "Load More Stories"
              )}
            </Button>
          </div>
        )}

        {stories.length === 0 && !loading && (
          <Card className="shadow-lg">
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No stories found
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to share your experience and help others stay safe!
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                Share Your Story
              </Button>
            </div>
          </Card>
        )}
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Share Your Anonymous Story
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewStory("");
                    setNewStoryTags([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {Icons.Close()}
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your story (minimum 30 characters)
                  </label>
                  <textarea
                    className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                    placeholder="Share your experience anonymously to help others stay safe from similar scams..."
                    value={newStory}
                    onChange={(e) => setNewStory(e.target.value)}
                    rows="6"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {newStory.length}/30 minimum
                    </span>
                    <span className="text-xs text-gray-400">
                      Your identity will remain completely anonymous
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories (max 3)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {VALID_TAGS.map((tag) => (
                      <Button
                        key={tag}
                        variant={
                          newStoryTags.includes(tag) ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleTagToggle(tag)}
                        disabled={
                          !newStoryTags.includes(tag) &&
                          newStoryTags.length >= 3
                        }
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select categories that best describe your experience
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewStory("");
                      setNewStoryTags([]);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateStory}
                    disabled={creating || newStory.trim().length < 30}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sharing...
                      </>
                    ) : (
                      "Share Story"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Custom CSS for enhanced visuals */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bg-red-500 { background-color: #ef4444; }
        .bg-yellow-500 { background-color: #eab308; }
        .bg-green-500 { background-color: #22c55e; }
        .text-red-600 { color: #dc2626; }
        .text-yellow-600 { color: #ca8a04; }
        .text-green-600 { color: #16a34a; }
      `}</style>
    </div>
  );
}

export default Anonymous;
