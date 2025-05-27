# YouTube Uploader Bot 🎵

An automated Node.js application that creates and uploads long-form audio content to YouTube. This bot scrapes Creative Commons audio content, processes it into continuous streams, generates metadata using AI, and handles the YouTube upload process automatically.

## 🌟 Features

- **Audio Scraping**: Automatically finds and downloads Creative Commons audio content
- **Audio Processing**: Combines and renders audio into continuous streams
- **AI-Powered Metadata**: Generates video titles and descriptions using DeepSeek AI model
- **YouTube Integration**: Automated upload process using YouTube Data API v3
- **Customizable**: Configurable duration, content selection, and upload parameters

## 🚀 Live Example

Check out a live YouTube channel running this bot:
[Ambient Soundscapes](https://www.youtube.com/channel/UCz-s_PckoXMNpIVtNL7NSJQ)

## 📋 Prerequisites

1. **Google API Setup**
   - Create a `client_oauth_token.json` file in the project root
   - Follow the [YouTube Data API Quickstart Guide](https://developers.google.com/youtube/v3/quickstart/nodejs)
   - Enable the YouTube Data API v3 in your Google Cloud Console

2. **Environment Configuration**
   - Copy `.env.sample` to `.env`
   - Configure your settings in the `.env` file

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd youtube-uploader-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   # or for development with watch mode:
   npm run build:watch
   ```

4. Start the application:
   ```bash
   npm start
   ```

## ⚙️ Configuration

The application can be configured through the `.env` file. See `.env.sample` for available options:
- Audio duration settings
- Content selection parameters
- YouTube upload preferences
- AI model configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

#### API Keys
- `PIXEL_API_KEY`: Your Pexels API key for fetching thumbnails based on keywords
  - Get your API key from [Pexels API](https://www.pexels.com/api/)
  - Required for thumbnail generation

#### Debug & Logging
- `DEBUG`: Enable additional logging for debugging
  - Set to `true` to enable detailed logging
  - Useful for tracking success/failure scenarios

#### Video Duration Settings
- `DURATION_HOURS`: Hours component of video duration
- `DURATION_MINUTES`: Minutes component of video duration
- `DURATION_SECONDS`: Seconds component of video duration
- `SHOULD_USE_RANDOM_DURATION`: Alternative to fixed duration
  - Set to `true` to generate random hour-based durations
  - Overrides fixed duration settings when enabled

#### Video Generation Options
- `SHOULD_UPLOAD_NEW_VIDEO_FOR_EVERY_HOUR_IN_DURATION`: Multi-hour video handling
  - Set to `true` to create separate videos for each hour in multi-hour durations
  - Useful for breaking up long content into manageable chunks

#### Cache Management
- `DISABLE_CACHE_CLEANUP`: Control temporary file cleanup
  - Set to `true` to prevent removal of temporary files after rendering
  - Useful for debugging or preserving intermediate files

#### Discord Integration
- `DISCORD_WEBHOOK_URL`: Webhook URL for Discord notifications
  - Receive upload status updates in your Discord channel
- `DISCORD_WEBHOOK_AVATAR_URL`: Custom avatar for Discord messages
  - URL to the image that will be used as the webhook's avatar

Example `.env` configuration:
```env
PIXEL_API_KEY=your_pexels_api_key
DEBUG=false
DURATION_HOURS=2
DURATION_MINUTES=0
DURATION_SECONDS=0
DISABLE_CACHE_CLEANUP=false
SHOULD_UPLOAD_NEW_VIDEO_FOR_EVERY_HOUR_IN_DURATION=true
SHOULD_USE_RANDOM_DURATION=false
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
DISCORD_WEBHOOK_AVATAR_URL=https://example.com/avatar.png
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This bot is intended for use with properly licensed Creative Commons content. Please ensure you comply with all relevant licenses and YouTube's terms of service when using this tool.
