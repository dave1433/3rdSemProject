import { useEffect, useMemo, useState } from "react";
import { fetchBoardPrices, purchaseBoards } from "../board/boardService";
import type {
    BetPlacement,
    FieldsCount,
    PriceMap,
    SubmitStatus,
} from "../board/types";
import { getErrorMessage } from "../../utils/error/getErrorMessage";

export function usePlayerBoard(
    playerId: string,
    balanceValue: number,
    updateBalance: (v: number) => void
) {
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
    // CONSTANTS
    // ----------------------
    const numbers = useMemo(
        () => Array.from({ length: 16 }, (_, i) => i + 1),
        []
    );

    // ----------------------
    // PRICES
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

    const unitPrice = priceByFields[fieldsCount] ?? 0;
    const fields = selectedNumbers.length;

    const price =
        fields === fieldsCount ? unitPrice * times : 0;

    const totalAmount = useMemo(
        () => bets.reduce((s, b) => s + b.amountDkk, 0),
        [bets]
    );

    // ----------------------
    // BALANCE RULES
    // ----------------------
    const canAddToCart =
        unitPrice > 0 &&
        fields === fieldsCount &&
        balanceValue >= totalAmount + price;

    const canSubmitCart =
        bets.length > 0 && balanceValue >= totalAmount;

    const addLockMessage = useMemo(() => {
        if (!canAddToCart && fields === fieldsCount) {
            const remaining = balanceValue - totalAmount;
            return `Insufficient balance. You have ${remaining} DKK left.`;
        }
        return null;
    }, [canAddToCart, fields, fieldsCount, balanceValue, totalAmount]);

    const submitLockMessage = useMemo(() => {
        if (!canSubmitCart && bets.length > 0) {
            return `Insufficient balance to submit.`;
        }
        return null;
    }, [canSubmitCart, bets.length]);

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

        const amount = unitPrice * times;

        setBets(b => [
            ...b,
            {
                id: Date.now().toString(),
                numbers: selectedNumbers,
                fields,
                times,
                unitPriceDkk: unitPrice,
                amountDkk: amount,
            },
        ]);

        clearSelection();
    }

    async function submit() {
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

            setSubmitStatus({ type: "success", text: "Purchase succeeded ✅" });
        } catch (err) {
            const msg = getErrorMessage(err);
            setSubmitStatus({ type: "error", text: msg });
        }
    }

    return {
        // state
        fieldsCount,
        selectedNumbers,
        times,
        bets,
        loading,
        error,
        submitStatus,
        warningMsg,

        // derived
        numbers,
        price,
        totalAmount,
        addLockMessage,
        submitLockMessage,
        submitBtnDisabled,

        // actions
        toggleNumber,
        setFieldsCount,
        setTimes,
        clearSelection,
        addBet,
        removeBet,
        submit,
    };
}
