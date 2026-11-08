import { BookingStatus } from '../types';

export const STATUS_METADATA: Record<BookingStatus, {
  label: string;
  description: string;
  color: string;
  badgeClass: string;
  stepIndex: number;
}> = {
  requested: {
    label: 'Booking Requested',
    description: 'Booking received and awaiting initial operational review.',
    color: '#77717A',
    badgeClass: 'badge-eggplant',
    stepIndex: 1,
  },
  confirmed: {
    label: 'Booking Confirmed',
    description: 'Booking accepted; scheduling pickup window.',
    color: '#3B82F6',
    badgeClass: 'badge-eggplant',
    stepIndex: 2,
  },
  driver_assigned: {
    label: 'Driver Assigned',
    description: 'Verified pickup specialist assigned to your vehicle.',
    color: '#8B5CF6',
    badgeClass: 'badge-orchid',
    stepIndex: 3,
  },
  pickup_in_progress: {
    label: 'Driver En Route',
    description: 'Driver is traveling to your designated pickup address.',
    color: '#F59E0B',
    badgeClass: 'badge-orange',
    stepIndex: 4,
  },
  vehicle_picked_up: {
    label: 'Vehicle Collected',
    description: 'Handover complete with initial condition inspection.',
    color: '#10B981',
    badgeClass: 'badge-orchid',
    stepIndex: 5,
  },
  at_charging_station: {
    label: 'At Station',
    description: 'Vehicle received at designated EV fast charging bay.',
    color: '#3B82F6',
    badgeClass: 'badge-eggplant',
    stepIndex: 6,
  },
  charging_in_progress: {
    label: 'Charging In Progress',
    description: 'Battery actively drawing power to target percentage.',
    color: '#FF5A0A',
    badgeClass: 'badge-orange',
    stepIndex: 7,
  },
  charging_completed: {
    label: 'Charging Complete',
    description: 'Target charge reached; final station inspection logged.',
    color: '#10B981',
    badgeClass: 'badge-orchid',
    stepIndex: 8,
  },
  return_in_progress: {
    label: 'Return Delivery',
    description: 'Driver returning vehicle to your requested address.',
    color: '#F59E0B',
    badgeClass: 'badge-orange',
    stepIndex: 9,
  },
  vehicle_returned: {
    label: 'Vehicle Returned',
    description: 'Vehicle safely parked and handed over to customer.',
    color: '#10B981',
    badgeClass: 'badge-orchid',
    stepIndex: 10,
  },
  completed: {
    label: 'Booking Completed',
    description: 'Journey completed, final invoice settled.',
    color: '#10B981',
    badgeClass: 'badge-orchid',
    stepIndex: 11,
  },
  cancelled: {
    label: 'Cancelled',
    description: 'This booking has been cancelled.',
    color: '#EF4444',
    badgeClass: 'badge-eggplant',
    stepIndex: 0,
  },
};

/** Formats INR currency using the official Indian rupee grouping standard */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Formats readable date string */
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
