import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./supabase.js";
import { requireAuth, requireRole } from "./auth.js";
import { chatbotRouter } from "./chatbotRoutes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// ==========================================
// 1. HEALTH CHECK
// ==========================================

app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Welcome to Charge & Go Backend!"
    });
});

app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Charge & Go backend is running!",
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// 2. SUPABASE CLIENT STATUS
// ==========================================

app.get("/api/supabase-status", (_req, res) => {
    res.json({
        success: true,
        message: "Supabase client configured successfully!"
    });
});

// ==========================================
// 3. DATABASE CONNECTION TEST
// ==========================================

app.get("/api/database-test", async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from("profiles")
            .select("id")
            .limit(1);

        if (error) {
            console.error("Database test error:", error);

            res.status(500).json({
                success: false,
                message: error.message
            });
            return;
        }

        res.json({
            success: true,
            message: "Supabase database connection successful!",
            recordsFound: data.length
        });

    } catch (error) {
        console.error("Full database error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed."
        });
    }
});

// ==========================================
// 4. CUSTOMER REGISTRATION
// ==========================================

app.post("/api/auth/register", async (req, res) => {
    try {
        const { full_name, email, phone, password } = req.body;

        if (!full_name || !email || !phone || !password) {
            res.status(400).json({
                success: false,
                message: "All fields are required."
            });
            return;
        }

        if (
            typeof password !== "string" ||
            password.length < 8
        ) {
            res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: String(email).trim().toLowerCase(),
            password,
            options: {
                data: {
                    full_name: String(full_name).trim(),
                    phone: String(phone).trim()
                }
            }
        });

        if (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }

        res.status(201).json({
            success: true,
            message: data.session
                ? "Registration successful!"
                : "Please verify your email to complete registration.",
            user: data.user,
            session: data.session
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed."
        });
    }
});

// ==========================================
// 5. CUSTOMER LOGIN
// ==========================================

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: String(email).trim().toLowerCase(),
            password
        });

        if (error) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
            return;
        }

        res.json({
            success: true,
            message: "Login successful!",
            user: data.user,
            session: data.session
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
});

// ==========================================
// 6. FORGOT PASSWORD
// ==========================================

app.post("/api/auth/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({
                success: false,
                message: "Email is required."
            });
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(
            String(email).trim().toLowerCase(),
            {
                redirectTo: "http://localhost:5173"
            }
        );

        if (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }

        res.json({
            success: true,
            message: "If an account exists, a password reset email will be sent."
        });

    } catch (error) {
        console.error("Password reset error:", error);

        res.status(500).json({
            success: false,
            message: "Password reset request failed."
        });
    }
});

// ==========================================
// 7. GET CURRENT AUTHENTICATED USER
// ==========================================

app.get("/api/auth/me", requireAuth, (req, res) => {
    res.json({
        success: true,
        message: "User authenticated successfully!",
        user: req.authUser
    });
});

// ==========================================
// 8. CUSTOMER-ONLY TEST ROUTE
// ==========================================

app.get(
    "/api/customer/test",
    requireAuth,
    requireRole("customer"),
    (_req, res) => {
        res.json({
            success: true,
            message: "Customer access verified!"
        });
    }
);

// ==========================================
// 9. DRIVER-ONLY TEST ROUTE
// ==========================================

app.get(
    "/api/driver/test",
    requireAuth,
    requireRole("driver"),
    (_req, res) => {
        res.json({
            success: true,
            message: "Driver access verified!"
        });
    }
);

// ==========================================
// 10. ADMIN-ONLY TEST ROUTE
// ==========================================

app.get(
    "/api/admin/test",
    requireAuth,
    requireRole("admin"),
    (_req, res) => {
        res.json({
            success: true,
            message: "Admin access verified!"
        });
    }
);

// ==========================================
// 11. GET CUSTOMER PROFILE
// ==========================================

