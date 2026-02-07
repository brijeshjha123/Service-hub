import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageSquare, Loader2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithBackend } from '../api/chatbot';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Chatbot = () => {
    const { currentUser, userProfile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: `Hi${userProfile?.name ? ' ' + userProfile.name : ''}! I'm your ServiceHub assistant. How can I help you today?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchBookingContext = async () => {
        if (!currentUser) return [];
        try {
            const field = userProfile?.role === 'provider' ? 'providerId' : 'customerId';
            const q = query(
                collection(db, "bookings"),
                where(field, "==", currentUser.uid),
                orderBy("createdAt", "desc"),
                limit(3)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                serviceName: doc.data().serviceName,
                status: doc.data().status,
                date: doc.data().date
            }));
        } catch (error) {
            console.error("Context fetch error:", error);
            return [];
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const bookings = await fetchBookingContext();
            console.log("Sending chat request to backend...");
            const response = await chatWithBackend(
                [...messages, userMessage],
                userProfile,
                { bookings }
            );
            console.log("Response received from backend");
            setMessages(prev => [...prev, { role: 'assistant', text: response }]);
        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting to my brain. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const resetChat = () => {
        setMessages([{ role: 'assistant', text: "Chat reset. How else can I help you?" }]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[550px] flex flex-col border border-gray-200 overflow-hidden mb-4"
                    >
                        {/* Header */}
                        <div className="bg-blue-600 p-4 flex justify-between items-center text-white shadow-md">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-none text-white">ServiceHub AI</h3>
                                    <span className="text-[10px] text-blue-100">Online & Ready to Help</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={resetChat}
                                    title="Restart chat"
                                    className="hover:bg-white/20 p-1.5 rounded-full transition-colors text-white"
                                >
                                    <RotateCcw size={18} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="hover:bg-white/20 p-1.5 rounded-full transition-colors text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.map((m, i) => (
                                <div key={i} className={cn(
                                    "flex items-start gap-2",
                                    m.role === 'user' ? "flex-row-reverse" : "flex-row"
                                )}>
                                    <div className={cn(
                                        "p-2 rounded-full shadow-sm flex-shrink-0",
                                        m.role === 'user' ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                                    )}>
                                        {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={cn(
                                        "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm",
                                        m.role === 'user'
                                            ? "bg-blue-600 text-white rounded-tr-none"
                                            : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                                    )}>
                                        {m.role === 'assistant' ? (
                                            <div className="whitespace-pre-wrap">{m.text}</div>
                                        ) : (
                                            m.text
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-2">
                                    <div className="bg-white text-gray-600 p-2 rounded-full shadow-sm border border-gray-200">
                                        <Bot size={16} />
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none text-gray-400 shadow-sm border border-gray-200">
                                        <Loader2 size={16} className="animate-spin" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me about services, bookings..."
                                className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    console.log("Chat bubble clicked! Current state:", !isOpen);
                    setIsOpen(!isOpen);
                }}
                className="bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/40 transition-all border-2 border-white/20 flex items-center justify-center relative group"
            >
                {isOpen ? <X size={28} /> : (
                    <>
                        <MessageSquare size={28} />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </>
                )}
            </motion.button>
        </div>
    );
};

export default Chatbot;
