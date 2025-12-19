import { apiGet } from "../../api/connection";
import type { UserResponse } from "../../generated-ts-client";
import type { CurrentUser } from "./types";

export async function fetchCurrentUser(): Promise<CurrentUser> {
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
