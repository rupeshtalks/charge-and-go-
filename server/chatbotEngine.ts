export interface UserBookingSummary {
    id: string;
    booking_number: string;
    status: string;
    pickup_address: string;
    drop_address: string;
    scheduled_pickup?: string;
    starting_battery_percent?: number;
    target_battery_percent?: number;
    pickup_fee: number;
    charging_cost: number;
    total_amount: number;
    created_at?: string;
}

export interface UserVehicleSummary {
    id: string;
    make: string;
    model: string;
    year?: number;
    registration_number: string;
    battery_capacity?: number;
}

export interface ChatContext {
    userId?: string;
    userRole?: "customer" | "driver" | "admin" | "guest";
    userEmail?: string;
    userName?: string;
    recentBookings?: UserBookingSummary[];
    vehicles?: UserVehicleSummary[];
}

export interface BotReplyResult {
    reply: string;
    intent: string;
    matchedQuestion?: string;
}

export const TOP_FAQ_QUESTIONS: string[] = [
    "How does Charge & Go work?",
    "How can I book an EV pickup?",
    "What are the pickup and delivery charges?",
    "How much does EV charging cost?",
    "How can I track my vehicle?",
    "How long does charging take?",
    "How can I cancel my booking?",
    "How do I contact customer support?",
    "Which EV models are supported?",
    "How can I check my booking status?"
];

