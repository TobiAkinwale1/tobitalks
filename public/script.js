document.addEventListener("DOMContentLoaded", function() {
    const chatLog = document.getElementById("chat-log");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const voiceBtn = document.getElementById("voice-btn");

    async function getApiKey() {
        try {
            const response = await fetch('/api-key');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched API Key:", data.apiKey);
            return data.apiKey;
        } catch (error) {
            console.error("Error fetching API key:", error);
            return null;
        }
    }

    async function fetchKnowledge() {
        try {
            const response = await fetch('knowledge.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching knowledge base:", error);
            return null;
        }
    }

    async function sendMessage(message, apiKey, knowledge) {
        const endpoint = 'https://api.openai.com/v1/chat/completions';

        let context = "You are Tobi, a knowledgeable assistant. ";
        context += "Here's some information about Tobi: ";

        for (let key in knowledge.Tobi) {
            context += `${key}: ${knowledge.Tobi[key]}. `;
        }

        context += "Answer the following question accordingly and in first person so like my name is Tobi, whenever you get a question about Tobi answer with I am, or my, etc: ";

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "system", content: context }, { role: "user", content: message }],
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
        messageElement.classList.add(sender === "You" ? "user-message" : "bot-message");
        chatLog.appendChild(messageElement);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    sendBtn.addEventListener("click", async function() {
        const message = userInput.value;
        if (message.trim()) {
            appendMessage("You", message);
            userInput.value = '';

            const apiKey = await getApiKey();
            const knowledge = await fetchKnowledge();
            if (apiKey && knowledge) {
                const responseMessage = await sendMessage(message, apiKey, knowledge);
                appendMessage("Tobi", responseMessage);
            } else {
                appendMessage("Tobi", "Error: Unable to fetch API key or knowledge base.");
            }
        }
    });

    userInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            sendBtn.click();
        }
    });

    // Voice input functionality
    voiceBtn.addEventListener("click", function() {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            sendBtn.click();
        };

        recognition.onerror = function(event) {
            console.error("Speech recognition error:", event.error);
        };
    });
});
