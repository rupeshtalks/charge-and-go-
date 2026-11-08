async function runTest() {
    try {
        const fetch = (await import("node:http"));
        
        async function post(url, data, token) {
            return new Promise((resolve, reject) => {
                const u = new URL(url);
                const postData = JSON.stringify(data);
                const headers = {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(postData)
                };
                if (token) headers["Authorization"] = `Bearer ${token}`;

                const req = fetch.request({
                    hostname: u.hostname,
                    port: u.port,
                    path: u.pathname,
                    method: "POST",
                    headers
                }, (res) => {
                    let body = "";
                    res.on("data", chunk => body += chunk);
                    res.on("end", () => {
                        try {
                            resolve({ status: res.statusCode, data: JSON.parse(body) });
                        } catch {
                            resolve({ status: res.statusCode, raw: body });
                        }
                    });
                });
                req.on("error", reject);
                req.write(postData);
                req.end();
            });
        }

        async function get(url, token) {
            return new Promise((resolve, reject) => {
                const u = new URL(url);
                const headers = {};
                if (token) headers["Authorization"] = `Bearer ${token}`;

                const req = fetch.request({
                    hostname: u.hostname,
                    port: u.port,
                    path: u.pathname,
                    method: "GET",
                    headers
                }, (res) => {
                    let body = "";
                    res.on("data", chunk => body += chunk);
                    res.on("end", () => {
                        try {
                            resolve({ status: res.statusCode, data: JSON.parse(body) });
                        } catch {
                            resolve({ status: res.statusCode, raw: body });
                        }
                    });
                });
                req.on("error", reject);
                req.end();
            });
        }

        console.log("=== 1. CHATBOT HEALTH ===");
        const health = await get("http://localhost:5000/api/chatbot/health");
        console.log("Health Status:", health.status, health.data);

        console.log("\n=== 2. CHATBOT FAQS ===");
        const faqs = await get("http://localhost:5000/api/chatbot/faqs");
        console.log("FAQs Count:", faqs.data?.questions?.length);

        console.log("\n=== 3. FAQ QUESTIONS TEST ===");
        const testQuestions = [
            "How does Charge & Go work?",
            "What are the pickup and delivery charges?",
            "How much does EV charging cost?",
            "How can I track my vehicle?",
            "How long does charging take?",
            "How can I cancel my booking?",
            "How do I contact customer support?",
            "Which EV models are supported?",
            "How can I check my booking status?"
        ];

        for (const q of testQuestions) {
            const res = await post("http://localhost:5000/api/chatbot/message", { message: q });
            console.log(`Q: "${q}" -> Intent: [${res.data?.intent}], Reply length: ${res.data?.reply?.length}`);
        }

        console.log("\n=== 4. UNAUTHENTICATED HISTORY CHECK ===");
        const unauthHist = await get("http://localhost:5000/api/chatbot/history");
        console.log("History without token -> Status:", unauthHist.status, "(Expected 401)");

        console.log("\n=== ALL TESTS COMPLETED SUCCESSFULLY ===");
    } catch (e) {
        console.error("Test failed:", e);
    }
}

runTest();

