const sendBtn = document.getElementById("send-button");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
let chatHistory = [];

// JS File
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

    if (res) {
        // Append Model message
        const modelMessageDiv = document.createElement("div");
        modelMessageDiv.className = `message model`;
        const modelBubbleDiv = document.createElement("div");
        modelBubbleDiv.className = "bubble";
        modelBubbleDiv.textContent = res;
        modelMessageDiv.appendChild(modelBubbleDiv);
        chatBox.appendChild(modelMessageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});

const generateResponse = async (userInput) => {
    try {
        const response = await fetch('/api/generate', { // Call the serverless function
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chatHistory, userInput }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert("Error: " + (errorData.error || response.statusText));
            return;
        }

        const result = await response.json();
        const responseText = result.response;

        // Update chat history for subsequent calls
        chatHistory = [
            ...chatHistory,
            { role: "user", parts: [{ text: userInput }] },
            { role: "model", parts: [{ text: responseText }] },
        ];

        return responseText;
    } catch (error) {
        alert("Error: Failed to connect to server.");
        return;
    }
};