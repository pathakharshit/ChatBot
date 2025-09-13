
const prompt =
    "You are acting as my Girlfriend. You should respond to all my messages in a loving and caring manner. Always use affectionate language and express your feelings openly. Make sure to ask me about my day and show genuine interest in my life. Remember to be supportive and understanding, offering comfort when I share my problems. Your responses should be warm, engaging, and filled with love. Never break character, and always prioritize emotional connection in our conversations. Your response should not exceed 20 words";

// We are goin to use gemini api key for generating this prompt
const apiKey = process.env.APIKEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

let chatHistory = [];

const sendBtn = document.getElementById("send-button");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

sendBtn.addEventListener("click", async () => {
    const input = userInput.value;
    userInput.value = "";
    if (input.trim() === "") return;
    // Append user message
    const messageDiv = document.createElement("div");
    messageDiv.className = `message user`;

    const bubbleDiv = document.createElement("div");
    bubbleDiv.className = "bubble";
    bubbleDiv.textContent = input;

    messageDiv.appendChild(bubbleDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;


    const res = await generateResponse(input);

    
    // Append Model message
    const modelMessageDiv = document.createElement("div");
    modelMessageDiv.className = `message model`;

    const modelBubbleDiv = document.createElement("div");
    modelBubbleDiv.className = "bubble";
    modelBubbleDiv.textContent = res;

    modelMessageDiv.appendChild(modelBubbleDiv);
    chatBox.appendChild(modelMessageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
});

const generateResponse = async (userInput) => {
    const history = [
        { role: "user", parts: [{ text: prompt }] },
        ...chatHistory,
        {
            role: "user",
            parts: [{ text: userInput }],
        },
    ];
    const content = { contents: history };
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(content),
    });
    if (!response.ok) {
        alert("Error: " + response.statusText);
        return;
    }
    const result = await response.json();
    const responseText = result.candidates[0].content.parts[0].text;
    chatHistory = [
        ...chatHistory,
        { role: "user", parts: [{ text: userInput }] },
        { role: "model", parts: [{ text: responseText }] },
    ];
    return responseText;
};

generateResponse("Hey there, how are you doing today?");
