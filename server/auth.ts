
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RequestHandler } from "express";

export interface AuthUser {
    id: string;
    email?: string;
    role: "customer" | "driver" | "admin";
}

// Extend Express Request with authenticated user information
declare global {
    namespace Express {
        interface Request {
            authUser?: AuthUser;
            userSupabase?: SupabaseClient;
        }
    }
}

// VERIFY AUTHENTICATION TOKEN
export const requireAuth: RequestHandler = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization?.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Authentication token is required."
            });
            return;
        }

        const token = authorization.slice(7).trim();

        if (!token) {
            res.status(401).json({
                success: false,
                message: "Invalid authentication token."
            });
            return;
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Supabase environment configuration is missing.");
        }

        const userClient = createClient(supabaseUrl, supabaseKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            },
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        });

        const { data, error } = await userClient.auth.getUser(token);

        if (error || !data.user) {
            res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token."
            });
            return;
        }

        const { data: profile, error: profileError } = await userClient
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

        if (profileError || !profile) {
            res.status(403).json({
                success: false,
                message: "User profile could not be verified."
            });
            return;
        }

        if (!["customer", "driver", "admin"].includes(profile.role)) {
            res.status(403).json({
                success: false,
                message: "Invalid user role."
            });
            return;
        }

        req.authUser = {
            id: data.user.id,
            email: data.user.email,
            role: profile.role
        };

        req.userSupabase = userClient;

        next();

    } catch (error) {
        console.error("Authentication middleware error:", error);

        res.status(500).json({
            success: false,
            message: "Authentication verification failed."
        });
    }
};

// VERIFY USER ROLE
export const requireRole = (
    ...allowedRoles: AuthUser["role"][]
): RequestHandler => {
    return (req, res, next) => {
        if (!req.authUser) {
            res.status(401).json({
                success: false,
                message: "Please log in first."
            });
            return;
        }

        if (!allowedRoles.includes(req.authUser.role)) {
            res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource."
            });
            return;
        }

        next();
    };
};
