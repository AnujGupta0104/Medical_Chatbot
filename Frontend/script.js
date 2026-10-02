const questionInput = document.getElementById("question");
const sendButton = document.getElementById("send-button");
const chatBox = document.getElementById("chat-box");
const welcomeMessage = document.getElementById("welcome-message");


// ===============================
// ADD MESSAGE
// ===============================
function cleanMedicalResponse(message) {
    return message
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/__/g, "")
        .replace(/_/g, "")
        .replace(/^#+\s*/gm, "")
        .replace(/^\s*[-•]\s*/gm, "")
        .trim();
}

function addMessage(message, type) {

    const messageDiv = document.createElement("div");

    messageDiv.className = "message " + type;


    const contentDiv = document.createElement("div");

    contentDiv.className = "message-content";

    contentDiv.textContent = cleanMedicalResponse(message).replace(/<br\s*\/?>/gi, "\n");


    messageDiv.appendChild(contentDiv);

    chatBox.appendChild(messageDiv);


    const chatContainer = document.getElementById("chat-container");

    chatContainer.scrollTop = chatContainer.scrollHeight;
}


// ===============================
// LOADING MESSAGE
// ===============================

function addLoadingMessage() {

    const messageDiv = document.createElement("div");

    messageDiv.className = "message assistant";

    messageDiv.id = "loading-message";


    const contentDiv = document.createElement("div");

    contentDiv.className = "message-content loading";


    contentDiv.innerHTML =
        'Searching the medical knowledge base' +
        '<span class="loading-dots">' +
        '<span></span>' +
        '<span></span>' +
        '<span></span>' +
        '</span>';


    messageDiv.appendChild(contentDiv);

    chatBox.appendChild(messageDiv);


    const chatContainer = document.getElementById("chat-container");

    chatContainer.scrollTop = chatContainer.scrollHeight;
}


// ===============================
// REMOVE LOADING MESSAGE
// ===============================

function removeLoadingMessage() {

    const loadingMessage =
        document.getElementById("loading-message");


    if (loadingMessage) {
        loadingMessage.remove();
    }
}


// ===============================
// SEND QUESTION
// ===============================

async function sendQuestion() {

    const question = questionInput.value.trim();


    if (!question) {
        return;
    }


    // Hide welcome screen after first question
    if (welcomeMessage) {
        welcomeMessage.style.display = "none";
    }


    // Show user's question
    addMessage(question, "user");


    // Clear input
    questionInput.value = "";


    // Reset textarea height
    questionInput.style.height = "48px";


    // Disable send button
    sendButton.disabled = true;


    // Show loading animation
    addLoadingMessage();


    try {

        const response = await fetch(
            "http://127.0.0.1:5000/ask",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: question
                })
            }
        );


        if (!response.ok) {
            throw new Error(
                "Backend returned an error: " + response.status
            );
        }


        const data = await response.json();


        // Remove loading message
        removeLoadingMessage();


        // Display backend answer
        if (data.answer) {

            addMessage(
                data.answer,
                "assistant"
            );

        } else {

            addMessage(
                "I could not find an answer to that question.",
                "assistant"
            );
        }

    }


    catch (error) {

        console.error(
            "Connection error:",
            error
        );


        removeLoadingMessage();


        addMessage(
            "Sorry, I could not connect to the medical assistant. Please make sure the Flask backend is running.",
            "assistant"
        );
    }


    finally {

        sendButton.disabled = false;

        questionInput.focus();
    }
}


// ===============================
// SUGGESTION BUTTONS
// ===============================

function askSuggestion(question) {

    questionInput.value = question;

    sendQuestion();
}


// ===============================
// ENTER TO SEND
// ===============================

questionInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendQuestion();
        }

    }
);


// ===============================
// AUTO RESIZE TEXTAREA
// ===============================

questionInput.addEventListener(
    "input",
    function() {

        this.style.height = "auto";

        this.style.height =
            Math.min(
                this.scrollHeight,
                130
            ) + "px";
    }
);


// ===============================
// DARK MODE
// ===============================

function toggleTheme() {

    document.body.classList.toggle(
        "dark-mode"
    );


    const themeButton =
        document.getElementById("theme-button");


    if (
        document.body.classList.contains(
            "dark-mode"
        )
    ) {

        themeButton.textContent = "☀️";

        themeButton.title =
            "Switch to light mode";

    } else {

        themeButton.textContent = "🌙";

        themeButton.title =
            "Switch to dark mode";
    }


    localStorage.setItem(
        "darkMode",
        document.body.classList.contains(
            "dark-mode"
        )
    );
}


