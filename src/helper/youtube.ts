// Implementation pulled from: https://quanticdev.com/articles/automating-my-youtube-uploads-using-nodejs/

// YouTube API video uploader using JavaScript/Node.js
// You can find the full visual guide at: https://www.youtube.com/watch?v=gncPwSEzq1s
// You can find the brief written guide at: https://quanticdev.com/articles/automating-my-youtube-uploads-using-nodejs
//
// Upload code is adapted from: https://developers.google.com/youtube/v3/quickstart/nodejs

import fs from 'fs';
import readline from 'readline';
import { resolve } from 'path';
import { default as googleapis } from 'googleapis';
const { google } = googleapis;
import { VideoSample } from '../model.js';
const OAuth2 = google.auth.OAuth2;

// video category IDs for YouTube:
enum YouTubeCategory {
    Entertainment = 24,
    Education = 27,
    ScienceTechnology = 28,
}

// If modifying these scopes, delete your previously saved credentials in client_oauth_token.json
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
const TOKEN_PATH = '../client_oauth_token.json';

export interface YouTubeVideo {
    readonly title: string;
    readonly description: string;
    readonly tags?: string[];
    readonly video: Pick<VideoSample, 'fullPath' | 'thumbnailPath'>;
}

export function upload2YouTube(
    youTubeVideo: YouTubeVideo
): Promise<string | any> {
    return new Promise((res, rej) => {
        const {
            video: { fullPath, thumbnailPath },
        } = youTubeVideo;
        if (!fs.existsSync(fullPath)) {
            rej(`File Path not found at ${fullPath}`);
            return;
        }

        if (!fs.existsSync(thumbnailPath)) {
            rej(`Thumbnail not found at ${thumbnailPath}`);
            return;
        }

        // Load client secrets from a local file.
        fs.readFile(
            resolve('./client_secret.json'),
            function processClientSecrets(err, content) {
                if (err) {
                    rej('Error loading client secret file: ' + err);
                    return;
                }
                // Authorize a client with the loaded credentials, then call the YouTube API.
                authorize(JSON.parse(content as any), (auth) =>
                    uploadVideo(auth, youTubeVideo)
                        .then((r: any) => res(r))
                        .catch((err: any) => rej(err))
                );
            }
        );
    });
}

/**
 * Upload the video file.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function uploadVideo(
    auth: any,
    {
        title,
        description,
        tags = [],
        video: { fullPath, thumbnailPath },
    }: YouTubeVideo
): Promise<string | any> {
    const service = google.youtube('v3');

    return new Promise((resolve, reject) => {
        service.videos.insert(
            {
                auth,
                part: ['snippet,status'],
                requestBody: {
                    snippet: {
                        title,
                        description,
                        tags,
                        categoryId: `${YouTubeCategory.Entertainment}`,
                        defaultLanguage: 'en',
                        defaultAudioLanguage: 'en',
                    },
                    status: {
                        privacyStatus: 'public',
                    },
                },
                media: {
                    body: fs.createReadStream(fullPath),
                },
            },
            function (err, response): void {
                if (err) {
                    reject(`Failed to upload youtube video: ${err}`);
                    return;
                }

                // console.log(response.data);
                // console.log('Video uploaded. Uploading the thumbnail now.');
                service.thumbnails.set(
                    {
                        auth,
                        videoId: response.data.id,
                        media: {
                            body: fs.createReadStream(thumbnailPath),
                        },
                    },
                    function (err, response): void {
                        if (err) {
                            reject(`Failed to set thumbnail: ${err}`);
                            return;
                        }

                        resolve(response);
                    }
                );
            }
        );
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token as any);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from the url page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) throw err;
        console.log('Token stored to ' + TOKEN_PATH);
    });
}
