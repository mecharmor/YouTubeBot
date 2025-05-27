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
            "model": "deepseek/deepseek-chat-v3-0324:free",
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
        const res = await makeAiRequest(`Take this and turn it into a youtube video title: "${denormalizedTitle}".
It is required that you only respond with the title, no special formatting, or quotes.
Example Input: "1 hour of underwater sounds"
Example Output: "1 Hour of Underwater Sounds"
Respond with the title only!`)

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
Please respond with the description only!`)

        return normalizeDescription(res);
    }catch(_) {
        isDebugging() && console.error("Failed to use AI generated title. falling back...")
        return denormalizedTitle
    }
}