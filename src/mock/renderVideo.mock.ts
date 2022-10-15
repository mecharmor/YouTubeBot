import { AudioSample } from '../model.js';
import { makeVideo } from '../helper/renderer.js';
const mockDownloadedFile: AudioSample = {
    fileName: 'Small Waterfall.wav',
    fullPath: './temp_downloads/Small Waterfall.wav',
    durationSec: 86.0,
};
makeVideo({
    duration: '00:30:00.000',
    backgroundImagePath: './temp_downloads/test.jpg',
    audio: mockDownloadedFile,
    outputFilePath: './temp_downloads/test.mp4',
})
    .then(() => {
        console.log('success!');
    })
    .catch(() => {
        console.log('failed!');
    });
