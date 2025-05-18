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
        const res = await makeAiRequest(`Generate me an eye catching youtube title.
        For context this video is a certain amount of time of a sound.
        here is the denormalized title I tried to use "${denormalizedTitle}".
        only respond with the video title and nothing else!
        `)

        return normalizeTitle(res);
    }catch(_) {
        isDebugging() && console.error("Failed to use AI generated title. falling back...")
        return denormalizedTitle
    }
}

export async function generateDescription(denormalizedTitle: string) {
    try {
        const res = await makeAiRequest(`Generate me a youtube video description with search keywords for sound effects
        For context this video is a certain amount of time of a sound.
        here is the video title: "${denormalizedTitle}".
        only respond with the video description and nothing else!
        `)

        return normalizeDescription(res);
    }catch(_) {
        isDebugging() && console.error("Failed to use AI generated title. falling back...")
        return denormalizedTitle
    }
}