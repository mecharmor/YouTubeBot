# YouTube Uploader Bot 🎵

An automated Node.js application that creates and uploads long-form audio content to YouTube. This bot scrapes Creative Commons audio content, processes it into continuous streams, generates metadata using AI, and handles the YouTube upload process automatically.

## 🌟 Features

- **Audio Scraping**: Automatically finds and downloads Creative Commons audio content
- **Audio Processing**: Combines and renders audio into continuous streams
- **AI-Powered Metadata**: Generates video titles and descriptions using [DeepSeek V3.1](https://openrouter.ai/deepseek/deepseek-chat-v3.1:free) via OpenRouter
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

2. **OpenRouter AI Setup**
   - Sign up for a free account at [OpenRouter](https://openrouter.ai/)
   - Navigate to your [API Keys page](https://openrouter.ai/keys)
   - Create a new API key
   - Copy the key to your `.env` file as `OPENROUTER_MODEL_KEY_DEEPSEEK`
   - The bot uses the free DeepSeek V3.1 model for generating video titles and descriptions

3. **Environment Configuration**
   - Create a `.env` file in the project root
   - Configure your settings using the variables listed below

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

- `OPENROUTER_MODEL_KEY_DEEPSEEK`: Your OpenRouter API key for AI-powered metadata generation
  - Get your API key from [OpenRouter](https://openrouter.ai/)
  - Required for generating video titles and descriptions using DeepSeek AI
  - Uses the free DeepSeek V3.1 model: `deepseek/deepseek-chat-v3.1:free`

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
  - Set to `1` to prevent removal of temporary files after rendering
  - Useful for debugging or preserving intermediate files

#### Development & Testing
- `SHOULD_USE_MOCK_AUDIO`: Use mock audio file instead of downloading
  - Set to `1` to use a local `mock.mp3` file instead of downloading from free-loops.com
  - Useful for testing without internet connection or API limits
  - Requires a `mock.mp3` file in the project root directory

- `SHOULD_USE_MOCK_IMAGE`: Use mock image file instead of downloading from Pexels
  - Set to `1` to use a local `mock/image.jpeg` file instead of downloading from Pexels API
  - Useful for testing without internet connection or API limits
  - Requires a `mock/image.jpeg` file in the project root directory

- `SHOULD_SKIP_AI_CONTENT_GENERATION`: Skip AI-powered title and description generation
  - Set to `1` to use raw audio filenames as titles instead of AI-generated content
  - Useful for testing without OpenRouter API access or to avoid AI generation costs
  - When enabled, uses the original audio filename as both title and description

#### Discord Integration
- `DISCORD_WEBHOOK_URL`: Webhook URL for Discord notifications
  - Receive upload status updates in your Discord channel
- `DISCORD_WEBHOOK_AVATAR_URL`: Custom avatar for Discord messages
  - URL to the image that will be used as the webhook's avatar

Example `.env` configuration:
```env
# API Keys
PIXEL_API_KEY=your_pexels_api_key
OPENROUTER_MODEL_KEY_DEEPSEEK=your_openrouter_api_key

# Debug & Logging
DEBUG=false

# Video Duration Settings
DURATION_HOURS=2
DURATION_MINUTES=0
DURATION_SECONDS=0
SHOULD_USE_RANDOM_DURATION=false

# Video Generation Options
SHOULD_UPLOAD_NEW_VIDEO_FOR_EVERY_HOUR_IN_DURATION=true

# Cache Management
DISABLE_CACHE_CLEANUP=false

# Development & Testing
SHOULD_USE_MOCK_AUDIO=false
SHOULD_USE_MOCK_IMAGE=false
SHOULD_SKIP_AI_CONTENT_GENERATION=false

# Discord Integration (Optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
DISCORD_WEBHOOK_AVATAR_URL=https://example.com/avatar.png
```

## 🤖 AI Features

This bot uses [OpenRouter](https://openrouter.ai/) to access the free [DeepSeek V3.1 model](https://openrouter.ai/deepseek/deepseek-chat-v3.1:free) for generating YouTube metadata:

### Title Generation
- Automatically creates engaging, SEO-friendly titles from raw audio filenames
- Removes technical terms like "Loop" and "Loops" 
- Incorporates duration information (e.g., "2 hours of Bongo Sounds")
- Ensures titles meet YouTube's 100-character limit

### Description Generation
- Generates comprehensive video descriptions with relevant keywords
- Includes duration information for better searchability
- Optimized for YouTube's 5000-character description limit
- Focuses on search engine optimization

### Benefits of DeepSeek V3.1
- **Free to use** - No cost for API calls
- **High quality** - 671B parameter model with 37B active parameters
- **Fast responses** - Optimized for quick generation
- **Context aware** - Up to 128K token context window
- **Reliable** - Consistent output formatting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This bot is intended for use with properly licensed Creative Commons content. Please ensure you comply with all relevant licenses and YouTube's terms of service when using this tool.
