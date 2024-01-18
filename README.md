# YouTube Uploader Bot
This is a rough concept of a youtube bot written primarily in Node.js to perform basic web scraping of creative commons sounds, string them together for hours on end and upload it to youtube.

See an active YouTube channel running this! Here: https://www.youtube.com/channel/UCz-s_PckoXMNpIVtNL7NSJQ

## Prerequisites
1. This project uses the 'googleapis' package which uses Google auth OAuth2 so you will need to create a client_oath_token.json at the root of the project for access to uploading youtube videos. Follow this guide: https://developers.google.com/youtube/v3/quickstart/nodejs
2. Copy the `.env.sample` to `.env` and fill the fields with your desired configuration

## Getting Started

1. Clone project
2. Build project with: `npm run build` or `npm run build:watch`
3. Start project with: `npm start`

> See .env.sample for runtime configurations
