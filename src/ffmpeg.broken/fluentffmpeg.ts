import { ReadStream, WriteStream } from 'fs';

// https://www.npmjs.com/package/fluent-ffmpeg
type FfmpegInput = string | ReadStream;
export const RENICE_HIGHEST_PRIORITY = -20;
export const RENICE_LOWEST_PRIORITY = 20;
export enum FfmpegVideoFilterType {
    FADE = 'fade',
    PAD = 'pad',
}
type FfmpegVideoFilterOptionExamples = 'in:0:30' | ['in', 0, 30] | '640:480:0:40:violet' | { t: 'in', s: 0, n: 30 };
export interface FfmpegFilterType {
    readonly filter :FfmpegVideoFilterType;
    readonly options : string | Array<string | number> | Object | FfmpegVideoFilterOptionExamples;
}

export interface FfmpegComplexFilterType extends FfmpegFilterType {
    readonly inputs : string | Array<string> | 'red' | [ 'padded', 'green' ];
    readonly outputs : string | Array<string> | 'green';
}

export interface FfmpegScreenshotsOptions {
    // output filename pattern (see below). Defaults to "tn.png".
    //  option specifies a filename pattern for generated files. It may contain the following format tokens:
    // '%s': offset in seconds
    // '%w': screenshot width
    // '%h': screenshot height
    // '%r': screenshot resolution (same as '%wx%h')
    // '%f': input filename
    // '%b': input basename (filename w/o extension)
    // '%i': index of screenshot in timemark array (can be zero-padded by using it like %000i)
    readonly filename? : string;
    // output folder for generated image files. Defaults to the current folder.
    readonly folder? : string;
    // specifies how many thumbnails to generate. When using this option, thumbnails are generated at regular intervals in the video (for example, when requesting 3 thumbnails, at 25%, 50% and 75% of the video length). count is ignored when timemarks or timestamps is specified.
    readonly count? : number;
    // timemarks or timestamps: specifies an array of timestamps in the video where thumbnails should be taken. Each timestamp may be a number (in seconds), a percentage string (eg. "50%") or a timestamp string with format "hh:mm:ss.xxx" (where hours, minutes and milliseconds are both optional).
    readonly timestamps? : number | string | '50%' | 'hh:mm:ss.xxx';
    // specifies a target size for thumbnails (with the same format as the .size() method).
    readonly size? : '50% | 1920x?' | '?x1080' | '1920x1080';
}

// https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#setting-event-handlers
export enum FfmpegOnEventHandlers {
    // The start event is emitted just after ffmpeg has been spawned. It is emitted with the full command line used as an argument.
    START = 'start',
    // The codecData event is emitted when ffmpeg outputs codec information about its input streams. It is emitted with an object argument with the following keys:
    CODEC_DATA = 'codecData',
    // The progress event is emitted every time ffmpeg reports progress information. It is emitted with an object argument with the following keys:
    PROGRESS = 'progress',
    // The progress event is emitted every time ffmpeg reports progress information
    PERCENT = 'percent',
    // The stderr event is emitted every time FFmpeg outputs a line to stderr. It is emitted with a string containing the line of stderr (minus trailing new line characters).
    STDERR = 'stderr',
    // The error event is emitted when an error occurs when running ffmpeg or when preparing its execution. It is emitted with an error object as an argument. If the error happened during ffmpeg execution, listeners will also receive two additional arguments containing ffmpegs stdout and stderr
    ERROR = 'error',
    // The end event is emitted when processing has finished. Listeners receive ffmpeg standard output and standard error as arguments, except when generating thumbnails (see below), in which case they receive an array of the generated filenames.
    END = 'end'
}

