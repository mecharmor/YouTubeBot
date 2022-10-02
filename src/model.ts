export interface BaseSample {
    readonly fullPath : string;
    readonly fileName : string;
    readonly durationSec : number;
}

export interface AudioSample extends BaseSample{}
export interface VideoSample extends BaseSample {}