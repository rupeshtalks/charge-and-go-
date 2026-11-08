/**
 * Charge & Go — Shared Domain Types and API Contract
 * Strictly separated from backend, serving as the mutual integration contract.
 */

export type UserRole = 'customer' | 'driver' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
}

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

export interface StatusTimelineEvent {
  status: BookingStatus;
  timestamp: string; // ISO 8601
  title: string;
  description: string;
  actorRole: UserRole | 'system';
  evidencePhotoUrl?: string;
  batteryPercentage?: number;
  odometerReading?: number;
}

export interface PhotoEvidence {
  id: string;
  category: 'pickup_condition' | 'pickup_odometer' | 'station_arrival' | 'charging_progress' | 'charging_completed' | 'return_condition';
  url: string;
  timestamp: string;
  uploaderRole: UserRole;
  caption: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  registrationNumber: string;
  startingBatteryPercentage?: number;
  notes?: string;
}

export interface Booking {
  id: string;
  referenceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicle: Vehicle;
  pickupAddress: string;
  pickupLocality: string;
  pickupPinCode: string;
  returnAddress: string;
  preferredPickupDate: string;
  preferredPickupTimeSlot: string;
  targetBatteryPercentage: number;
  chargingPreference?: string;
  notes?: string;
  status: BookingStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  fixedServiceFee: number; // ₹100
  estimatedChargingCost: number;
  actualChargingCost?: number;
  consumedKWh?: number;
  appliedTariffPerKWh?: number;
  taxAmount: number;
  estimatedTotal: number;
  finalInvoiceTotal?: number;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
  timeline: StatusTimelineEvent[];
  photos: PhotoEvidence[];
}

export interface Invoice {
  invoiceNumber: string;
  bookingReference: string;
  issueDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleDescription: string;
  registrationNumber: string;
  fixedServiceFee: number;
  chargingCost: number;
  consumedKWh?: number;
  tariffPerKWh?: number;
  additionalFees: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  paidAt?: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'driver' | 'charging' | 'invoice' | 'alert';
  bookingId?: string;
}

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  supportedTypes: string[];
  totalSlots: number;
  availableSlots: number;
  status: 'active' | 'maintenance' | 'offline';
  tariffPerKWh: number;
}

export interface ServiceAreaCoverage {
  town: string;
  supportedLocalities: string[];
  supportedPinCodes: string[];
  isAvailable: boolean;
}