app.get(
    "/api/customer/profile",
    requireAuth,
    requireRole("customer"),
    async (req, res) => {
        try {
            const { data: profile, error } = await req.userSupabase!
                .from("profiles")
                .select("*")
                .eq("id", req.authUser!.id)
                .single();

            if (error) {
                console.error("Profile fetch error:", error.message);

                res.status(500).json({
                    success: false,
                    message: "Unable to fetch customer profile."
                });
                return;
            }

            res.json({
                success: true,
                message: "Customer profile fetched successfully!",
                profile
            });

        } catch (error) {
            console.error("Customer profile error:", error);

            res.status(500).json({
                success: false,
                message: "Something went wrong."
            });
        }
    }
);

// ==========================================
// 12. GET CUSTOMER VEHICLES
// ==========================================

app.get(
    "/api/customer/vehicles",
    requireAuth,
    requireRole("customer"),
    async (req, res) => {
        try {
            const { data: vehicles, error } = await req.userSupabase!
                .from("vehicles")
                .select("*")
                .eq("user_id", req.authUser!.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Vehicle fetch error:", error.message);

                res.status(500).json({
                    success: false,
                    message: "Unable to fetch customer vehicles."
                });
                return;
            }

            res.json({
                success: true,
                message: "Customer vehicles fetched successfully!",
                vehicles
            });

        } catch (error) {
            console.error("Customer vehicles error:", error);

            res.status(500).json({
                success: false,
                message: "Something went wrong."
            });
        }
    }
);

// ==========================================
// 13. ADD CUSTOMER VEHICLE
// ==========================================

app.post(
    "/api/customer/vehicles",
    requireAuth,
    requireRole("customer"),
    async (req, res) => {
        try {
            const {
                make,
                model,
                registration_number,
                battery_capacity_kwh
            } = req.body ?? {};

            // Validate required fields
            if (
                typeof make !== "string" ||
                !make.trim() ||
                typeof model !== "string" ||
                !model.trim() ||
                typeof registration_number !== "string" ||
                !registration_number.trim()
            ) {
                res.status(400).json({
                    success: false,
                    message: "Make, model and registration number are required."
                });
                return;
            }

            const registrationNumber = registration_number
                .trim()
                .toUpperCase();

            // Validate battery capacity when supplied
            let batteryCapacity: number | null = null;

            if (
                battery_capacity_kwh !== undefined &&
                battery_capacity_kwh !== null &&
                battery_capacity_kwh !== ""
            ) {
                batteryCapacity = Number(battery_capacity_kwh);

                if (
                    !Number.isFinite(batteryCapacity) ||
                    batteryCapacity <= 0
                ) {
                    res.status(400).json({
                        success: false,
                        message: "Battery capacity must be a positive number."
                    });
                    return;
                }
            }

            // Check for duplicate vehicle registration
            const { data: existingVehicle, error: checkError } =
                await req.userSupabase!
                    .from("vehicles")
                    .select("id")
                    .eq("user_id", req.authUser!.id)
                    .ilike("registration_number", registrationNumber)
                    .maybeSingle();

            if (checkError) {
                console.error(
                    "Vehicle duplicate check error:",
                    checkError.message
                );

                res.status(500).json({
                    success: false,
                    message: "Unable to validate vehicle registration."
                });
                return;
            }

            if (existingVehicle) {
                res.status(409).json({
                    success: false,
                    message: "This vehicle is already registered."
                });
                return;
            }

            // Use authenticated customer's ID
            const { data: vehicle, error } = await req.userSupabase!
                .from("vehicles")
                .insert({
                    user_id: req.authUser!.id,
                    make: make.trim(),
                    model: model.trim(),
                    registration_number: registrationNumber,
                    battery_capacity_kwh: batteryCapacity
                })
                .select("*")
                .single();

            if (error) {
                console.error("Vehicle insert error:", error.message);

                res.status(500).json({
                    success: false,
                    message: "Unable to register vehicle."
                });
                return;
            }

            res.status(201).json({
                success: true,
                message: "Vehicle registered successfully!",
                vehicle
            });

        } catch (error) {
            console.error("Add vehicle error:", error);

            res.status(500).json({
                success: false,
                message: "Something went wrong."
            });
        }
    }
);

// ==========================================
// 14. CREATE CUSTOMER BOOKING
// ==========================================

