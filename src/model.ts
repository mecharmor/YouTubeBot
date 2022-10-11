export interface BaseSample {
    readonly fullPath : string;
    readonly fileName : string;
    readonly durationSec : number;
}

export type AudioSample = BaseSample
export interface VideoSample extends BaseSample {
    readonly thumbnailPath? : string;
}