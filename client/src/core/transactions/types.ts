export type TransactionStatus = "Pending" | "Approved" | "Rejected";
export type TransactionType = "Deposit" | "Purchase" | "Refund";

export interface BalanceTransaction {
    id: string;
    date: string;
    type: TransactionType;
    amountDkk: number;
    mobilePayRef?: string;
    status: TransactionStatus;
    description: string;
}

export const TYPE_OPTIONS = ["all", "deposit", "purchase", "refund"] as const;
export type TypeFilter = typeof TYPE_OPTIONS[number];

export const STATUS_OPTIONS = ["all", "pending", "approved", "rejected"] as const;
export type StatusFilter = typeof STATUS_OPTIONS[number];

export const SORT_OPTIONS = [
    { value: "-createdat", label: "Newest" },
    { value: "createdat", label: "Oldest" },
    { value: "-amount", label: "Amount (high → low)" },
    { value: "amount", label: "Amount (low → high)" },
] as const;

export type SortOption = typeof SORT_OPTIONS[number]["value"];
