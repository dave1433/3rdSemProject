import { useEffect, useMemo, useRef, useState } from "react";
import type { Player } from "../../../core/hooks/usePlayerList.tsx";
import { apiPatch, openapiAdapter } from "../../../api/connection.ts";
import { UserClient } from "../../../generated-ts-client.ts";
import type { UserResponse } from "../../../generated-ts-client.ts";

interface Props {
    players: Player[]; // kept for compatibility, but we fetch from API
    loading: boolean;
}

type RoleFilter = "all" | "admin" | "player";
type ActiveFilter = "all" | "active" | "inactive";

// Sort strings must match your Sieve mapping names for User
type SortOption = "fullName" | "-createdAt" | "-balance" | "balance";

const userClient = openapiAdapter(UserClient);

function userToPlayer(u: UserResponse): Player {
    return {
        id: u.id,
        fullName: u.fullName,
        phone: u.phone,
        email: u.email,
        active: u.active,
        balance: u.balance,
        role: u.role,
    };
}

function buildSieveFilters(role: RoleFilter, active: ActiveFilter): string | null {
    const parts: string[] = [];

    if (role === "admin") parts.push("role==1");
    if (role === "player") parts.push("role==2");

    if (active === "active") parts.push("active==true");
    if (active === "inactive") parts.push("active==false");

    return parts.length ? parts.join(",") : null;
}

