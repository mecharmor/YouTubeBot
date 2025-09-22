import { spawn } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { AudioSample } from '../model.js';
import path from 'path';
import os from 'os';

export async function preProcessAudio({
    audio,
    trimHeadSec = 0,              // manual cut from start (seconds)
    trimTailSec = 0,              // manual cut from end (seconds)
    minRemainingSec = 1,          // minimum audio length to keep (seconds)
    silenceThreshold = '-50dB',   // threshold for silence detection
    applyMicroFade = true,        // tiny fade in/out to prevent clicks
    normalize = true,             // normalize loudness
    targetSampleRate = 48000,     // resample to stable rate
  }: {
    audio: AudioSample;
    trimHeadSec?: number;
    trimTailSec?: number;
    minRemainingSec?: number;
    silenceThreshold?: string;
    applyMicroFade?: boolean;
    normalize?: boolean;
    targetSampleRate?: number;
  }): Promise<string> {
    const dur = audio.durationSec;
  
    // Ensure we don’t trim away the whole file
    const safeHead = Math.max(trimHeadSec, 0);
    const safeTail = Math.max(trimTailSec, 0);
    const effectiveDur = Math.max(minRemainingSec, dur - safeHead - safeTail);
  
    // Use .m4a instead of raw .aac for safer containerized output
    const tmpFile = path.join(os.tmpdir(), `clean-${Date.now()}.m4a`);
  
    // Build filter chain step by step
    const filters: string[] = [];
  
    // 1. Remove silence (leading + trailing)
    filters.push(
      `silenceremove=start_periods=1:start_threshold=${silenceThreshold}:stop_periods=1:stop_threshold=${silenceThreshold}:detection=peak`
    );
  
    // 2. Manual trims
    filters.push(`atrim=${safeHead}:${(safeHead + effectiveDur).toFixed(3)}`);
  
    // 3. Optional micro fade in/out (5–10 ms)
    if (applyMicroFade) {
      const fadeDur = 0.01; // 10 ms
      filters.push(`afade=t=in:ss=0:d=${fadeDur}`);
      filters.push(
        `afade=t=out:st=${(effectiveDur - fadeDur).toFixed(3)}:d=${fadeDur}`
      );
    }
  
    // 4. Normalize loudness
    if (normalize) {
      filters.push(`loudnorm=I=-16:TP=-1.5:LRA=11`);
    }
  
    // 5. Gentle high‑pass and low‑pass to clean rumble and hiss
    filters.push(`highpass=f=30,lowpass=f=18000`);
  
    // 6. Resample and enforce stereo layout
    if (targetSampleRate) {
      filters.push(`aresample=${targetSampleRate}`);
      filters.push(`aformat=channel_layouts=stereo`);
    }
  
    // 7. Reset timestamps (final step, with output label)
    filters.push(`asetpts=PTS-STARTPTS[aout]`);
  
    const filter = `[0:a]${filters.join(',')}`;
  
    const args: string[] = [
      '-i',
      audio.fullPath,
      '-filter_complex',
      filter,
      '-map',
      '[aout]',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-f', 'mp4',   // ensure proper container for .m4a
      tmpFile,
      '-y',
    ];
  
    await new Promise<void>((res, rej) => {
      const child = spawn(ffmpegInstaller.path, args);
      child.stderr.on('data', (data: any) =>
        process.stdout.write(data.toString())
      );
      child.on('close', (code) =>
        code === 0 ? res() : rej(new Error(`ffmpeg exited with ${code}`))
      );
    });
  
    return tmpFile;
}

export async function makeVideo({
    duration,
    backgroundImagePath,
    audio,
    outputFilePath,
    enableFade = false,          // new flag to toggle fade logic
    fadeDurationMs = 300,       // only used if enableFade = true
    branchVolume = 1.0,         // default 100% volume
  }: {
    duration: 'HH:MM:SS.000' | string;
    backgroundImagePath: string;
    audio: AudioSample;
    outputFilePath: string;
    enableFade?: boolean;
    fadeDurationMs?: number;
    branchVolume?: number;
  }): Promise<void> {
    const cleanedPath = await preProcessAudio({ audio });
  
    let filter: string;
  
    if (enableFade) {
      // Crossfade logic
      filter =
        `[1:a]aloop=loop=-1:size=2000000000,asplit=2[a][b];` +
        `[a]asetpts=PTS-STARTPTS,volume=${branchVolume}[a0];` +
        `[b]adelay=${fadeDurationMs}|${fadeDurationMs},asetpts=PTS-STARTPTS,volume=${branchVolume}[b0];` +
        `[a0][b0]amix=inputs=2[aout]`;
    } else {
      // Simple infinite loop, no fade
      filter =
        `[1:a]aloop=loop=-1:size=2000000000,asetpts=PTS-STARTPTS[aout]`;
    }
  
    const args: string[] = [
      '-loop', '1',
      '-framerate', '2',
      '-i', backgroundImagePath,
      '-i', cleanedPath,
      '-filter_complex', filter,
      '-map', '0:v',
      '-map', '[aout]',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-tune', 'stillimage',
      '-crf', '18',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-t', duration,
      '-shortest',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-vf', 'scale=1920:trunc(ow/a/2)*2',
      outputFilePath,
      '-y',
    ];
  
    await new Promise<void>((res, rej) => {
      const child = spawn(ffmpegInstaller.path, args);
      child.stderr.on('data', (data: any) => process.stdout.write(data.toString()));
      child.on('close', (code) =>
        code === 0 ? res() : rej(new Error(`ffmpeg exited with ${code}`))
      );
    });
  }
