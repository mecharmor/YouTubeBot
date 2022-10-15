import dotenv from 'dotenv';
dotenv.config();

export function isDebugging(): boolean {
    return !!Number(process.env.DEBUG);
}

export function cacheCleanupDisabled(): boolean {
    return !!Number(process.env.DISABLE_CACHE_CLEANUP);
}

export function shouldUploadVideoForEveryHourInDuration(): boolean {
    return !!Number(
        process.env.SHOULD_UPLOAD_NEW_VIDEO_FOR_EVERY_HOUR_IN_DURATION
    );
}

export function getDurationFromEnv(): number[] {
    const [hours, minutes, seconds] = [
        Number(process.env.DURATION_HOURS),
        Number(process.env.DURATION_MINUTES),
        Number(process.env.DURATION_SECONDS),
    ];
    return [
        Number.isNaN(hours) ? 0 : hours,
        Number.isNaN(minutes) ? 0 : minutes,
        Number.isNaN(seconds) ? 0 : seconds,
    ];
}
