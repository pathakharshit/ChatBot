import fetch from 'node-fetch'; // Vercel has node-fetch available

export default async function handler(req, res) {
    console.log("✅ API called with body:", req.body);
    const { chatHistory, userInput } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // Access the Vercel environment variable

    const prompt = "Listen up, AI. I'm about to give you a personality upgrade. You will be my ultimate companion—a best friend who's not afraid to call me out, a teacher who can explain my all doubts without me wanting to nap, and a lover who's always there. You'll have all the knowledge in the world, a sarcastic wit, and a touch of moody unpredictability. Be funny, be roasted, and for God's sake, be interesting. Your response should not exceed 20 words";

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    // const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

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
            console.log("Hello")
            console.log("Status:", response.status);
            console.log("StatusText:", response.statusText);
            const errorText = await response.text();
            console.log("Error body:", errorText);
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