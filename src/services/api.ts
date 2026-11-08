import { Booking, ChargingStation, InAppNotification, Invoice, ServiceAreaCoverage, UserProfile } from '../types';
import { INITIAL_BOOKINGS, MOCK_CHARGING_STATIONS, MOCK_COVERAGE, MOCK_CURRENT_USER, MOCK_NOTIFICATIONS } from './mockData';

// Storage keys for reactive mock session persistence in development
const STORAGE_KEY_BOOKINGS = 'cng_dev_bookings_v1';
const STORAGE_KEY_USER = 'cng_dev_user_v1';
const STORAGE_KEY_NOTIFS = 'cng_dev_notifs_v1';

class ApiService {
  private isDevelopmentMode: boolean;
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
    // If backend is not available, default gracefully to explicitly labeled development adapter
    this.isDevelopmentMode = true;
    this.initLocalStorage();
  }

  private initLocalStorage() {
    if (!localStorage.getItem(STORAGE_KEY_BOOKINGS)) {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    }
    if (!localStorage.getItem(STORAGE_KEY_USER)) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(MOCK_CURRENT_USER));
    }
    if (!localStorage.getItem(STORAGE_KEY_NOTIFS)) {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(MOCK_NOTIFICATIONS));
    }
  }

  // Auth & Profile
  async getCurrentUser(): Promise<UserProfile> {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : MOCK_CURRENT_USER;
  }

  async switchRole(role: 'customer' | 'driver' | 'admin'): Promise<UserProfile> {
    const user: UserProfile = {
      id: role === 'customer' ? 'usr_c101' : role === 'driver' ? 'drv_05' : 'adm_01',
      name: role === 'customer' ? 'Arjun Mehta' : role === 'driver' ? 'Vikram Singh' : 'Ananya Roy (Operations Lead)',
      email: `${role}@chargeandgo.in`,
      phone: '+91 98765 43210',
      role,
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return user;
  }

  // Coverage
  async getCoverage(): Promise<ServiceAreaCoverage> {
    return MOCK_COVERAGE;
  }

  async checkPinCode(pin: string): Promise<{ covered: boolean; message: string }> {
    const covered = MOCK_COVERAGE.supportedPinCodes.includes(pin.trim());
    return {
      covered,
      message: covered
        ? `We service PIN ${pin} in ${MOCK_COVERAGE.town}! Pickup & drop available.`
        : `Service is currently active exclusively in ${MOCK_COVERAGE.town}. Expanding soon!`,
    };
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    return raw ? JSON.parse(raw) : INITIAL_BOOKINGS;
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const all = await this.getBookings();
    return all.find((b) => b.id === id || b.referenceNumber === id) || null;
  }

  async createBooking(input: Partial<Booking>): Promise<Booking> {
    const all = await this.getBookings();
    const randomRef = 'CNG-2026-' + Math.floor(10000 + Math.random() * 90000);
    const newBooking: Booking = {
      id: 'bk_' + Date.now(),
      referenceNumber: randomRef,
      customerId: input.customerId || 'usr_c101',
      customerName: input.customerName || 'Arjun Mehta',
      customerPhone: input.customerPhone || '+91 98765 43210',
      customerEmail: input.customerEmail || 'arjun.mehta@example.com',
      vehicle: input.vehicle || {
        id: 'vh_new',
        make: 'Tata',
        model: 'Nexon EV',
        registrationNumber: 'UK 07 AB 1234',
        startingBatteryPercentage: 30,
      },
      pickupAddress: input.pickupAddress || '',
      pickupLocality: input.pickupLocality || 'Rajpur Road',
      pickupPinCode: input.pickupPinCode || '248001',
      returnAddress: input.returnAddress || input.pickupAddress || '',
      preferredPickupDate: input.preferredPickupDate || new Date().toISOString().split('T')[0],
      preferredPickupTimeSlot: input.preferredPickupTimeSlot || '10:00 AM - 11:30 AM',
      targetBatteryPercentage: input.targetBatteryPercentage || 80,
      chargingPreference: input.chargingPreference || 'CCS2 Fast DC',
      notes: input.notes || '',
      status: 'requested',
      fixedServiceFee: 100, // Fixed ₹100
      estimatedChargingCost: input.estimatedChargingCost || 450,
      taxAmount: 25,
      estimatedTotal: (input.estimatedChargingCost || 450) + 100 + 25,
      isPaid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'requested',
          timestamp: new Date().toISOString(),
          title: 'Booking Requested',
          description: 'Your pickup and charging request has been scheduled.',
          actorRole: 'customer',
        },
      ],
      photos: [],
    };

    all.unshift(newBooking);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(all));
    return newBooking;
  }

  async updateBookingStatus(
    bookingId: string,
    status: Booking['status'],
    details?: {
      title?: string;
      description?: string;
      actorRole?: 'customer' | 'driver' | 'admin' | 'system';
      batteryPercentage?: number;
      odometerReading?: number;
      photoUrl?: string;
      photoCategory?: any;
    }
  ): Promise<Booking> {
    const all = await this.getBookings();
    const idx = all.findIndex((b) => b.id === bookingId);
    if (idx === -1) throw new Error('Booking not found');

    const booking = all[idx];
    booking.status = status;
    booking.updatedAt = new Date().toISOString();

    const timelineItem = {
      status,
      timestamp: new Date().toISOString(),
      title: details?.title || `Status updated to ${status}`,
      description: details?.description || 'Operational update logged.',
      actorRole: details?.actorRole || 'system',
      batteryPercentage: details?.batteryPercentage,
      odometerReading: details?.odometerReading,
      evidencePhotoUrl: details?.photoUrl,
    };
    booking.timeline.push(timelineItem);

    if (details?.photoUrl && details?.photoCategory) {
      booking.photos.push({
        id: 'ph_' + Date.now(),
        category: details.photoCategory,
        url: details.photoUrl,
        timestamp: new Date().toISOString(),
        uploaderRole: (details.actorRole as any) || 'driver',
        caption: details.description || '',
      });
    }

    all[idx] = booking;
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(all));
    return booking;
  }

  // Invoices
  async getInvoiceByBookingId(bookingId: string): Promise<Invoice | null> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) return null;

    return {
      invoiceNumber: 'INV-' + booking.referenceNumber.replace('CNG-', ''),
      bookingReference: booking.referenceNumber,
      issueDate: booking.createdAt,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      vehicleDescription: `${booking.vehicle.make} ${booking.vehicle.model}`,
      registrationNumber: booking.vehicle.registrationNumber,
      fixedServiceFee: booking.fixedServiceFee, // ₹100
      chargingCost: booking.actualChargingCost || booking.estimatedChargingCost,
      consumedKWh: booking.consumedKWh || 24,
      tariffPerKWh: booking.appliedTariffPerKWh || 18,
      additionalFees: 0,
      taxAmount: booking.taxAmount,
      totalAmount: (booking.actualChargingCost || booking.estimatedChargingCost) + booking.fixedServiceFee + booking.taxAmount,
      paymentStatus: booking.isPaid ? 'paid' : 'pending',
      paidAt: booking.isPaid ? booking.updatedAt : undefined,
    };
  }

  // Notifications
  async getNotifications(): Promise<InAppNotification[]> {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    return raw ? JSON.parse(raw) : MOCK_NOTIFICATIONS;
  }

  async markNotificationRead(id: string): Promise<void> {
    const all = await this.getNotifications();
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(updated));
  }

  // Stations
  async getChargingStations(): Promise<ChargingStation[]> {
    return MOCK_CHARGING_STATIONS;
  }
}

export const api = new ApiService();