// ===============================
// LOAD DARK MODE
// ===============================

if (
    localStorage.getItem("darkMode") === "true"
) {

    document.body.classList.add(
        "dark-mode"
    );


    const themeButton =
        document.getElementById("theme-button");


    if (themeButton) {
        themeButton.textContent = "☀️";
    }
}


// ===============================
// ACCESSIBILITY PANEL
// ===============================

function toggleAccessibility() {

    const panel =
        document.getElementById(
            "accessibility-panel"
        );


    panel.classList.toggle("active");
}


// ===============================
// FONT SIZE
// ===============================

function changeFontSize(size) {

    document.body.classList.remove(
        "font-small",
        "font-large"
    );


    if (size === "small") {

        document.body.classList.add(
            "font-small"
        );

    }


    if (size === "large") {

        document.body.classList.add(
            "font-large"
        );
    }


    localStorage.setItem(
        "fontSize",
        size
    );
}


// ===============================
// LOAD FONT SIZE
// ===============================

const savedFontSize =
    localStorage.getItem("fontSize");


if (savedFontSize) {

    changeFontSize(
        savedFontSize
    );
}


// ===============================
// HIGH CONTRAST
// ===============================

function toggleHighContrast() {

    document.body.classList.toggle(
        "high-contrast"
    );


    localStorage.setItem(
        "highContrast",
        document.body.classList.contains(
            "high-contrast"
        )
    );
}


// ===============================
// LOAD HIGH CONTRAST
// ===============================

if (
    localStorage.getItem(
        "highContrast"
    ) === "true"
) {

    document.body.classList.add(
        "high-contrast"
    );
}


// ===============================
// CLEAR CHAT
// ===============================

function clearChat() {

    if (!chatBox) {
        return;
    }


    if (chatBox.children.length === 0) {
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to clear this conversation?"
        );


    if (!confirmed) {
        return;
    }


    chatBox.innerHTML = "";


    if (welcomeMessage) {
        welcomeMessage.style.display = "block";
    }


    questionInput.focus();
}


// ===============================
// EXPORT CHAT
// ===============================

function exportChat() {

    const messages =
        document.querySelectorAll(
            "#chat-box .message"
        );


    if (messages.length === 0) {

        alert(
            "There is no conversation to export yet."
        );

        return;
    }


    let conversation =
        "MediBot Medical Knowledge Assistant\n";

    conversation +=
        "====================================\n\n";


    messages.forEach(
        function(message) {

            const content =
                message.querySelector(
                    ".message-content"
                );


            if (!content) {
                return;
            }


            if (
                message.classList.contains(
                    "user"
                )
            ) {

                conversation +=
                    "You:\n" +
                    content.textContent +
                    "\n\n";

            } else {

                conversation +=
                    "MediBot:\n" +
                    content.textContent +
                    "\n\n";
            }
        }
    );


    conversation +=
        "====================================\n";

    conversation +=
        "Educational use only. Not a substitute for professional medical advice.\n";


    const blob =
        new Blob(
            [conversation],
            {
                type: "text/plain"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "MediBot-conversation.txt";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);
}


// ===============================
// VOICE INPUT
// ===============================

function startVoiceInput() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "Voice input is not supported by this browser. Please try Google Chrome."
        );

        return;
    }


    const recognition =
        new SpeechRecognition();


    recognition.lang = "en-IN";

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    const voiceButton =
        document.getElementById(
            "voice-button"
        );


    voiceButton.textContent = "🔴";

    voiceButton.disabled = true;


    recognition.start();


    recognition.onresult =
        function(event) {

            const transcript =
                event.results[0][0].transcript;


            questionInput.value =
                transcript;


            questionInput.dispatchEvent(
                new Event("input")
            );
        };


    recognition.onerror =
        function(event) {

            console.error(
                "Voice input error:",
                event.error
            );


            alert(
                "I could not understand the voice input. Please try again."
            );
        };


    recognition.onend =
        function() {

            voiceButton.textContent = "🎙️";

            voiceButton.disabled = false;

            questionInput.focus();
        };
}


// ===============================
// CLOSE ACCESSIBILITY PANEL
// ===============================

document.addEventListener(
    "click",
    function(event) {

        const panel =
            document.getElementById(
                "accessibility-panel"
            );


        const accessibilityButton =
            document.getElementById(
                "accessibility-button"
            );


        if (
            panel &&
            panel.classList.contains("active") &&
            !panel.contains(event.target) &&
            !accessibilityButton.contains(event.target)
        ) {

            panel.classList.remove(
                "active"
            );
        }
    }
);