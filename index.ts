// Stream state machine — mirrors Jibri's state concepts
export type StreamStatus =
  | 'IDLE'
  | 'STARTING'
  | 'LIVE'
  | 'STOPPING'
  | 'ERROR';

export interface StreamConfig {
  rtmpUrl: string;       // e.g. rtmp://a.rtmp.youtube.com/live2
  streamKey: string;     // platform stream key
  platform: StreamPlatform;
  quality: StreamQuality;
}

export type StreamPlatform =
  | 'youtube'
  | 'facebook'
  | 'twitch'
  | 'custom';

export type StreamQuality =
  | '1080p'   // 3000kbps — high quality
  | '720p'    // 2000kbps — balanced
  | '480p';   // 1000kbps — low bandwidth

export interface StreamState {
  status: StreamStatus;
  streamId: string | null;
  hlsUrl: string | null;
  workerId: string | null;
  startedAt: number | null;
  bitrate: number | null;
  error: string | null;
}

export interface StartStreamResponse {
  status: 'starting';
  streamId: string;
  workerId: string;
  hlsUrl: string;
}

export interface StopStreamResponse {
  status: 'stopping';
  workerId: string;
}

export interface StreamStatsEvent {
  workerId: string;
  meetingId: string;
  bitrate: string;
}

export const PLATFORM_RTMP_URLS: Record<StreamPlatform, string> = {
  youtube: 'rtmp://a.rtmp.youtube.com/live2',
  facebook: 'rtmps://live-api-s.facebook.com:443/rtmp',
  twitch: 'rtmp://live.twitch.tv/app',
  custom: '',
};

export const QUALITY_LABELS: Record<StreamQuality, string> = {
  '1080p': '1080p HD (3000 kbps)',
  '720p': '720p (2000 kbps)',
  '480p': '480p (1000 kbps)',
};
