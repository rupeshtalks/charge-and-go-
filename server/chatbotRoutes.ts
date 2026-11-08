import { Router, type Request, type Response } from "express";
import { requireAuth } from "./auth.js";
import { optionalAuth } from "./optionalAuth.js";
import { generateChatbotReply, TOP_FAQ_QUESTIONS, type ChatContext } from "./chatbotEngine.js";
import { supabase } from "./supabase.js";

export const chatbotRouter = Router();

// In-memory fallback message storage when Supabase table is not yet migrated
interface MemoryMessage {
    id: string;
    user_id: string;
    message: string;
    sender: "user" | "assistant";
    created_at: string;
}
const inMemoryChatHistory: Map<string, MemoryMessage[]> = new Map();

// Helper to save a message
async function persistMessage(userId: string, text: string, sender: "user" | "assistant") {
    try {
        const { error } = await supabase
            .from("chatbot_messages")
            .insert({
                user_id: userId,
                message: text,
                sender: sender
            });

        if (error) {
            // Fallback to in-memory store
            const userHistory = inMemoryChatHistory.get(userId) || [];
            userHistory.push({
                id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
                user_id: userId,
                message: text,
                sender: sender,
                created_at: new Date().toISOString()
            });
            // Keep last 100 messages
            if (userHistory.length > 100) userHistory.shift();
            inMemoryChatHistory.set(userId, userHistory);
        }
    } catch {
        const userHistory = inMemoryChatHistory.get(userId) || [];
        userHistory.push({
            id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
            user_id: userId,
            message: text,
            sender: sender,
            created_at: new Date().toISOString()
        });
        inMemoryChatHistory.set(userId, userHistory);
    }
}

// ==========================================
// 1. GET /api/chatbot/health - Check service status
// ==========================================
chatbotRouter.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        service: "Charge & Go AI Assistant",
        status: "operational",
        version: "1.0.0",
        features: {
            smartFAQ: true,
            bookingLookup: true,
            persistentHistory: true,
            alwaysActive: true
        },
        topFaqs: TOP_FAQ_QUESTIONS,
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// 2. GET /api/chatbot/faqs - Quick questions list
// ==========================================
chatbotRouter.get("/faqs", (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        questions: TOP_FAQ_QUESTIONS
    });
});

// ==========================================
// 3. POST /api/chatbot/message - Send customer message
// (Works for authenticated users with live booking data, and guests with instant answers)
// ==========================================
chatbotRouter.post("/message", optionalAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const { message } = req.body;

        if (typeof message !== "string" || !message.trim()) {
            res.status(400).json({
                success: false,
                message: "Message is required and must be text."
            });
            return;
        }

        // Security check: Message length limitation (max 1000 characters)
        if (message.length > 1000) {
            res.status(400).json({
                success: false,
                message: "Message exceeds maximum allowed length of 1000 characters."
            });
            return;
        }

        const chatContext: ChatContext = {
            userId: req.authUser?.id,
            userRole: req.authUser?.role,
            userEmail: req.authUser?.email
        };

        // If authenticated user, fetch their real profile, bookings, and vehicles securely from Supabase
        if (req.authUser && req.userSupabase) {
            try {
                const [profileRes, bookingsRes, vehiclesRes] = await Promise.all([
                    req.userSupabase
                        .from("profiles")
                        .select("full_name")
                        .eq("id", req.authUser.id)
                        .maybeSingle(),
                    req.userSupabase
                        .from("bookings")
                        .select("id, booking_number, status, pickup_address, drop_address, scheduled_pickup, starting_battery_percent, target_battery_percent, pickup_fee, charging_cost, total_amount, created_at")
                        .eq("customer_id", req.authUser.id)
                        .order("created_at", { ascending: false })
                        .limit(5),
                    req.userSupabase
                        .from("vehicles")
                        .select("id, make, model, year, registration_number, battery_capacity")
                        .eq("user_id", req.authUser.id)
                        .order("created_at", { ascending: false })
                ]);

                if (profileRes.data?.full_name) {
                    chatContext.userName = profileRes.data.full_name;
                }
                if (bookingsRes.data) {
                    chatContext.recentBookings = bookingsRes.data;
                }
                if (vehiclesRes.data) {
                    chatContext.vehicles = vehiclesRes.data;
                }
            } catch (fetchErr) {
                console.warn("Context fetch error (non-fatal):", fetchErr);
            }
        }

        // Generate intelligent rule-based response
        const botResult = generateChatbotReply(message, chatContext);

        // If user is authenticated, persist conversation history
        if (req.authUser?.id) {
            await Promise.all([
                persistMessage(req.authUser.id, message.trim(), "user"),
                persistMessage(req.authUser.id, botResult.reply, "assistant")
            ]);
        }

        res.status(200).json({
            success: true,
            reply: botResult.reply,
            intent: botResult.intent,
            matchedQuestion: botResult.matchedQuestion || null,
            sender: "assistant",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Chatbot message processing error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while processing your request. Please try again.",
            reply: "I am having temporary trouble connecting to the system. Please try asking again in a moment, or contact support at support@chargeandgo.in."
        });
    }
});

// ==========================================
// 4. GET /api/chatbot/history - Retrieve user conversation history
// Requires Authentication
// ==========================================
chatbotRouter.get("/history", requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.authUser!.id;

        // Try reading from Supabase
        const { data, error } = await req.userSupabase!
            .from("chatbot_messages")
            .select("id, message, sender, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: true });

        if (!error && data) {
            res.status(200).json({
                success: true,
                history: data
            });
            return;
        }

        // Fallback to in-memory store
        const memoryHistory = inMemoryChatHistory.get(userId) || [];
        res.status(200).json({
            success: true,
            history: memoryHistory
        });
    } catch (error) {
        console.error("Chatbot history error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to retrieve conversation history."
        });
    }
});

// ==========================================
// 5. DELETE /api/chatbot/history - Clear user conversation history
// Requires Authentication
// ==========================================
chatbotRouter.delete("/history", requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.authUser!.id;

        // Try deleting from Supabase
        await req.userSupabase!
            .from("chatbot_messages")
            .delete()
            .eq("user_id", userId);

        // Also clear in-memory store
        inMemoryChatHistory.delete(userId);

        res.status(200).json({
            success: true,
            message: "Conversation history cleared successfully."
        });
    } catch (error) {
        console.error("Chatbot clear history error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to clear conversation history."
        });
    }
});

