# bbb-livestream-plugin

A BigBlueButton v3 plugin that gives moderators a one-click **Go Live** button to stream any BBB meeting to YouTube, Facebook, Twitch, or any custom RTMP endpoint.

Works with [bbb-livestream-service](https://github.com/your-org/bbb-livestream-service) — the Node.js capture backend.

---

## Features

- 🔴 One-click Go Live from the BBB options menu
- 📺 Multi-platform: YouTube, Facebook, Twitch, custom RTMP
- 📊 Live bitrate + duration display
- 🔗 HLS viewer URL with one-click copy
- 🔒 Moderator-only — invisible to attendees
- 🎚 Quality selector: 1080p / 720p / 480p

---

## Repository Structure

```
bbb-livestream-plugin/
├── src/
│   ├── index.tsx                  # Plugin entry point — registers BBB dropdown button
│   ├── components/
│   │   └── LivestreamModal.tsx    # Full config + live status modal
│   ├── hooks/
│   │   ├── useStreamState.ts      # Stream lifecycle state machine
│   │   └── useElapsedTime.ts      # Live elapsed timer
│   ├── utils/
│   │   └── api.ts                 # Control API client
│   └── types/
│       └── index.ts               # Shared TypeScript types
├── public/
│   ├── manifest.json              # BBB plugin manifest
│   └── locales/
│       └── en.json                # UI strings
├── package.json
├── tsconfig.json
└── webpack.config.js
```

---

## Prerequisites

- BigBlueButton v3.x
- [bbb-livestream-service](https://github.com/your-org/bbb-livestream-service) running on port 3020
- Node.js 18+

---

## Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload on port 4701)
npm start

# Register dev plugin in BBB
# Add to /etc/bigbluebutton/bbb-web.properties:
# pluginManifests=[{"url":"http://YOUR_DEV_IP:4701/manifest.json"}]
# sudo bbb-conf --restart
```

---

## Production Build

```bash
npm run build-bundle

# Copy dist/ to BBB web root
sudo mkdir -p /var/www/bigbluebutton-default/assets/plugins/livestream
sudo cp -r dist/* /var/www/bigbluebutton-default/assets/plugins/livestream/
sudo cp public/manifest.json /var/www/bigbluebutton-default/assets/plugins/livestream/
sudo cp -r public/locales /var/www/bigbluebutton-default/assets/plugins/livestream/

# Register in BBB
echo 'pluginManifests=[{"url":"https://YOUR_BBB_DOMAIN/plugins/livestream/manifest.json"}]' \
  | sudo tee -a /etc/bigbluebutton/bbb-web.properties

sudo bbb-conf --restart
```

---

## Configuration

Set the control API URL by injecting a global before the plugin loads.
Add to `/var/www/bigbluebutton-default/index.html` (just before `</head>`):

```html
<script>
  window.BBB_LIVESTREAM_API_URL = 'https://YOUR_BBB_DOMAIN:3020';
</script>
```

Or configure via nginx to proxy `/livestream-api/` to port 3020 to avoid exposing extra ports.

---

## How It Works

1. Moderator clicks **🔴 Start Livestream** from the BBB options menu
2. Modal opens — moderator selects platform, pastes stream key, selects quality
3. Plugin POSTs to `bbb-livestream-service` control API (`/stream/start`)
4. Backend launches headless Chrome + FFmpeg capture worker
5. Stream goes live on the chosen platform
6. Modal shows live duration, bitrate, and HLS viewer URL
7. Moderator clicks **⏹ Stop Stream** to end it

---

## Security Notes

- Only users with `MODERATOR` role can see the livestream button
- Stream keys are never logged or stored — they're sent once to the control API and used immediately
- The control API should be protected with a shared secret or IP allowlist in production

---

## License

MIT
