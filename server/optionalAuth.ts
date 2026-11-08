import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RequestHandler } from "express";
import type { AuthUser } from "./auth.js";

// Optional authentication middleware:
// If Bearer token is provided, validates user and populates req.authUser and req.userSupabase.
// If no Bearer token or invalid token is provided, allows request to proceed as anonymous guest.
export const optionalAuth: RequestHandler = async (req, _res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization?.startsWith("Bearer ")) {
            return next();
        }

        const token = authorization.slice(7).trim();
        if (!token) {
            return next();
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return next();
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
            return next();
        }

        const { data: profile } = await userClient
            .from("profiles")
            .select("role, full_name")
            .eq("id", data.user.id)
            .maybeSingle();

        const role = (profile?.role as AuthUser["role"]) || "customer";

        req.authUser = {
            id: data.user.id,
            email: data.user.email,
            role
        };
        req.userSupabase = userClient;

        return next();
    } catch (err) {
        // Fail-open for optional auth
        return next();
    }
};

