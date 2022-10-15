import { upload2YouTube } from '../helper/youtube.js';
import { resolve } from 'path';
upload2YouTube({
    title: 'test uploaded youtube video',
    description: 'this is a youtube video test description',
    video: {
        fullPath: resolve('./temp_downloads/test.mp4'),
        thumbnailPath: './temp_downloads/test.jpg',
    },
});
