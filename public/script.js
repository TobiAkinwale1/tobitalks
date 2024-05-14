document.addEventListener("DOMContentLoaded", function() {
    const chatLog = document.getElementById("chat-log");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");

    async function getApiKey() {
        try {
            const response = await fetch('/api-key');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched API Key:", data.apiKey); // Add logging here
            return data.apiKey;
        } catch (error) {
            console.error("Error fetching API key:", error);
            return null;
        }
    }

    async function sendMessage(message, apiKey) {
        const endpoint = 'https://api.openai.com/v1/chat/completions';
        console.log("Sending message to OpenAI:", message); // Add logging here

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: message }],
                    max_tokens: 150
                })
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                console.error(`Error response from OpenAI: ${errorMessage}`);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error("Error sending message to OpenAI:", error);
            return "Sorry, I couldn't process your request.";
        }
    }

    function appendMessage(sender, message) {
        const messageElement = document.createElement("div");
        messageElement.textContent = `${sender}: ${message}`;
        chatLog.appendChild(messageElement);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    sendBtn.addEventListener("click", async function() {
        const message = userInput.value;
        if (message.trim()) {
            appendMessage("You", message);
            userInput.value = '';

            const apiKey = await getApiKey();
            if (apiKey) {
                const responseMessage = await sendMessage(message, apiKey);
                appendMessage("Tobi", responseMessage);
            } else {
                appendMessage("Tobi", "Error: Unable to fetch API key.");
            }
        }
    });

    userInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            sendBtn.click();
        }
    });
});
