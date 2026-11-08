
import React, { useEffect, useRef, useState } from 'react';
import {
    Bot,
    X,
    Send,
    Sparkles,
    User,
    RotateCcw,
    Zap,
    MessageCircle,
} from 'lucide-react';
import './Chatbot.css';

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    role: 'customer' | 'driver' | 'admin';
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    time: string;
}

const suggestions = [
    'How do I book a charging service?',
    'What are your service charges?',
    'Which EV models are supported?',
    'How does Charge & Go work?',
];

const getReply = (question: string, role: string): string => {
    const q = question.toLowerCase();

    if (q.includes('price') || q.includes('charge') || q.includes('cost')) {
        return 'Charge & Go has a ₹100 pickup-and-drop service fee. Electricity and charging costs are calculated separately. Your booking should show the applicable estimated charges before confirmation.';
    }

    if (q.includes('book') || q.includes('booking')) {
        return 'You can book a service by selecting "Book a Charge" in the navigation. Choose your EV model, enter pickup and return details, select a time slot and review your estimated charges before confirming.';
    }

    if (q.includes('model') || q.includes('vehicle') || q.includes('ev')) {
        return 'Charge & Go is designed to support electric vehicles. You can check the available vehicle makes and models in the booking form.';
    }

    if (q.includes('work') || q.includes('how')) {
        return 'Charge & Go makes EV charging convenient: book a pickup, let our driver collect your vehicle, have it charged, and get it returned to your selected location.';
    }

    if (q.includes('driver') && role === 'driver') {
        return 'You can manage your assigned jobs from the Driver Dashboard. Check your assigned bookings and update the pickup, charging and return milestones.';
    }

    if (q.includes('admin') && role === 'admin') {
        return 'You can manage bookings, driver assignments and operational records through the Admin Dashboard.';
    }

    if (q.includes('track') || q.includes('status')) {
        return 'You can check your booking status from your dashboard or open the relevant booking to see its recorded progress. I cannot retrieve live booking records until the secure backend connection is configured.';
    }

    return 'Thanks for your question! I can currently help with Charge & Go bookings, service pricing, EV models and the service process. A live AI connection and account-specific assistance will be added in the next integration stage.';
};

export const Chatbot: React.FC<ChatbotProps> = ({
    isOpen,
    onClose,
    role,
}) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: `Hey! Welcome to Charge & Go. 👋 I'm your assistant. How can I help you today?`,
            sender: 'bot',
            time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        },
    ]);

    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
        });
    }, [messages, typing]);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleEscape);

        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const createMessage = (
        text: string,
        sender: 'user' | 'bot',
    ): Message => ({
        id: Date.now() + Math.random(),
        text,
        sender,
        time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        }),
    });

    const sendMessage = (text = input) => {
        const question = text.trim();

        if (!question || typing) return;

        setMessages((previous) => [
            ...previous,
            createMessage(question, 'user'),
        ]);

        setInput('');
        setTyping(true);

        // Temporary local response logic.
        // Replace this with your secure AI backend API later.
        window.setTimeout(() => {
            const reply = getReply(question, role);

            setMessages((previous) => [
                ...previous,
                createMessage(reply, 'bot'),
            ]);

            setTyping(false);
        }, 900);
    };

    const resetChat = () => {
        setMessages([
            createMessage(
                'Hey! Welcome to Charge & Go. 👋 How can I help you today?',
                'bot',
            ),
        ]);
        setInput('');
    };

    return (
        <>
            <div
                className={`cng-ai-backdrop ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden={!isOpen}
            />

            <aside
                className={`cng-ai-panel ${isOpen ? 'open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Charge and Go AI Assistant"
                aria-hidden={!isOpen}
            >
                <div className="cng-ai-header">
                    <div className="cng-ai-heading">
                        <div className="cng-ai-avatar">
                            <Bot size={23} />
                            <span />
                        </div>

                        <div>
                            <h2>Charge & Go AI</h2>
                            <p>
                                <span className="cng-ai-online-dot" />
                                Assistant preview
                            </p>
                        </div>
                    </div>

                    <div className="cng-ai-header-actions">
                        <button
                            type="button"
                            onClick={resetChat}
                            title="New conversation"
                            aria-label="Start a new conversation"
                        >
                            <RotateCcw size={17} />
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            title="Close assistant"
                            aria-label="Close assistant"
                        >
                            <X size={21} />
                        </button>
                    </div>
                </div>

                <div className="cng-ai-welcome">
                    <div className="cng-ai-welcome-icon">
                        <Sparkles size={21} />
                    </div>

                    <h3>Your EV journey, made smarter.</h3>
                    <p>
                        Ask me anything about Charge & Go. I'm here to make
                        your charging experience easier.
                    </p>
                </div>

                <div className="cng-ai-messages">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`cng-ai-message-row ${message.sender}`}
                        >
                            {message.sender === 'bot' && (
                                <div className="cng-ai-small-avatar">
                                    <Zap size={14} />
                                </div>
                            )}

                            <div className="cng-ai-message-content">
                                <div className="cng-ai-message-bubble">
                                    {message.text}
                                </div>

                                <span className="cng-ai-message-time">
                                    {message.time}
                                </span>
                            </div>

                            {message.sender === 'user' && (
                                <div className="cng-ai-user-avatar">
                                    <User size={14} />
                                </div>
                            )}
                        </div>
                    ))}

                    {typing && (
                        <div className="cng-ai-message-row bot">
                            <div className="cng-ai-small-avatar">
                                <Zap size={14} />
                            </div>

                            <div className="cng-ai-typing">
                                <span />
                                <span />
                                <span />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {messages.length <= 1 && (
                    <div className="cng-ai-suggestions">
                        <span>TRY ASKING</span>

                        {suggestions.map((suggestion) => (
                            <button
                                type="button"
                                key={suggestion}
                                onClick={() => sendMessage(suggestion)}
                            >
                                {suggestion}
                                <Sparkles size={13} />
                            </button>
                        ))}
                    </div>
                )}

                <form
                    className="cng-ai-input-area"
                    onSubmit={(event) => {
                        event.preventDefault();
                        sendMessage();
                    }}
                >
                    <div className="cng-ai-input-box">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder="Ask anything about Charge & Go..."
                            aria-label="Type your message"
                        />

                        <button
                            type="submit"
                            disabled={!input.trim() || typing}
                            aria-label="Send message"
                        >
                            <Send size={17} />
                        </button>
                    </div>

                    <p>
                        <MessageCircle size={12} />
                        Preview responses · Live AI connection coming next
                    </p>
                </form>
            </aside>
        </>
    );
};
