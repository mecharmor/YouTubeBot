// ffmpeg -loop 1 -framerate 2 -i test.jpg -i long.wav -c:v libx264 -preset medium -tune stillimage -crf 18 -c:a aac -b:a 192k -shortest -pix_fmt yuv420p -movflags +faststart -vf scale="1920:trunc(ow/a/2)*2" output.mp4

// https://archive.org/download/NeverGonnaGiveYouUp/jocofullinterview41.mp3

import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { AudioSample } from '../model.js';

export function makeVideo({
    duration,
    backgroundImagePath,
    audio,
    outputFilePath,
}: {
    duration: 'HH:MM:SS.000' | string;
    backgroundImagePath: string;
    audio: AudioSample;
    outputFilePath: string;
}): Promise<void> {
    const args: string[] = [
        '-loop 1',
        '-framerate 2',
        `-i "${backgroundImagePath}"`, // test.jpg
        '-stream_loop -1',
        `-i "${audio.fullPath}"`, //long.wav
        '-c:v libx264',
        '-preset medium',
        '-tune stillimage',
        '-crf 18',
        '-c:a aac',
        `-t "${duration}"`, // "00:30:00.000", HH:MM:SS.000
        '-b:a 192k',
        '-shortest',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
        '-vf scale="1920:trunc(ow/a/2)*2"',
        `"${outputFilePath}"`, // output.mp4
        '-y', // For yes when prompted
    ];

    return new Promise((res, rej) => {
        const child: ChildProcessWithoutNullStreams = spawn('ffmpeg', args, {
            shell: true,
        });
        child.stdout.on('data', (data: any) =>
            process.stdout.write(data.toString())
        );
        child.stderr.on('data', (data: any) =>
            process.stdout.write(data.toString())
        );
        child.on('close', (code) => (code === 0 ? res() : rej()));
    });
}
