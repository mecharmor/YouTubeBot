import { isDebugging } from './env.js';

export async function sendDiscordMessage(message: string) {
    if (!process.env.DISCORD_WEBHOOK_URL) {
        isDebugging() && console.warn('Discord webhook URL not set. Skipping message:', message);
        return;
    }

    try {
        const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message,
                username: 'YouTube Bot',
                avatar_url: process.env.DISCORD_WEBHOOK_AVATAR_URL || 'https://i.imgur.com/AfFp7pu.png',
            }),
        });

        if (!response.ok) {
            throw new Error(`Discord API responded with status: ${response.status}`);
        }
    } catch (error) {
        console.error('Failed to send Discord message:', error);
    }
}

export async function sendDiscordUpdate(update: {
    status: 'started' | 'in_progress' | 'completed' | 'error';
    message: string;
    details?: Record<string, any>;
}) {
    const emoji = {
        started: '🚀',
        in_progress: '⏳',
        completed: '✅',
        error: '❌'
    }[update.status];
    
    let message = `${emoji} **${update.message}**\n`;
    message += `⏰ ${ new Date().toLocaleTimeString()}\n`;
    
    if (update.details) {
        message += '\n**Details:**\n';
        message += '```json\n';
        message += JSON.stringify(update.details, null, 2);
        message += '\n```';
    }

    await sendDiscordMessage(message);
}
