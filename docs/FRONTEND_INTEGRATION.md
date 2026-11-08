# Charge & Go — Frontend Integration Contract & API Specification

## 1. Overview
This document defines the mutual integration contract between the **Charge & Go** frontend application and the backend service developed by the teammate.

The frontend is architected with a decoupled `ApiService` (`src/services/api.ts`) that implements this exact contract. When the backend service runs at `VITE_API_BASE_URL` (e.g. `http://localhost:4000/api/v1`), the frontend seamlessly communicates with production endpoints. In the absence of an active backend server, the application uses an isolated development adapter with typed mock data.

---

## 2. Environment Configuration
Create or update `.env` in the root:
```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

---

## 3. Mandatory Business Policies & Constants
- **Fixed Pickup-and-Drop Concierge Fee:** `₹100` flat per booking.
- **Power Electricity Tariff:** Charged strictly at actual station meter readings without markup.
- **Currency:** Indian Rupee (`INR` / `₹`), formatted using `en-IN` numbering.
- **Initial Pilot Coverage Area:** Dehradun, Uttarakhand (PIN codes: `248001`, `248002`, `248003`, `248006`, `248009`).

---

## 4. Shared Data Models & TypeScript Types

### 4.1 User Roles
```typescript
export type UserRole = 'customer' | 'driver' | 'admin';
```

### 4.2 Booking Status Enum
```typescript
export type BookingStatus =
  | 'requested'
  | 'confirmed'
  | 'driver_assigned'
  | 'pickup_in_progress'
  | 'vehicle_picked_up'
  | 'at_charging_station'
  | 'charging_in_progress'
  | 'charging_completed'
  | 'return_in_progress'
  | 'vehicle_returned'
  | 'completed'
  | 'cancelled';
```

---

## 5. REST API Endpoints Specification

### 5.1 Account & Authentication
- `GET /api/v1/me`
  - **Headers:** `Authorization: Bearer <jwt>`
  - **Response:** `200 OK`
    ```json
    {
      "id": "usr_c101",
      "name": "Arjun Mehta",
      "email": "arjun.mehta@example.com",
      "phone": "+91 98765 43210",
      "role": "customer"
    }
    ```

### 5.2 Bookings
- `GET /api/v1/bookings`
  - **Query Params:** `?status=active|completed`
  - **Response:** `200 OK` Array of `Booking` objects.

- `POST /api/v1/bookings`
  - **Body:**
    ```json
    {
      "customerName": "Arjun Mehta",
      "customerPhone": "+91 98765 43210",
      "customerEmail": "arjun.mehta@example.com",
      "vehicle": {
        "make": "Tata",
        "model": "Nexon EV Empowered+",
        "registrationNumber": "UK 07 AF 8901",
        "startingBatteryPercentage": 25,
        "notes": "Left flap release"
      },
      "pickupAddress": "Villa 14, Silver Oak Estate, Rajpur Road",
      "pickupLocality": "Rajpur Road",
      "pickupPinCode": "248001",
      "returnAddress": "Villa 14, Silver Oak Estate, Rajpur Road",
      "preferredPickupDate": "2026-10-29",
      "preferredPickupTimeSlot": "10:00 AM - 11:30 AM",
      "targetBatteryPercentage": 85,
      "chargingPreference": "Fast DC Charging (CCS2)",
      "notes": "Gate passcode #4401"
    }
    ```
  - **Response:** `201 Created` with generated `id`, `referenceNumber` (e.g. `CNG-2026-98231`), and fixed fee `100`.

- `GET /api/v1/bookings/:id`
  - **Response:** Full `Booking` record including `timeline` events and `photos`.

- `POST /api/v1/bookings/:id/status`
  - **Authorized Roles:** `driver`, `admin`
  - **Body:**
    ```json
    {
      "status": "charging_in_progress",
      "title": "Charging Active — 68%",
      "description": "Charging at 54kW at Rajpur Gateway Hub",
      "batteryPercentage": 68,
      "photoUrl": "https://..."
    }
    ```

### 5.3 Invoices
- `GET /api/v1/bookings/:id/invoice`
  - **Response:** Tax Invoice breakdown containing:
    - `fixedServiceFee`: 100
    - `chargingCost`: based on `consumedKWh * tariffPerKWh`
    - `taxAmount`: 5% GST
    - `totalAmount`
    - `paymentStatus`: `pending` | `paid`

### 5.4 Photo Evidence
- `POST /api/v1/bookings/:id/photos`
  - **Content-Type:** `multipart/form-data`
  - **Fields:** `file`, `category` (`pickup_condition` | `pickup_odometer` | `station_arrival` | `charging_progress` | `return_condition`), `caption`

### 5.5 Global Notifications
- `GET /api/v1/notifications`
  - **Headers:** `Authorization: Bearer <jwt>`
  - **Response:** `200 OK` Array of `InAppNotification` objects.
- `PATCH /api/v1/notifications/:id/read`
  - **Response:** `200 OK` with updated notification.
- `POST /api/v1/notifications/read-all`
  - **Response:** `200 OK`

### 5.6 User Profile & Avatar
- `PATCH /api/v1/me`
  - **Body:** `{ "name": string, "phone": string, "preferredLanguage": "en" | "te" | "hi", "preferredTheme": "light" | "dark" | "system" }`
- `POST /api/v1/me/avatar`
  - **Content-Type:** `multipart/form-data`
  - **File limits:** Max 5MB, format: JPG, PNG, WebP
  - **Response:** `200 OK` with `{ "avatarUrl": string }`