export interface FfmpegCommand {
    format( f : string ) : this;
    input( i : FfmpegInput ) : this;
    addInput( i : FfmpegInput ) : this;
    mergeAdd( i : FfmpegInput ) : this;
    inputFormat( f : string ) : this;
    inputFps( f : number ) : this;
    // read input at native framerate
    native() : this;
    // Seeks an input and only start decoding at given time offset. The time argument may be a number (in seconds) or a timestamp string (with format [[hh:]mm:]ss[.xxx]).
    seekInput( t : number | string ) : this;
    // loop over input
    loop( t? : number | string ) : this;
    // This method allows passing any input-related option to ffmpeg. You can call it with a single argument to pass a single option, optionnaly with a space-separated parameter:
    inputOptions( opts : string ) : this;
    // Disables audio in the output and remove any previously set audio option.
    noAudio() : this;
    // This method enables adding custom audio filters. You may add multiple filters at once by passing either several arguments or an array. See the Ffmpeg documentation for available filters and their syntax.
    // Each filter pased to this method can be either a filter string (eg. volume=0.5) or a filter specification object with the following keys:
    // https://www.ffmpeg.org/ffmpeg-filters.html#Audio-Filters
    audioFilters( f : string | { filter : string, options : string | Array<string | number> }[] ) : this;
    // Sets the audio bitrate in kbps. The bitrate parameter may be a number or a string with an optional k suffix. This method is used to enforce a constant bitrate; use audioQuality() to encode using a variable bitrate.
    audioBitrate( r? : number | string | '128k' ) : this;
    // set audio channel count
    audioChannels( c : number ) : this;
    // The freq parameter specifies the audio frequency in Hz.
    audioFrequency( f : number | 22050 ) : this;
    // This method fixes a quality factor for the audio codec (VBR encoding). The quality scale depends on the actual codec used.
    audioQuality( q : number ) : this;
    audioCodec( a : string ) : this;
    // This method disables video output and removes any previously set video option.
    noVideo() : this;
    // set video codec
    videoCodec( c : string | 'libx264' ) : this;
    // Sets the target video bitrate in kbps.
    // The bitrate argument may be a number or a string with an optional k suffix. The constant argument specifies whether a constant bitrate should be enforced (defaults to false).
    // Keep in mind that, depending on the codec used, enforcing a constant bitrate often comes at the cost of quality.
    // The best way to have a constant video bitrate without losing too much quality is to use 2-pass encoding (see Fffmpeg documentation).
    videoBitrate( b : number | string | 1000 | '1000' | '1000k' , enforceBitRate? : boolean ) : this;
    // This method enables adding custom video filters. You may add multiple filters at once by passing either several arguments or an array.
    // See the Ffmpeg documentation for available filters and their syntax.
    // Each filter pased to this method can be either a filter string (eg. fade=in:0:30) or a filter specification object with the following keys:
    // filter: filter name
    // options: optional; either an option string for the filter (eg. in:0:30),
    // an options array for unnamed options (eg. ['in', 0, 30])
    // or an object mapping option names to values (eg. { t: 'in', s: 0, n: 30 }). When options is not specified, the filter will be added without any options.
    videoFilters( f : string | FfmpegFilterType[] ) : this;
    // set output framerate
    fps( f : number ) : this;
    // Set ffmpeg to only encode a certain number of frames.
    frames( f : number ) : this;
    // This method sets the output frame size. The size argument may have one of the following formats:
    // 640x480: set a fixed output frame size. Unless autopad() is called, this may result in the video being stretched or squeezed to fit the requested size.
    // 640x?: set a fixed width and compute height automatically. If aspect() is also called, it is used to compute video height; otherwise it is computed so that the input aspect ratio is preserved.
    // ?x480: set a fixed height and compute width automatically. If aspect() is also called, it is used to compute video width; otherwise it is computed so that the input aspect ratio is preserved.
    // 50%: rescale both width and height to the given percentage. Aspect ratio is always preserved.
    // Note that for compatibility with some codecs, computed dimensions are always rounded down to multiples of 2.
    size( s : string | '50% | 1920x?' | '?x1080' | '1920x1080' ) : Omit<this, 'screenshots'>; // regarding screenshots: It doesn't interract well with filters. In particular, don't use the size() method to resize thumbnails, use the size option instead.
    // This method enforces a specific output aspect ratio. The aspect argument may either be a number or a X:Y string.
    // Note that calls to aspect() are ignored when size() has been called with a fixed width and height or a percentage, and also when size() has not been called at all.
    aspect( a : string | number | '4:3' | '16:9' ) : this;
    // This method enables applying auto-padding to the output video.
    // The color parameter specifies which color to use for padding, and must be a color code or name supported by ffmpeg (defaults to 'black').
    // The behaviour of this method depends on calls made to other video size methods:
    // when size() has been called with a percentage or has not been called, it is ignored;
    // when size() has been called with WxH, it adds padding so that the input aspect ratio is kept;
    // when size() has been called with either Wx? or ?xH, padding is only added if aspect() was called (otherwise the output dimensions are computed from the input aspect ratio and padding is not needed).
    autopad( a : string | 'white' | '#35A5FF' ) : this;
    // This method is useful when converting an input with non-square pixels to an output format that does not support non-square pixels (eg. most image formats). It rescales the input so that the display aspect ratio is the same.
    keepDAR() : this;
    // Adds an output to the command. The target argument may be an output filename or a writable stream (but at most one output stream may be used with a single command).
    // When target is a stream, an additional options object may be passed. If it is present, it will be passed ffmpeg output stream pipe() method.
    // Adding an output switches the "current output" of the command, so that any fluent-ffmpeg method that applies to an output is indeed applied to the last output added. For backwards compatibility reasons, you may as well call those methods before adding the first output (in which case they will apply to the first output when it is added). Methods that apply to an output are all non-input-related methods, except for complexFilter(), which is global.
    // Also note that when calling output(), you should not use the save() or stream() (formerly saveToFile() and writeToStream()) methods, as they already add an output. Use the run() method to start processing.
    output( o : string | WriteStream ) : this;
    // Forces ffmpeg to stop transcoding after a specific output duration. The time parameter may be a number (in seconds) or a timestamp string (with format [[hh:]mm:]ss[.xxx]).
    duration( d : string | number ) : this;
    // Calling this method makes fluent-ffmpeg run flvmeta or flvtool2 on the output file to add FLV metadata and make files streamable. It does not work when outputting to a stream, and is only useful when outputting to FLV format.
    flvmeta() : this;
    // This method allows passing any output-related option to ffmpeg. You can call it with a single argument to pass a single option, optionnaly with a space-separated parameter:
    outputOptions( opts : string | string[] ) : this;
    // There are two kinds of presets supported by fluent-ffmpeg. The first one is preset modules; to use those, pass the preset name as the preset argument. Preset modules are loaded from the directory specified by the presets constructor option (defaults to the lib/presets fluent-ffmpeg subdirectory).
    preset( p : string ) : this;
    // The complexFilter() method enables setting a complex filtergraph for a command. It expects a filter specification (or a filter specification array) and an optional output mapping parameter as arguments.
    // Filter specifications may be either plain ffmpeg filter strings (eg. split=3[a][b][c]) or objects with the following keys:
    // filter: filter name
    // options: optional; either an option string for the filter (eg. in:0:30), an options array for unnamed options (eg. ['in', 0, 30]) or an object mapping option names to values (eg. { t: 'in', s: 0, n: 30 }). When options is not specified, the filter will be added without any options.
    // inputs: optional; input stream specifier(s) for the filter. The value may be either a single stream specifier string or an array of stream specifiers. Each specifier can be optionally enclosed in square brackets. When input streams are not specified, ffmpeg will use the first unused streams of the correct type.
    // outputs: optional; output stream specifier(s) for the filter. The value may be either a single stream specifier string or an array of stream specifiers. Each specifier can be optionally enclosed in square brackets.
    // The output mapping parameter specifies which stream(s) to include in the output from the filtergraph. It may be either a single stream specifier string or an array of stream specifiers. Each specifier can be optionally enclosed in square brackets. When this parameter is not present, ffmpeg will default to saving all unused outputs to the output file.
    // Note that only one complex filtergraph may be set on a given command. Calling complexFilter() again will override any previously set filtergraph, but you can set as many filters as needed in a single call.
    complexFilter( f : ( string | FfmpegComplexFilterType )[] ) : this;
    on( ev : FfmpegOnEventHandlers, handler : Function ) : this;
    save( s : string ) : Omit<this, 'run'>;
    // tarts processing and pipes ffmpeg output to a writable stream. The options argument, if present, is passed to ffmpeg output stream's pipe() method (see nodejs documentation).
    // When no stream argument is present, the pipe() method returns a PassThrough stream, which you can pipe to somewhere else (or just listen to events on).
    pipe( s? : WriteStream, opts? : { end : boolean } ) : Omit<this, 'run'>;
    // This method is mainly useful when producing multiple outputs (otherwise the save() or stream() methods are more straightforward). It starts processing with the specified outputs.
    run() : void;
    // Use the input and mergeToFile methods on a command to concatenate multiple inputs to a single output file. The mergeToFile needs a temporary folder as its second argument.
    mergeToFile( filename : string, tmpdir : string ) : this;
    // Use the screenshots method to extract one or several thumbnails and save them as PNG files. There are a few caveats with this implementation, though:
    screenshots( opts : FfmpegScreenshotsOptions ) : Omit<this, 'run'>;
    // This method sends signal (defaults to 'SIGKILL') to the ffmpeg process. It only has sense when processing has started. Sending a signal that terminates the process will result in the error event being emitted.
    kill( sig? : 'SIGKILL' | 'SIGSTOP' | 'SIGCONT' ) : void;
    // This method alters the niceness (priority) value of any running ffmpeg process (if any) and any process spawned in the future. The niceness parameter may range from -20 (highest priority) to 20 (lowest priority) and defaults to 0 (which is the default process niceness on most *nix systems).
    // See: RENICE_HIGHEST_PRIORITY | RENICE_LOWEST_PRIORITY
    renice( r? : number | 0 | -20 | 20 ) : this;
    // You can read metadata from any valid ffmpeg input file with the modules ffprobe method.
    ffprobe( path : 0 | string, cb : ( err : any, metadata : any ) => void ) : this;
    // You can create clones of an FfmpegCommand instance by calling the clone() method. The clone will be an exact copy of the original at the time it has been called (same inputs, same options, same event handlers, etc.). This is mainly useful when you want to apply different processing options on the same input.
    clone() : this;

}
