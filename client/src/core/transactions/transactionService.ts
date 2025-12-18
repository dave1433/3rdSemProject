import { openapiAdapter } from "../../api/connection";
import {
    TransactionClient,
    type TransactionDtoResponse,
    type CreateTransactionRequest,
} from "../../generated-ts-client";
import type { BalanceTransaction } from "./types";

const transactionClient = openapiAdapter(TransactionClient);

export function mapTransaction(
    t: TransactionDtoResponse
): BalanceTransaction {
    const rawType = (t.type ?? "").toLowerCase();
    const rawStatus = (t.status ?? "").toLowerCase();

    return {
        id: t.id,
        date: t.createdAt ?? new Date().toISOString(),
        type:
            rawType === "deposit"
                ? "Deposit"
                : rawType === "refund"
                    ? "Refund"
                    : "Purchase",
        status:
            rawStatus === "approved"
                ? "Approved"
                : rawStatus === "rejected"
                    ? "Rejected"
                    : "Pending",
        amountDkk: t.amount,
        mobilePayRef: t.mobilePayRef ?? undefined,
        description:
            rawType === "deposit"
                ? "Deposit via MobilePay"
                : rawType === "refund"
                    ? "Refund"
                    : "Board purchase",
    };
}

export function buildSieveFilters(
    type: string,
    status: string
): string | null {
    const parts: string[] = [];
    if (type !== "all") parts.push(`type==${type}`);
    if (status !== "all") parts.push(`status==${status}`);
    return parts.length ? parts.join(",") : null;
}

export async function fetchUserTransactions(
    userId: string,
    filters: string | null,
    sort: string,
    page: number,
    pageSize: number
) {
    const rows =
        await transactionClient.getByUser(
            userId,
            filters,
            sort,
            page,
            pageSize
        );

    return (rows ?? []).map(mapTransaction);
}

export async function createDeposit(
    req: CreateTransactionRequest
) {
    return transactionClient.createDeposit(req);
}
