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

    // Subscribe to global updates
    useEffect(() => {
        subscribers.push(setUser);
        return () => {
            subscribers = subscribers.filter(fn => fn !== setUser);
        };
    }, []);

    // Initial load
    useEffect(() => {
        if (cachedUser) {
            setLoading(false);
            return;
        }

        if (!inflight) {
            inflight = fetchMe()
                .then(u => {
                    inflight = null;
                    return u;
                })
                .catch(err => {
                    inflight = null;
                    throw err;
                });
        }

        const p = inflight;
        if (!p) return;

        p.then(u => {
            cachedUser = u;
            notify();
            setLoading(false);
        }).catch(() => {
            cachedUser = null;
            notify();
            setLoading(false);
        });
    }, []);

    function refresh() {
        setLoading(true);
        fetchMe()
            .then(u => {
                cachedUser = u;
                notify();
            })
            .catch(() => {
                cachedUser = null;
                notify();
            })
            .then(() => {
                setLoading(false);
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
