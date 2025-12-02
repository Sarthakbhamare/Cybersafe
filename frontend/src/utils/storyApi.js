import { get, post } from './apiClient';

export const listStories = (params = {}) => get('/stories', params);
export const getMyStories = (params = {}) => get('/stories/mine/list', params);
export const getStoryById = (id) => get(`/stories/${id}`);

export const reactStory = (id, reaction) => post(`/stories/${id}/react`, { reaction });
export const shareStory = (id, platform) => post(`/stories/${id}/share`, { platform });

export const addComment = (storyId, text) => post(`/stories/${storyId}/comments`, { text });
export const reactComment = (commentId, reaction) => post(`/stories/comments/${commentId}/react`, { reaction });
