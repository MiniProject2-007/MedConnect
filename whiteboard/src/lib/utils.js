import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const getSlotString = (slot) => {
    if (slot === 10) {
        return "10:00 AM - 11:00 AM";
    }
    if (slot === 11) {
        return "11:00 AM - 12:00 PM";
    }
    if (slot === 12) {
        return "12:00 PM - 1:00 PM";
    }
    if (slot === 13) {
        return "1:00 PM - 2:00 PM";
    }
    if (slot === 14) {
        return "2:00 PM - 3:00 PM";
    }
    if (slot === 15) {
        return "3:00 PM - 4:00 PM";
    }
    if (slot === 16) {
        return "4:00 PM - 5:00 PM";
    }
};
