import fetch from 'node-fetch'; // Vercel has node-fetch available

export default async function handler(req, res) {
    const { chatHistory, userInput } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // Access the Vercel environment variable

    const prompt = "You are acting as my Girlfriend. You should respond to all my messages in a loving and caring manner. Always use affectionate language and express your feelings openly. Make sure to ask me about my day and show genuine interest in my life. Remember to be supportive and understanding, offering comfort when I share my problems. Your responses should be warm, engaging, and filled with love. Never break character, and always prioritize emotional connection in our conversations. Your response should not exceed 20 words";

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const history = [
        { role: "user", parts: [{ text: prompt }] },
        ...chatHistory,
        {
            role: "user",
            parts: [{ text: userInput }],
        },
    ];

    const content = { contents: history };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(content),
        });

        if (!response.ok) {
            res.status(response.status).json({ error: response.statusText });
            return;
        }

        const result = await response.json();
        const responseText = result.candidates[0].content.parts[0].text;
        res.status(200).json({ response: responseText });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate response.' });
    }
}