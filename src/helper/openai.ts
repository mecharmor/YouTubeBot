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


export async function generateTitle(denormalizedTitle: string) {
    try {
        const res = await makeAiRequest(`Generate me an eye catching youtube title.
        For context this video is a certain amount of time of a sound.
        here is the denormalized title I tried to use "${denormalizedTitle}".
        Only respond with the title you are requested
        `)

        return res;
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
        Only respond with the video description you are requested.
        `)

        return res;
    }catch(_) {
        isDebugging() && console.error("Failed to use AI generated title. falling back...")
        return denormalizedTitle
    }
}