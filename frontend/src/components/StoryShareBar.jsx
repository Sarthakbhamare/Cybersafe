import React from 'react';
import Button from './ui/Button';
import { shareStory } from '../utils/storyApi';

const platforms = [
  { key: 'whatsapp', label: 'WhatsApp', emoji: '🟢' },
  { key: 'telegram', label: 'Telegram', emoji: '📨' },
  { key: 'instagram', label: 'Instagram', emoji: '📸' },
  { key: 'copy', label: 'Copy Link', emoji: '🔗' },
];

export default function StoryShareBar({ story, onUpdate }) {
  const url = typeof window !== 'undefined' ? window.location.origin + '/story/' + story._id : '';
  const title = story.textRedacted?.slice(0, 80) + (story.textRedacted?.length > 80 ? '…' : '');

  const handleShare = async (p) => {
    try {
      // Native share first if available and not copy
      if (navigator.share && p !== 'copy') {
        try {
          await navigator.share({ title: 'CyberSafe Story', text: title, url });
        } catch (_) {}
      } else {
        if (p === 'whatsapp') {
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`,'_blank');
        } else if (p === 'telegram') {
          window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,'_blank');
        } else if (p === 'instagram') {
          // No direct URL scheme; attempt native share else copy
          if (!navigator.share) {
            await navigator.clipboard.writeText(url);
          }
        } else if (p === 'copy') {
          await navigator.clipboard.writeText(url);
        }
      }
      const res = await shareStory(story._id, p);
      onUpdate && onUpdate({ ...story, shares: res.shares });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3" aria-label="Share story">
      {platforms.map(pl => (
        <Button
          key={pl.key}
          size="sm"
          variant="outline"
          onClick={() => handleShare(pl.key)}
          leftIcon={<span>{pl.emoji}</span>}
        >
          {pl.label}{' '}
          {story.shares?.[pl.key] ? `(${story.shares[pl.key]})` : ''}
        </Button>
      ))}
    </div>
  );
}
