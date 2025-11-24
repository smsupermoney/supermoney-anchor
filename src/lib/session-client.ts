
"use client";

import { User } from "@/types";

export async function getSession(): Promise<User | null> {
    try {
        const res = await fetch('/api/session');
        if (!res.ok) {
            return null;
        }
        const session = await res.json();
        if (!session.id) {
            return null;
        }
        return session;
    } catch (error) {
        console.error("Failed to fetch session:", error);
        return null;
    }
}
