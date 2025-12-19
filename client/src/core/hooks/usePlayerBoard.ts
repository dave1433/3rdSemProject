import { useEffect, useMemo, useState } from "react";
import {
    fetchBoardPrices,
    purchaseBoards,
    getPurchaseStatus,
} from "../board/boardService";

import type {
    BetPlacement,
    FieldsCount,
    PriceMap,
    SubmitStatus,
} from "../board/types";

import type { IsBoardLockedResponse } from "../../generated-ts-client";

import { getErrorMessage } from "../../utils/error/getErrorMessage";

export function usePlayerBoard(
    playerId: string,
    balanceValue: number,
    updateBalance: (v: number) => void
) {
    // ----------------------
    // CORE STATE
    // ----------------------
    const [fieldsCount, setFieldsCount] = useState<FieldsCount>(5);
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [times, setTimes] = useState(1);
    const [bets, setBets] = useState<BetPlacement[]>([]);

    const [priceByFields, setPriceByFields] = useState<PriceMap>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [submitStatus, setSubmitStatus] =
        useState<SubmitStatus>({ type: "idle" });
    const [warningMsg, setWarningMsg] = useState<string | null>(null);

    // ----------------------
    // GAME LOCK STATE
    // ----------------------
    const [lockStatus, setLockStatus] =
        useState<IsBoardLockedResponse | null>(null);

    const isLocked = lockStatus?.isOpen === false;

    // ----------------------
    // CONSTANTS
    // ----------------------
    const numbers = useMemo(
        () => Array.from({ length: 16 }, (_, i) => i + 1),
        []
    );

    // ----------------------
    // LOAD PRICES
    // ----------------------
    useEffect(() => {
        if (!playerId) return;

        (async () => {
            try {
                setLoading(true);
                setError(null);
                setPriceByFields(await fetchBoardPrices());
            } catch {
                setError("Failed to load board page.");
            } finally {
                setLoading(false);
            }
        })();
    }, [playerId]);

    // ----------------------
    // LOAD GAME STATUS
    // ----------------------
    useEffect(() => {
        if (!playerId) return;

        (async () => {
            try {
                const status = await getPurchaseStatus();
                setLockStatus(status);
            } catch {
                setLockStatus({
                    isOpen: false,
                    message: "Unable to determine game status.",
                    year: 0,
                    weekNumber: 0,
                });
            }
        })();
    }, [playerId]);

    // ----------------------
    // PRICING
    // ----------------------
    const unitPrice = priceByFields[fieldsCount] ?? 0;
    const fields = selectedNumbers.length;

    const price = fields === fieldsCount ? unitPrice * times : 0;

    const totalAmount = useMemo(
        () => bets.reduce((s, b) => s + b.amountDkk, 0),
        [bets]
    );

    // ----------------------
    // BALANCE + LOCK RULES
    // ----------------------
    const canAddToCart =
        !isLocked &&
        unitPrice > 0 &&
        fields === fieldsCount &&
        balanceValue >= totalAmount + price;

    const canSubmitCart =
        !isLocked &&
        bets.length > 0 &&
        balanceValue >= totalAmount;

    const addLockMessage = useMemo(() => {
        if (isLocked) return lockStatus?.message ?? null;

        if (fields === fieldsCount && !canAddToCart) {
            const remaining = balanceValue - totalAmount;
            return `Insufficient balance. You have ${remaining} DKK left.`;
        }

        return null;
    }, [
        isLocked,
        lockStatus?.message,
        fields,
        fieldsCount,
        canAddToCart,
        balanceValue,
        totalAmount,
    ]);

    const submitLockMessage = useMemo(() => {
        if (isLocked) return lockStatus?.message ?? null;

        if (!canSubmitCart && bets.length > 0) {
            return `Insufficient balance to submit.`;
        }

        return null;
    }, [isLocked, lockStatus?.message, canSubmitCart, bets.length]);

    const submitBtnDisabled =
        submitStatus.type === "loading" || !canSubmitCart;

    // ----------------------
    // ACTIONS
    // ----------------------
    function toggleNumber(n: number) {
        setSelectedNumbers(prev => {
            if (prev.includes(n)) return prev.filter(x => x !== n);
            if (prev.length >= fieldsCount) return prev;
            return [...prev, n].sort((a, b) => a - b);
        });
    }

    function changeFieldsCount(next: FieldsCount) {
        setFieldsCount(next);
        setSelectedNumbers(prev =>
            prev.length <= next ? prev : prev.slice(0, next)
        );
    }

    function clearSelection() {
        setSelectedNumbers([]);
        setTimes(1);
        setSubmitStatus({ type: "idle" });
    }

    function removeBet(id: string) {
        setBets(bs => bs.filter(b => b.id !== id));
    }

    function addBet() {
        if (!canAddToCart) return;

        setBets(b => [
            ...b,
            {
                id: Date.now().toString(),
                numbers: [...selectedNumbers],
                fields,
                times,
                unitPriceDkk: unitPrice,
                amountDkk: unitPrice * times,
            },
        ]);

        clearSelection();
    }

    async function submit() {
        if (isLocked) {
            setWarningMsg(
                lockStatus?.message ?? "The game has not started yet."
            );
            return;
        }

        if (!canSubmitCart) return;

        try {
            setWarningMsg(null);
            setSubmitStatus({ type: "loading", text: "Purchasing…" });

            await purchaseBoards(
                bets.map(b => ({
                    userId: playerId,
                    numbers: b.numbers,
                    times: b.times,
                }))
            );

            updateBalance(balanceValue - totalAmount);
            setBets([]);

            setSubmitStatus({
                type: "success",
                text: "Purchase succeeded",
            });
        } catch (err) {
            setSubmitStatus({
                type: "error",
                text: getErrorMessage(err),
            });
        }
    }

    // ----------------------
    // PUBLIC API
    // ----------------------
    return {
        fieldsCount,
        selectedNumbers,
        times,
        bets,
        loading,
        error,
        submitStatus,
        warningMsg,

        numbers,
        price,
        totalAmount,
        addLockMessage,
        submitLockMessage,
        submitBtnDisabled,
        canAddToCart,

        toggleNumber,
        setFieldsCount: changeFieldsCount,
        setTimes,
        clearSelection,
        addBet,
        removeBet,
        submit,
    };
}