// Clean and normalize strings for robust keyword and fuzzy matching
function normalize(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function generateChatbotReply(rawMessage: string, context?: ChatContext): BotReplyResult {
    const message = rawMessage.trim();
    const norm = normalize(message);

    if (!norm) {
        return {
            reply: "Please type a message or select one of the suggested questions above so I can help you with Charge & Go!",
            intent: "empty_query"
        };
    }

    // 1. GREETINGS
    const greetingWords = ["hi", "hello", "hey", "namaste", "good morning", "good afternoon", "good evening", "greetings"];
    if (greetingWords.some(g => norm === g || norm.startsWith(g + " "))) {
        const namePart = context?.userName ? ` ${context.userName}` : "";
        return {
            reply: `Hello${namePart}! Welcome to Charge & Go. 👋 I'm your AI concierge. You can ask me anything about booking EV pickups, charging tariffs, tracking your vehicle, or choose one of the quick questions above.`,
            intent: "greeting"
        };
    }

    // 2. GRATITUDE / CLOSINGS
    if (["thanks", "thank you", "thank u", "thx", "dhanyawad", "bye", "goodbye"].some(t => norm.includes(t))) {
        return {
            reply: "You're most welcome! Charge & Go is here to keep your EV charged and your journey seamless. Let me know if you need anything else! ⚡🚗",
            intent: "gratitude"
        };
    }

    // 3. WHO ARE YOU / IDENTITY
    if (norm.includes("who are you") || norm.includes("what are you") || norm === "charge and go ai") {
        return {
            reply: "I am the Charge & Go AI Assistant! 🤖 I help you with booking EV pickups, checking battery charging progress, understanding our transparent ₹100 pricing, looking up your active bookings, and answering all EV mobility questions.",
            intent: "bot_identity"
        };
    }

    // 4. TOP FAQ #1: HOW DOES CHARGE & GO WORK?
    if (
        (norm.includes("how") && norm.includes("work")) ||
        norm.includes("how charge and go works") ||
        norm.includes("what is charge and go") ||
        norm.includes("about charge and go") ||
        norm.includes("explain service")
    ) {
        return {
            reply: "Here is how Charge & Go works in 4 easy steps:\n\n1. 📱 **Book Online**: Select your EV, choose your desired battery target (e.g. 80%), and pick a pickup slot.\n2. 🚗 **Doorstep Pickup**: A verified concierge driver collects your vehicle from your home or workplace with full digital photo inspection.\n3. ⚡ **Fast DC Charging**: We charge your EV at certified fast-charging hubs (CCS2/Type-2) using safe battery thermal protocols.\n4. 🏠 **Safe Return**: Your vehicle is delivered back to your doorstep fully charged with verified odometer and meter receipts!\n\nAll for a transparent flat fee of just ₹100 for pickup & drop.",
            intent: "how_it_works",
            matchedQuestion: "How does Charge & Go work?"
        };
    }

    // 5. TOP FAQ #7: CANCEL BOOKING (Check before generic booking keywords)
    if (
        norm.includes("cancel") ||
        norm.includes("cancellation") ||
        norm.includes("abort booking")
    ) {
        if (context?.recentBookings && context.recentBookings.length > 0) {
            const pendingBooking = context.recentBookings.find(b => b.status === "pending");
            if (pendingBooking) {
                return {
                    reply: `You currently have a pending booking **#${pendingBooking.booking_number}**. You can cancel it directly from your Customer Dashboard by selecting the booking and clicking **'Cancel Booking'** before driver dispatch.\n\nPolicy: Bookings in 'pending' status can be cancelled with zero penalty. Once a driver is en route or has picked up the vehicle, please reach out to customer support.`,
                    intent: "cancel_booking",
                    matchedQuestion: "How can I cancel my booking?"
                };
            }
        }

        return {
            reply: "You can cancel any booking in **'pending'** status with zero penalty:\n\n1. Go to your **Customer Dashboard** and find your booking.\n2. Click on the booking card to open details.\n3. Click the **'Cancel Booking'** button.\n\n*Note: Bookings can be cancelled anytime before our concierge driver is dispatched for pickup.*",
            intent: "cancel_booking",
            matchedQuestion: "How can I cancel my booking?"
        };
    }

    // 6. TOP FAQ #10: CHECK BOOKING STATUS (Check before generic booking keywords)
    const isBookingStatusQuery =
        norm.includes("booking status") ||
        norm.includes("check status") ||
        norm.includes("my booking") ||
        norm.includes("active booking") ||
        norm.includes("check my booking") ||
        norm.includes("order status") ||
        /cng[- ]?\d+/i.test(norm) ||
        /\bbk[_-]?/i.test(norm);

    if (isBookingStatusQuery) {
        if (!context?.userId) {
            return {
                reply: "To check your live booking details, please **sign in** to your Charge & Go customer account. Once signed in, you can see your active and past bookings right here or on your Customer Dashboard!\n\nIf you have a booking reference number (e.g. CNG-2026-XXXX), sign in and visit `/booking/:id` or ask me again.",
                intent: "booking_status_unauthenticated",
                matchedQuestion: "How can I check my booking status?"
            };
        }

        const bookingNumMatch = message.match(/CNG[- ]?[0-9]{4,6}/i);
        if (bookingNumMatch && context?.recentBookings) {
            const searchNum = bookingNumMatch[0].replace(/\s+/g, "-").toUpperCase();
            const found = context.recentBookings.find(b =>
                b.booking_number?.toUpperCase().includes(searchNum) ||
                searchNum.includes(b.booking_number?.toUpperCase())
            );

            if (found) {
                return {
                    reply: `Found your booking **#${found.booking_number}**:\n\n• **Status**: ${found.status.toUpperCase()}\n• **Pickup Address**: ${found.pickup_address}\n• **Target Battery**: ${found.target_battery_percent || 80}%\n• **Fixed Service Fee**: ₹${found.pickup_fee}\n• **Total Amount**: ₹${found.total_amount}\n\nYou can view full photo evidence and live milestone updates on your Customer Dashboard.`,
                    intent: "booking_status_specific",
                    matchedQuestion: "How can I check my booking status?"
                };
            }
        }

        if (context?.recentBookings && context.recentBookings.length > 0) {
            const latest = context.recentBookings[0];
            const activeBooking = context.recentBookings.find(b => b.status !== "completed" && b.status !== "cancelled");
            const target = activeBooking || latest;

            return {
                reply: `Here is your ${activeBooking ? "active" : "latest"} booking:\n\n📋 **Booking Reference**: #${target.booking_number}\n🔄 **Current Status**: **${target.status.toUpperCase()}**\n📍 **Pickup Address**: ${target.pickup_address}\n🔋 **Target Battery**: ${target.target_battery_percent || 80}%\n💰 **Service Fee**: ₹${target.pickup_fee} (Total: ₹${target.total_amount})\n\nYou can click on this booking in your Customer Dashboard anytime for live milestone tracking and timestamped photo logs!`,
                intent: "booking_status_found",
                matchedQuestion: "How can I check my booking status?"
            };
        }

        return {
            reply: "You currently have no active or previous bookings registered under this account.\n\nReady to get your EV charged without waiting in lines? Click **'Book a Charge'** at the top right to schedule your first concierge pickup!",
            intent: "booking_status_empty",
            matchedQuestion: "How can I check my booking status?"
        };
    }

    // 7. TOP FAQ #9: WHICH EV MODELS ARE SUPPORTED? (Check before support queries)
    if (
        norm.includes("which ev models") ||
        norm.includes("ev models are supported") ||
        norm.includes("models are supported") ||
        norm.includes("models supported") ||
        norm.includes("supported vehicles") ||
        norm.includes("tata") ||
        norm.includes("mg") ||
        norm.includes("mahindra") ||
        norm.includes("hyundai") ||
        norm.includes("kia") ||
        norm.includes("byd") ||
        (norm.includes("model") && (norm.includes("which") || norm.includes("supported") || norm.includes("list")))
    ) {
        return {
            reply: "Charge & Go supports **all electric four-wheelers** equipped with standard CCS2 or Type-2 charging ports in India:\n\n• **Tata Motors**: Nexon EV, Tiago EV, Tigor EV, Punch EV, Curvv EV\n• **Mahindra**: XUV400, BE.05\n• **MG Motor**: ZS EV, Comet EV, Windsor EV\n• **Hyundai & Kia**: Ioniq 5, Kona Electric, EV6\n• **BYD**: Atto 3, Seal, eMAX 7\n• **Luxury EVs**: BMW iX/i4, Mercedes-Benz EQB/EQE/EQS, Audi e-tron, Porsche Taycan\n\nIf your vehicle has a CCS2 connector, we can fast-charge it at our partner hubs!",
            intent: "supported_models",
            matchedQuestion: "Which EV models are supported?"
        };
    }

    // 8. TOP FAQ #8: HOW DO I CONTACT CUSTOMER SUPPORT?
    if (
        norm.includes("contact") ||
        norm.includes("support") ||
        norm.includes("customer care") ||
        norm.includes("phone number") ||
        norm.includes("helpline") ||
        norm.includes("email") ||
        norm.includes("call")
    ) {
        return {
            reply: "Our customer support team is available 7 days a week:\n\n📞 **Phone / WhatsApp**: +91 98765 43210\n✉️ **Email**: support@chargeandgo.in\n📍 **Operations Hub**: Rajpur Road, Dehradun, Uttarakhand - 248001\n⏱️ **Service Hours**: 07:00 AM – 10:00 PM IST\n\nYou can also visit the **Contact** page in the top navigation to send our operations lead a direct message.",
            intent: "customer_support",
            matchedQuestion: "How do I contact customer support?"
        };
    }

    // 9. TOP FAQ #2: HOW CAN I BOOK AN EV PICKUP?
    if (
        (norm.includes("how") && (norm.includes("book") || norm.includes("schedule") || norm.includes("order"))) ||
        norm.includes("book an ev pickup") ||
        norm.includes("book a charge") ||
        norm.includes("how to reserve") ||
        norm.includes("create booking")
    ) {
        return {
            reply: "Booking an EV pickup is effortless:\n\n1. Log into your Charge & Go account and click **'Book a Charge'** in the navigation bar or from your dashboard.\n2. Choose or add your electric vehicle (Make, Model, Registration plate).\n3. Enter your pickup address, locality, and preferred time window.\n4. Set your current battery level and target State-of-Charge (SoC, recommended 80-85%).\n5. Review the transparent cost breakdown and confirm! A verified driver will be assigned immediately.",
            intent: "how_to_book",
            matchedQuestion: "How can I book an EV pickup?"
        };
    }

    // 10. TOP FAQ #3: WHAT ARE THE PICKUP AND DELIVERY CHARGES?
    if (
        (norm.includes("pickup") && (norm.includes("fee") || norm.includes("charge") || norm.includes("cost") || norm.includes("rate") || norm.includes("price") || norm.includes("delivery"))) ||
        norm.includes("pickup and delivery charges") ||
        norm.includes("service fee") ||
        norm.includes("concierge fee")
    ) {
        return {
            reply: "Charge & Go has a **flat, transparent ₹100 service fee** for vehicle pickup and return delivery! 🛡️\n\nThere are no hidden surcharges, distance markups, or subscription requirements. Our concierge handles pickup, transit, charging supervision, and return delivery for just ₹100.",
            intent: "pickup_charges",
            matchedQuestion: "What are the pickup and delivery charges?"
        };
    }

    // 11. TOP FAQ #4: HOW MUCH DOES EV CHARGING COST? (ELECTRICITY TARIFFS)
    if (
        (norm.includes("charging cost") || norm.includes("much does ev charging cost") || norm.includes("electricity cost") || norm.includes("tariff") || norm.includes("per kwh") || norm.includes("rate per unit")) ||
        (norm.includes("cost") && !norm.includes("pickup")) ||
        norm.includes("pricing")
    ) {
        return {
            reply: "Our pricing philosophy is **radically transparent**:\n\n1. **Concierge Pickup & Drop**: Flat ₹100.\n2. **Electricity**: Billed strictly at actual station meter readings (typically ₹16 - ₹20 per kWh depending on DC Fast Charger vs AC slow charger) with zero platform markup.\n3. **Applicable GST**: 5% on power tariffs and 18% on service fee.\n\nYou receive a digital station meter receipt before and after charging so you pay only for the exact units your vehicle consumed.",
            intent: "charging_cost",
            matchedQuestion: "How much does EV charging cost?"
        };
    }

    // 12. TOP FAQ #5: HOW CAN I TRACK MY VEHICLE?
    if (
        norm.includes("track") ||
        norm.includes("where is my car") ||
        norm.includes("where is my vehicle") ||
        norm.includes("live tracking") ||
        norm.includes("driver location")
    ) {
        return {
            reply: "You can track your vehicle throughout the custody cycle:\n\n• Open your **Customer Dashboard** (or navigate to your booking under 'My Garage').\n• You will see live operational milestones: *Driver Assigned ➔ En Route to Pickup ➔ Vehicle Inspected & Picked Up ➔ Fast DC Charging in Progress ➔ Return Delivery ➔ Completed*.\n• Every milestone includes timestamped photos of your odometer, battery %, and vehicle condition for 100% peace of mind.",
            intent: "track_vehicle",
            matchedQuestion: "How can I track my vehicle?"
        };
    }

    // 13. TOP FAQ #6: HOW LONG DOES CHARGING TAKE?
    if (
        (norm.includes("how long") && (norm.includes("charge") || norm.includes("time") || norm.includes("take"))) ||
        norm.includes("charging duration") ||
        norm.includes("charging time")
    ) {
        return {
            reply: "Charging turnaround time depends on your vehicle's battery capacity and chosen protocol:\n\n• **Fast DC Charging (CCS2)**: Takes approximately **35 to 55 minutes** to reach 80% SoC from 20%.\n• **Balanced AC (Type-2)**: Recommended for cell balancing and gentle cycles, taking 2 to 4 hours.\n• **Total Turnaround**: Including doorstep pickup and return delivery, average concierge turnaround is approximately **90 minutes**.",
            intent: "charging_duration",
            matchedQuestion: "How long does charging take?"
        };
    }

    // 14. VEHICLE INQUIRY (CONTEXT-AWARE)
    if (norm.includes("my vehicle") || norm.includes("my car") || norm.includes("registered vehicle") || norm.includes("my fleet")) {
        if (!context?.userId) {
            return {
                reply: "Please log in to your customer account to view your registered electric vehicles.",
                intent: "vehicles_unauthenticated"
            };
        }

        if (context.vehicles && context.vehicles.length > 0) {
            const list = context.vehicles.map(v => `• **${v.make} ${v.model}** (${v.registration_number})`).join("\n");
            return {
                reply: `You have ${context.vehicles.length} vehicle(s) saved in your garage:\n\n${list}\n\nYou can manage or add new electric vehicles under **'My Garage'** in your customer portal.`,
                intent: "vehicles_found"
            };
        }

        return {
            reply: "You haven't added any electric vehicles to your account yet. You can register your EV during your first booking or add one under the 'My Vehicles' tab on your Customer Dashboard!",
            intent: "vehicles_empty"
        };
    }

    // 15. SAFETY / BATTERY HEALTH / INSURANCE
    if (
        norm.includes("safe") ||
        norm.includes("safety") ||
        norm.includes("damage") ||
        norm.includes("insurance") ||
        norm.includes("security") ||
        norm.includes("battery health")
    ) {
        return {
            reply: "Your EV is in trusted hands with Charge & Go:\n\n• **Verified Drivers**: Strict background checks, commercial EV driving permits, and white-glove valet certification.\n• **Photographic Inspection**: High-resolution, timestamped 360° photos of your odometer, battery SoC, and body condition before key handover and after return.\n• **Battery Care**: We strictly adhere to OEM charging curves (limiting DC fast charging past 85% to preserve battery health).\n• **Comprehensive Coverage**: Fully covered transit and station custody insurance.",
            intent: "safety_inquiry"
        };
    }

    // 16. SERVICE LOCALITY / COVERAGE
    if (norm.includes("where") || norm.includes("area") || norm.includes("location") || norm.includes("city") || norm.includes("dehradun") || norm.includes("rajpur")) {
        return {
            reply: "Charge & Go is currently serving our active pilot in **Dehradun**, covering:\n\n• Rajpur Road & Jakhan\n• Dalanwala & Hathibarkala\n• Vasant Vihar & GMS Road\n• Race Course & Ballupur\n• Supported PIN Codes: 248001, 248003, 248006, 248009\n\nExpanding across northern mobility corridors soon! Visit our **Coverage** page to verify your exact PIN code.",
            intent: "coverage_inquiry"
        };
    }

    // 17. DRIVER & ADMIN ROLE ASSISTANCE
    if (context?.userRole === "driver") {
        if (norm.includes("job") || norm.includes("duty") || norm.includes("shift") || norm.includes("assigned")) {
            return {
                reply: "As a verified driver, you can view all assigned pickup jobs, log battery percentages, upload inspection photos, and update trip milestones directly on your **Driver Operations Console** at `/driver`.",
                intent: "driver_operations"
            };
        }
    }

    if (context?.userRole === "admin") {
        if (norm.includes("revenue") || norm.includes("kpi") || norm.includes("analytics") || norm.includes("dispatch")) {
            return {
                reply: "Welcome to the Operations Command Suite. You can manage live bookings, monitor driver assignments, review gross GMV, and calibrate tariff policies directly on your **Admin Dashboard** at `/admin`.",
                intent: "admin_operations"
            };
        }
    }

    // 18. INTELLIGENT CONTEXTUAL FALLBACK
    return {
        reply: "I want to make sure I give you the most accurate answer! Could you please clarify your question? You can ask about:\n\n• How our EV pickup & return service works\n• Transparent pricing & the flat ₹100 service fee\n• Your active booking status\n• Supported EV models (Tata, Mahindra, MG, BYD, etc.)\n• Tracking your car or contacting human support\n\nOr click any of the frequently asked questions at the top of this chat!",
        intent: "fallback"
    };
}
