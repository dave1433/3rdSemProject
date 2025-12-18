import { useEffect, useState } from "react";
import { apiGet } from "../../api/connection";
import type { UserResponse } from "../../generated-ts-client";

export interface CurrentUser {
    id: string;
    fullName: string;
    balance: number;
    role: number;
}

/* -----------------------------
   GLOBAL SINGLETON STATE
-------------------------------- */
let cachedUser: CurrentUser | null = null;
let inflight: Promise<CurrentUser> | null = null;
let subscribers: Array<(u: CurrentUser | null) => void> = [];

/* -----------------------------
   INTERNAL HELPERS
-------------------------------- */
function notify() {
    subscribers.forEach(fn => fn(cachedUser));
}

async function fetchMe(): Promise<CurrentUser> {
    const res = await apiGet("/api/user/me");
    if (!res.ok) throw new Error("Unauthorized");

    const me: UserResponse = await res.json();

    return {
        id: me.id,
        fullName: me.fullName,
        balance: me.balance ?? 0,
        role: me.role,
    };
}

/* -----------------------------
   PUBLIC HOOK
-------------------------------- */
export function useCurrentUser() {
    const [user, setUser] = useState<CurrentUser | null>(cachedUser);
    const [loading, setLoading] = useState(!cachedUser);

    useEffect(() => {
        subscribers.push(setUser);
        return () => {
            subscribers = subscribers.filter(fn => fn !== setUser);
        };
    }, []);

    useEffect(() => {
        if (cachedUser) {
            setLoading(false);
            return;
        }

        if (!inflight) {
            inflight = fetchMe().finally(() => {
                inflight = null;
            });
        }

        inflight
            .then(u => {
                cachedUser = u;
                notify();
            })
            .catch(() => {
                cachedUser = null;
                notify();
            })
            .finally(() => setLoading(false));
    }, []);

    function refresh() {
        fetchMe().then(u => {
            cachedUser = u;
            notify();
        });
    }

    function updateBalance(newBalance: number) {
        if (!cachedUser) return;
        cachedUser = { ...cachedUser, balance: newBalance };
        notify();
    }

    function clearUser() {
        cachedUser = null;
        notify();
    }

    return { user, loading, refresh, updateBalance, clearUser };
}