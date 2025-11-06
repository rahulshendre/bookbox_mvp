import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};

export const YOUTUBE_API_KEY = extra.youtubeApiKey || '';
export const YOUTUBE_CHANNEL_ID = extra.youtubeChannelId || '';

