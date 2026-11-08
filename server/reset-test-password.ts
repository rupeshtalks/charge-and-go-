import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

dotenv.config();

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
    throw new Error("Supabase configuration is missing.");
}

const supabase = createClient(url, secretKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

const rl = readline.createInterface({ input, output });

async function main() {
    try {
        const password = await rl.question("Enter new password: ");

        if (password.length < 8) {
            throw new Error("Password must contain at least 8 characters.");
        }

        const { data: users, error: listError } =
            await supabase.auth.admin.listUsers();

        if (listError) throw listError;

        const user = users.users.find(
            u => u.email?.toLowerCase() === "rupeshpalla2007@gmail.com"
        );

        if (!user) {
            throw new Error("Test account not found.");
        }

        const { error } = await supabase.auth.admin.updateUserById(
            user.id,
            { password }
        );

        if (error) throw error;

        console.log("SUCCESS: Test account password updated!");
    } catch (error) {
        console.error("ERROR:", error instanceof Error ? error.message : error);
    } finally {
        rl.close();
    }
}

main();