export const PlayerListView = ({ players, loading }: Props) => {
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // UI state
    const [search, setSearch] = useState<string>("");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
    const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
    const [sort, setSort] = useState<SortOption>("fullName");

    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(25);

    // remote state
    const [rows, setRows] = useState<Player[]>(players ?? []);
    const [remoteLoading, setRemoteLoading] = useState<boolean>(false);
    const [remoteError, setRemoteError] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);

    // debounce search
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    useEffect(() => {
        const t = window.setTimeout(() => setDebouncedSearch(search), 300);
        return () => window.clearTimeout(t);
    }, [search]);

    // prevent race updates
    const requestIdRef = useRef(0);

    async function loadUsers() {
        const requestId = ++requestIdRef.current;

        try {
            setRemoteLoading(true);
            setRemoteError(null);

            const filters = buildSieveFilters(roleFilter, activeFilter);
            const sorts = sort;

            // Fetch +1 item to detect next page (since endpoint returns only array)
            const effectivePageSize = pageSize + 1;

            const result = await userClient.getUsers(
                debouncedSearch.trim() ? debouncedSearch.trim() : null,
                filters,
                sorts,
                page,
                effectivePageSize
            );

            if (requestId !== requestIdRef.current) return;

            const mapped = (result ?? []).map(userToPlayer);

            const next = mapped.length > pageSize;
            setHasNextPage(next);
            setRows(next ? mapped.slice(0, pageSize) : mapped);
        } catch (e) {
            if (requestId !== requestIdRef.current) return;
            setRemoteError(e instanceof Error ? e.message : "Failed to load users");
            setRows([]);
            setHasNextPage(false);
        } finally {
            if (requestId === requestIdRef.current) setRemoteLoading(false);
        }
    }

    useEffect(() => {
        void loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, roleFilter, activeFilter, sort, page, pageSize]);

    // fallback to prop list if API isn't ready
    useEffect(() => {
        if (!remoteLoading && rows.length === 0 && (players?.length ?? 0) > 0) {
            setRows(players);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [players]);

    const effectiveLoading = loading || remoteLoading;

    const emptyText = useMemo(() => {
        if (effectiveLoading) return "Loading users…";
        if (remoteError) return remoteError;
        return "No users match your search.";
    }, [effectiveLoading, remoteError]);

    const toggleUserStatus = async (player: Player) => {
        if (updatingId) return;

        setUpdatingId(player.id);

        const endpoint = player.active
            ? `/api/user/${player.id}/deactivate`
            : `/api/user/${player.id}/activate`;

        try {
            const res = await apiPatch(endpoint);
            if (!res.ok) {
                console.error("Failed to update user", await res.text());
            } else {
                await loadUsers();
            }
        } finally {
            setUpdatingId(null);
            window.dispatchEvent(new Event("player-updated"));
        }
    };

    // ---------------------------
    // Inline styles
    // ---------------------------
    const styles = {
        card: {
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 8px 24px rgba(0,0,0,.08)",
            padding: 16,
            width: "100%",
        } as React.CSSProperties,

        header: {
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginBottom: 12,
        } as React.CSSProperties,

        title: {
            fontSize: 18,
            //fontWeight: 800,
            margin: 0,
        } as React.CSSProperties,

        subtitle: {
            margin: 0,
            fontSize: 12,
            opacity: 0.7,
        } as React.CSSProperties,

        rowBox: {
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-end",
            padding: 12,
            border: "1px solid rgba(0,0,0,.08)",
            borderRadius: 14,
            background: "rgba(250,250,250,.9)",
        } as React.CSSProperties,

        row1: {
            marginBottom: 10,
        } as React.CSSProperties,

        row2: {
            marginBottom: 12,
            justifyContent: "space-between",
        } as React.CSSProperties,

        field: {
            display: "flex",
            flexDirection: "column",
            gap: 6,
            minWidth: 160,
        } as React.CSSProperties,

        growField: {
            flex: 1,
            minWidth: 240,
        } as React.CSSProperties,

        label: {
            fontSize: 12,
            //fontWeight: 700,
            opacity: 0.75,
        } as React.CSSProperties,

        input: {
            height: 38,
            padding: "0 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,.12)",
            background: "#fff",
            outline: "none",
        } as React.CSSProperties,

        select: {
            height: 38,
            padding: "0 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,.12)",
            background: "#fff",
            outline: "none",
        } as React.CSSProperties,

        pager: {
            display: "flex",
            alignItems: "center",
            gap: 10,
        } as React.CSSProperties,

        btn: (disabled: boolean) =>
            ({
                height: 38,
                padding: "0 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,.12)",
                background: "#fff",
                cursor: disabled ? "not-allowed" : "pointer",
                //fontWeight: 800,
                opacity: disabled ? 0.5 : 1,
            } as React.CSSProperties),

        pageText: {
            //fontWeight: 800,
            opacity: 0.85,
        } as React.CSSProperties,

        scroll: {
            height: 520,
            overflowY: "auto",
            paddingRight: 4,
        } as React.CSSProperties,

        empty: {
            margin: "12px 0",
            opacity: 0.75,
        } as React.CSSProperties,

        items: {
            display: "flex",
            flexDirection: "column",
            gap: 12,
        } as React.CSSProperties,

        item: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            border: "1px solid rgba(0,0,0,.08)",
            borderRadius: 14,
            padding: 12,
        } as React.CSSProperties,

        name: {
            margin: 0,
            //fontWeight: 800,
        } as React.CSSProperties,

        meta: {
            margin: "2px 0 0 0",
            fontSize: 12,
            opacity: 0.75,
        } as React.CSSProperties,

        actions: {
            display: "flex",
            alignItems: "center",
            gap: 14,
        } as React.CSSProperties,

        balance: {
            //fontWeight: 900,
            whiteSpace: "nowrap",
        } as React.CSSProperties,

        badgeAdmin: {
            fontSize: 12,
            //fontWeight: 900,
            padding: "4px 10px",
            borderRadius: 999,
            background: "#dc2626",
            color: "#fff",
            whiteSpace: "nowrap",
        } as React.CSSProperties,

        // Toggle
        toggleWrap: {
            position: "relative",
            width: 44,
            height: 24,
            display: "inline-flex",
            alignItems: "center",
        } as React.CSSProperties,

        toggleInput: {
            position: "absolute",
            opacity: 0,
            width: 0,
            height: 0,
        } as React.CSSProperties,

        toggleTrack: (on: boolean, disabled: boolean) =>
            ({
                width: 44,
                height: 24,
                borderRadius: 999,
                transition: "150ms",
                display: "block",
                background: on ? "#22c55e" : "#d1d5db",
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
            } as React.CSSProperties),

        toggleKnob: (on: boolean) =>
            ({
                position: "absolute",
                left: 4,
                top: 4,
                width: 16,
                height: 16,
                borderRadius: 999,
                background: "#fff",
                transition: "150ms",
                transform: on ? "translateX(20px)" : "translateX(0)",
            } as React.CSSProperties),
    };

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <h2 className="text-jerneNavy text-lg font-semibold mb-4">
                    All Users</h2>
            </div>

            {/* Row 1: Search / Role / Status / Sort */}
            <div style={{ ...styles.rowBox, ...styles.row1 }}>
                <div style={{ ...styles.field, ...styles.growField }}>
                    <label style={styles.label} htmlFor="pl-search">
                        Search
                    </label>
                    <input
                        id="pl-search"
                        type="text"
                        placeholder="Name, phone, email…"
                        style={styles.input}
                        value={search}
                        onChange={(e) => {
                            setPage(1);
                            setSearch(e.target.value);
                        }}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label} htmlFor="pl-role">
                        Role
                    </label>
                    <select
                        id="pl-role"
                        style={styles.select}
                        value={roleFilter}
                        onChange={(e) => {
                            setPage(1);
                            setRoleFilter(e.target.value as RoleFilter);
                        }}
                    >
                        <option value="all">All</option>
                        <option value="player">Players</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>

                <div style={styles.field}>
                    <label style={styles.label} htmlFor="pl-active">
                        Status
                    </label>
                    <select
                        id="pl-active"
                        style={styles.select}
                        value={activeFilter}
                        onChange={(e) => {
                            setPage(1);
                            setActiveFilter(e.target.value as ActiveFilter);
                        }}
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div style={styles.field}>
                    <label style={styles.label} htmlFor="pl-sort">
                        Sort
                    </label>
                    <select
                        id="pl-sort"
                        style={styles.select}
                        value={sort}
                        onChange={(e) => {
                            setPage(1);
                            setSort(e.target.value as SortOption);
                        }}
                    >
                        <option value="fullName">Name (A → Z)</option>
                        <option value="-createdAt">Newest</option>
                        <option value="-balance">Balance (high → low)</option>
                        <option value="balance">Balance (low → high)</option>
                    </select>
                </div>
            </div>

            {/* Row 2: Page size + Pagination */}
            <div style={{ ...styles.rowBox, ...styles.row2 }}>
                <div style={styles.field}>
                    <label style={styles.label} htmlFor="pl-pagesize">
                        Page size
                    </label>
                    <select
                        id="pl-pagesize"
                        style={styles.select}
                        value={pageSize}
                        onChange={(e) => {
                            setPage(1);
                            setPageSize(Number(e.target.value));
                        }}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                <div style={styles.pager}>
                    <button
                        type="button"
                        style={styles.btn(page <= 1 || effectiveLoading)}
                        disabled={page <= 1 || effectiveLoading}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Prev
                    </button>

                    <span style={styles.pageText}>Page {page}</span>

                    <button
                        type="button"
                        style={styles.btn(!hasNextPage || effectiveLoading)}
                        disabled={!hasNextPage || effectiveLoading}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* List */}
            <div style={styles.scroll}>
                {rows.length === 0 ? (
                    <p style={styles.empty}>{emptyText}</p>
                ) : (
                    <div style={styles.items}>
                        {rows.map((player) => {
                            const disabled = updatingId === player.id;

                            return (
                                <div key={player.id} style={styles.item}>
                                    <div>
                                        <p style={styles.name}>{player.fullName}</p>
                                        <p style={styles.meta}>{player.phone}</p>
                                        <p style={styles.meta}>{player.email}</p>
                                    </div>

                                    <div style={styles.actions}>
                                        {player.role === 1 ? (
                                            <span style={styles.badgeAdmin}>Admin</span>
                                        ) : (
                                            <span style={styles.balance}>{player.balance} DKK</span>
                                        )}

                                        <label style={styles.toggleWrap}>
                                            <input
                                                type="checkbox"
                                                style={styles.toggleInput}
                                                checked={player.active}
                                                disabled={disabled}
                                                onChange={() => toggleUserStatus(player)}
                                            />
                                            <span style={styles.toggleTrack(player.active, disabled)} />
                                            <span style={styles.toggleKnob(player.active)} />
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
