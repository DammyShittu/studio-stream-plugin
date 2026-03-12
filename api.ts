import {
  StreamConfig,
  StartStreamResponse,
  StopStreamResponse,
} from '../types';

// Control service base URL — set via plugin settings or env
const API_BASE = (window as any).BBB_LIVESTREAM_API_URL
  || process.env.BBB_LIVESTREAM_API_URL
  || 'https://YOUR_BBB_DOMAIN:3020';

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function startStream(
  meetingId: string,
  config: StreamConfig,
): Promise<StartStreamResponse> {
  return apiFetch<StartStreamResponse>('/stream/start', {
    method: 'POST',
    body: JSON.stringify({
      meetingId,
      rtmpUrl: config.rtmpUrl,
      streamKey: config.streamKey,
      quality: config.quality,
    }),
  });
}

export async function stopStream(
  meetingId: string,
): Promise<StopStreamResponse> {
  return apiFetch<StopStreamResponse>('/stream/stop', {
    method: 'POST',
    body: JSON.stringify({ meetingId }),
  });
}

export async function getPoolStatus(): Promise<unknown[]> {
  return apiFetch<unknown[]>('/stream/pool');
}

// Long-poll for real-time bitrate stats
// Uses SSE if supported, falls back to polling
export function subscribeToStats(
  meetingId: string,
  onStats: (bitrate: number) => void,
  onError: () => void,
): () => void {
  let active = true;

  const poll = async () => {
    try {
      const data = await apiFetch<{ bitrate: number }>(
        `/stream/stats/${meetingId}`,
      );
      if (active && data.bitrate) onStats(data.bitrate);
    } catch {
      if (active) onError();
    }
    if (active) setTimeout(poll, 3000);
  };

  poll();
  return () => { active = false; };
}
