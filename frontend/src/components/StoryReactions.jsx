import React from 'react';
import Button from './ui/Button';
import { reactStory } from '../utils/storyApi';
import { useAuth } from '../context/AuthContext';

const reactionMeta = [
  { key: 'like', label: '👍' },
  { key: 'love', label: '❤️' },
  { key: 'laugh', label: '😂' },
  { key: 'wow', label: '😮' },
  { key: 'sad', label: '😢' },
  { key: 'angry', label: '😡' },
];

export default function StoryReactions({ story, onUpdate }) {
  const { user } = useAuth();
  const disabled = !user;

  const handleReact = async (key) => {
    if (disabled) return;
    try {
      const res = await reactStory(story._id, key);
      onUpdate && onUpdate({ ...story, reactions: res.reactions, myReaction: res.myReaction });
    } catch (e) {
      // swallow error or show toast
      console.error(e);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2" aria-label="Story reactions">
      {reactionMeta.map(r => {
        const count = story.reactions?.[r.key] || 0;
        const active = story.myReaction === r.key;
        return (
          <button
            key={r.key}
            onClick={() => handleReact(r.key)}
            disabled={disabled}
            className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 border transition ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-pressed={active}
            aria-label={`${r.key} reaction (${count})`}
          >
            <span>{r.label}</span>
            <span className="font-medium">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
