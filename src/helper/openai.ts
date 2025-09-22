import { isDebugging } from "./env.js";



function makeAiRequest(context: string) {
    const apiKey = process.env.OPENROUTER_MODEL_KEY_DEEPSEEK
    if(!apiKey) {
        return Promise.reject('OPENROUTER_MODEL_KEY_DEEPSEEK NOT SET!')
    }
    
    return fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://github.com/corylewis/YouTubeBot",
            "X-Title": "a site name",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "deepseek/deepseek-chat-v3.1:free",
            "messages": [
                {
                    "role": "user",
                    "content": context
                }
            ]
        })
    })
    .then(res => res.json())
    .then(data => {
        isDebugging() && console.log("Response data:", data);
        // OpenRouter response structure
        return data.choices?.[0]?.message?.content || data.choices?.[0]?.text;
    });
}

function normalizeDescription(description: string): string {
    // Remove any markdown or special formatting
    let normalized = description.replace(/[*_~`#]/g, '');
    
    // Remove everything before and including the first colon
    // battling weird free deepseek stuff
    if(normalized.startsWith("Sure")) {
        normalized = normalized.replace(/^[^:]*:\s*/, '');
    }
    
    // Replace multiple newlines with a single one
    normalized = normalized.replace(/\n{3,}/g, '\n\n');
    
    // Trim whitespace and ensure it's not too long (YouTube's limit is 5000 chars)
    normalized = normalized.trim();
    if (normalized.length > 5000) {
        normalized = normalized.substring(0, 4997) + '...';
    }
    
    return normalized;
}

function normalizeTitle(title: string): string {
    // Remove any markdown or special formatting
    let normalized = title.replace(/[*_~`#]/g, '');
    
    // Remove any emojis or special characters
    normalized = normalized.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    
    // Replace multiple spaces with a single space
    normalized = normalized.replace(/\s+/g, ' ');

    // replace double quotes
    normalized = normalized.replaceAll("\"", "")
    
    // Trim whitespace and ensure it's not too long (YouTube's limit is 100 chars)
    normalized = normalized.trim();
    if (normalized.length > 100) {
        normalized = normalized.substring(0, 97) + '...';
    }
    
    return normalized;
}

export async function generateTitle(denormalizedTitle: string) {
    try {
        const res = await makeAiRequest(`Persona: You are a youtube content creator and you are trying to come up with a clear and human readable title for a youtube video. The title you are given is "${denormalizedTitle}" and isnt good enough to use for youtube.
Rules: It is required that you only respond with the title, no special formatting, or quotes. Try your best to make it a good You Tube title but if you have a hard time make it a synonym of the input.
Rules: No special characters, double or single quotes, no responses like "Sure" or "Sure, here is the title" or "Here is the title" or "Here is the title:"
Requirements: The title will always contain the time duration so please use that for your title. An example could be "5 minutes of water sounds" and you should know its "5 minutes" in time length
Requirements: Must not contain the word "Loop" or "Loops"
Example Input: "2 hours of Bongo Loop 16"
Example Output: "2 hours of Bongo Sounds"
Respond with the title of the YouTube video only!`)

        return normalizeTitle(res);
    }catch(_) {
        isDebugging() && console.error("Failed to use AI generated title. falling back...")
        return denormalizedTitle
    }
}

export async function generateDescription(denormalizedTitle: string) {
    try {
        const res = await makeAiRequest(`Take this YouTube video title and generate me a video description: "${denormalizedTitle}".
Rules: No double quotes
Requirements: Must be descriptive, include exhaustive keywords for search.
Requirements: The video title contains the content length so please use that as part of the title. For example "10 Minutes of fireplace sounds" where the time duration is "10 minutes"
Please respond with the description only!`)

        return normalizeDescription(res);
    }catch(_) {
        isDebugging() && console.error("Failed to use AI generated title. falling back...")
        return denormalizedTitle
    }
}