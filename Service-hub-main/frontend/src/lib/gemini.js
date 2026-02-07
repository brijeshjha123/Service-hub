import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
    console.log("Gemini API Key found:", API_KEY.substring(0, 6) + "...");
    genAI = new GoogleGenerativeAI(API_KEY);
} else {
    console.error("Gemini API Key is missing! Did you restart Vite after updating .env?");
}

export const getSmartSearchResults = async (query, services) => {
    if (!genAI) {
        console.warn("Gemini API Key not found. Falling back to basic search.");
        return services.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.description.toLowerCase().includes(query.toLowerCase())
        );
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create a lightweight representation of services for the AI
        const serviceList = services.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            category: s.category
        }));

        const prompt = `
        You are a smart search assistant for a Home Services platform.
        User Query: "${query}"
        
        Available Services (JSON):
        ${JSON.stringify(serviceList)}
        
        Task: Return a JSON array of service IDs that are most relevant to the User Query.
        If the query is vague (e.g., "fix my house"), return broad relevant services.
        If specific (e.g., "leaking tap"), return specific services (e.g., Plumber).
        Sort by relevance.
        
        Output format: ["id1", "id2", ...]
        Do NOT output markdown code blocks. Just the JSON array.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // rigorous cleanup because AI sometimes adds markdown
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const relevantIds = JSON.parse(cleanedText);

        if (!Array.isArray(relevantIds)) return [];

        // Return full service objects based on IDs
        return services.filter(s => relevantIds.includes(s.id));

    } catch (error) {
        console.error("Gemini AI Search Error:", error);
        // Fallback to basic search
        return services.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.description.toLowerCase().includes(query.toLowerCase())
        );
    }
};
export const chatWithGemini = async (messages) => {
    if (!genAI) {
        throw new Error("Gemini API Key not found.");
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat({
            history: messages.slice(0, -1).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }],
            })),
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const lastMessage = messages[messages.length - 1].text;
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        throw error;
    }
};
