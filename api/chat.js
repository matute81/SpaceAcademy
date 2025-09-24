// Vercel Serverless Function for xAI API
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid request: messages array is required' });
        }

        // Get API key from environment variables
        const XAI_API_KEY = process.env.XAI_API_KEY;
        if (!XAI_API_KEY) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        console.log('Making request to xAI API...');

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${XAI_API_KEY}`
            },
            body: JSON.stringify({
                messages: messages,
                model: "grok-2-latest",
                stream: false,
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('xAI API error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: 'xAI API error',
                details: errorText
            });
        }

        const data = await response.json();
        console.log('xAI API response received successfully');

        return res.status(200).json(data);

    } catch (error) {
        console.error('Error in chat API:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}