app.post(
    "/api/customer/bookings",
    requireAuth,
    requireRole("customer"),
    async (req, res) => {
        try {
            const {
                vehicle_id,
                pickup_address,
                drop_address,
                scheduled_pickup,
                starting_battery_percent,
                target_battery_percent
            } = req.body ?? {};

            // Validate required fields
            if (
                typeof vehicle_id !== "string" ||
                !vehicle_id.trim() ||
                typeof pickup_address !== "string" ||
                !pickup_address.trim() ||
                typeof drop_address !== "string" ||
                !drop_address.trim() ||
                !scheduled_pickup
            ) {
                res.status(400).json({
                    success: false,
                    message: "Vehicle, pickup address, drop address and pickup time are required."
                });
                return;
            }

            // Validate scheduled pickup date
            const pickupDate = new Date(scheduled_pickup);

            if (
                Number.isNaN(pickupDate.getTime()) ||
                pickupDate.getTime() <= Date.now()
            ) {
                res.status(400).json({
                    success: false,
                    message: "Please select a valid future pickup date and time."
                });
                return;
            }

            // Validate target battery percentage
            const targetBattery = Number(target_battery_percent);

            if (
                target_battery_percent === undefined ||
                target_battery_percent === null ||
                target_battery_percent === "" ||
                !Number.isInteger(targetBattery) ||
                targetBattery < 0 ||
                targetBattery > 100
            ) {
                res.status(400).json({
                    success: false,
                    message: "Target battery percentage must be between 0 and 100."
                });
                return;
            }

            // Validate starting battery percentage when supplied
            let startingBattery: number | null = null;

            if (
                starting_battery_percent !== undefined &&
                starting_battery_percent !== null &&
                starting_battery_percent !== ""
            ) {
                startingBattery = Number(starting_battery_percent);

                if (
                    !Number.isInteger(startingBattery) ||
                    startingBattery < 0 ||
                    startingBattery > 100
                ) {
                    res.status(400).json({
                        success: false,
                        message: "Starting battery percentage must be between 0 and 100."
                    });
                    return;
                }
            }

            // Verify that the vehicle belongs to this customer
            const { data: vehicle, error: vehicleError } =
                await req.userSupabase!
                    .from("vehicles")
                    .select("id")
                    .eq("id", vehicle_id)
                    .eq("user_id", req.authUser!.id)
                    .maybeSingle();

            if (vehicleError) {
                console.error("Booking vehicle validation error:", vehicleError.message);

                res.status(500).json({
                    success: false,
                    message: "Unable to verify the selected vehicle."
                });
                return;
            }

            if (!vehicle) {
                res.status(404).json({
                    success: false,
                    message: "Vehicle not found in your account."
                });
                return;
            }

            // Generate a booking number
            const bookingNumber =
                `CG-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

            // Initial estimated charges
            const pickupFee = 100;
            const chargingCost = 0;
            const totalAmount = pickupFee + chargingCost;

            // Insert booking using authenticated customer's ID
            const { data: booking, error: bookingError } =
                await req.userSupabase!
                    .from("bookings")
                    .insert({
                        booking_number: bookingNumber,
                        customer_id: req.authUser!.id,
                        vehicle_id: vehicle.id,
                        pickup_address: pickup_address.trim(),
                        drop_address: drop_address.trim(),
                        scheduled_pickup: pickupDate.toISOString(),
                        starting_battery_percent: startingBattery,
                        target_battery_percent: targetBattery,
                        status: "pending",
                        pickup_fee: pickupFee,
                        charging_cost: chargingCost,
                        total_amount: totalAmount
                    })
                    .select("*")
                    .single();

            if (bookingError) {
                console.error("Booking creation error:", bookingError.message);

                res.status(500).json({
                    success: false,
                    message: "Unable to create booking."
                });
                return;
            }

            res.status(201).json({
                success: true,
                message: "Your booking has been created successfully!",
                booking
            });

        } catch (error) {
            console.error("Create booking error:", error);

            res.status(500).json({
                success: false,
                message: "Something went wrong while creating your booking."
            });
        }
    }
);


// ==========================================
// 15. GET CUSTOMER BOOKINGS
// ==========================================

app.get(
    "/api/customer/bookings",
    requireAuth,
    requireRole("customer"),
    async (req, res) => {
        try {
            const { data: bookings, error } =
                await req.userSupabase!
                    .from("bookings")
                    .select("*")
                    .eq("customer_id", req.authUser!.id)
                    .order("created_at", { ascending: false });

            if (error) {
                console.error("Booking fetch error:", error.message);

                res.status(500).json({
                    success: false,
                    message: "Unable to fetch your bookings."
                });
                return;
            }

            res.json({
                success: true,
                message: "Customer bookings fetched successfully!",
                bookings
            });

        } catch (error) {
            console.error("Get customer bookings error:", error);

            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching bookings."
            });
        }
    }
);
// GET SINGLE CUSTOMER BOOKING
app.get(
    "/api/customer/bookings/:id",
    requireAuth,
    requireRole("customer"),
    async (req, res) => {
        try {
            const bookingId = req.params.id;

            const { data: booking, error } =
                await req.userSupabase!
                    .from("bookings")
                    .select("*")
                    .eq("id", bookingId)
                    .eq("customer_id", req.authUser!.id)
                    .maybeSingle();

            if (error) {
                console.error("Booking details error:", error.message);
                res.status(500).json({
                    success: false,
                    message: "Unable to fetch booking details."
                });
                return;
            }

            if (!booking) {
                res.status(404).json({
                    success: false,
                    message: "Booking not found."
                });
                return;
            }

            res.json({
                success: true,
                message: "Booking details fetched successfully!",
                booking
            });

        } catch (error) {
            console.error("Get booking details error:", error);
            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching booking details."
            });
        }
    }
);
// ==========================================
// 14. START SERVER
// ==========================================
// CANCEL CUSTOMER BOOKING
app.patch(
    "/api/customer/bookings/:id/cancel",
    requireAuth,
    requireRole("customer"),
    async (req, res) => {
        try {
            const bookingId = req.params.id;

            const { data: booking, error: fetchError } =
                await req.userSupabase!
                    .from("bookings")
                    .select("id, status")
                    .eq("id", bookingId)
                    .eq("customer_id", req.authUser!.id)
                    .maybeSingle();

            if (fetchError) {
                console.error("Booking lookup error:", fetchError.message);
                res.status(500).json({
                    success: false,
                    message: "Unable to verify booking."
                });
                return;
            }

            if (!booking) {
                res.status(404).json({
                    success: false,
                    message: "Booking not found."
                });
                return;
            }

            if (booking.status !== "pending") {
                res.status(400).json({
                    success: false,
                    message: "Only pending bookings can be cancelled."
                });
                return;
            }

            const { data: cancelledBooking, error: updateError } =
                await req.userSupabase!
                    .from("bookings")
                    .update({ status: "cancelled" })
                    .eq("id", bookingId)
                    .eq("customer_id", req.authUser!.id)
                    .eq("status", "pending")
                    .select("*")
                    .maybeSingle();

            if (updateError) {
                console.error("Booking cancellation error:", updateError.message);
                res.status(500).json({
                    success: false,
                    message: "Unable to cancel booking."
                });
                return;
            }

            if (!cancelledBooking) {
                res.status(409).json({
                    success: false,
                    message: "Booking status changed. Please refresh and try again."
                });
                return;
            }

            res.json({
                success: true,
                message: "Booking cancelled successfully!",
                booking: cancelledBooking
            });

        } catch (error) {
            console.error("Cancel booking error:", error);
            res.status(500).json({
                success: false,
                message: "Something went wrong while cancelling booking."
            });
        }
    }
);

// ==========================================
// 15. CHARGE & GO AI ASSISTANT ROUTES
// ==========================================
app.use("/api/chatbot", chatbotRouter);
// Compatibility alias for existing frontend callers
app.use("/api/ai/chat", (req, res, next) => {
    // If message is passed in body, forward to /api/chatbot/message handler
    req.url = "/message";
    chatbotRouter(req, res, next);
});

app.listen(PORT, () => {
    console.log("--------------------------------------");
    console.log("CHARGE & GO BACKEND");
    console.log("--------------------------------------");
    console.log(`Server: http://localhost:${PORT}`);
    console.log("Authentication: Enabled");
    console.log("Role protection: Enabled");
    console.log("--------------------------------------");
});