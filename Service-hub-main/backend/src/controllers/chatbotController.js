const Groq = require('groq-sdk');

exports.chat = async (req, res) => {
    if (!req.body || !req.body.messages) {
        console.log("DEBUG: Chat request failed - Missing messages in body");
        return res.status(400).json({ error: "Messages array is required in the request body." });
    }

    const { messages, userProfile, context } = req.body;

    if (!process.env.GROQ_API_KEY) {
        console.error("GROQ_API_KEY is missing in backend .env");
        return res.status(500).json({ error: "Chatbot API Key is missing." });
    }

    try {
        console.log("Initializing Groq with model: llama-3.3-70b-versatile");
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const userName = userProfile?.name || 'Guest';
        const userRole = userProfile?.role || 'unauthenticated';

        const systemInstruction = `
        You are "ServiceHub Assistant", a polite, helpful, and intelligent virtual assistant for ServiceHub, an on-demand home services booking platform.
        
        User context:
        - Name: ${userName}
        - Role: ${userRole}
        - Current Bookings: ${JSON.stringify(context?.bookings || [])}
        
        Guidelines:
        1. Greet the user by name if known.
        2. If the user is unauthenticated, encourage them to login/signup for a better experience.
        3. If the user is a CUSTOMER:
           - Help them find services (Plumbing, Cleaning, Electrical, etc.).
           - Explain how to book: "Click on a service, select a date and time, and proceed to pay."
           - Help with booking status: Reference their current bookings if they ask.
        4. If the user is a PROVIDER:
           - Help them manage their bookings (Accept/Decline).
           - Explain how to update status: "Go to your dashboard and change the status of your assigned jobs."
        5. Navigation Help:
           - Home: /
           - Services: /services
           - My Bookings: /bookings
           - Dashboard (Customer): /dashboard
           - Provider Dashboard: /pro
        6. Style: Professional, friendly, and concise. Use bullet points for steps.
        7. If asked something unrelated to ServiceHub, politely redirect them back to the platform's services.
        `;

        // Map messages to Groq format
        const chatMessages = [
            { role: "system", content: systemInstruction },
            ...messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.text || ""
            }))
        ];

        let responseText;
        try {
            const completion = await groq.chat.completions.create({
                messages: chatMessages,
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                max_tokens: 500,
            });

            responseText = completion.choices[0]?.message?.content || "";
            console.log("Groq Response Success");
        } catch (apiError) {
            console.error("Groq API call failed, using fallback:", apiError.message);
            responseText = `I'm currently having a bit of trouble connecting to my full intelligence, but I can still help! 
            
            You can find services in the **Services** section, or check your profile in the **Dashboard**. 
            
            (Note: The AI API returned an error: ${apiError.message}. Please verify the GROQ_API_KEY in the backend .env)`;
        }

        res.status(200).json({ response: responseText });
    } catch (error) {
        console.error("Chatbot Controller Error:", error);
        res.status(500).json({ error: "Internal server error in chatbot." });
    }
};
