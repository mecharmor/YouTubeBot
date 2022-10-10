export interface BaseSample {
    readonly fullPath : string;
    readonly fileName : string;
    readonly durationSec : number;
}

export type AudioSample = BaseSample
export type VideoSample = BaseSample