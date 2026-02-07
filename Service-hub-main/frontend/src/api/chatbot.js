export const chatWithBackend = async (messages, userProfile, context) => {
    try {
        const response = await fetch('http://localhost:5000/api/chatbot/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                userProfile,
                context
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get AI response');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("API Chat Error:", error);
        throw error;
    }
};
