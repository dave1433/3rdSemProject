import {useWinningNumbers} from "../../core/hooks/useWinningNumbers.ts";
import {WinningNumbersCardView} from "./results/WinningNumbersCardView.tsx";

function getWeekNumber(date: Date) {
    const d = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ));

    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

    return Math.ceil(
        (((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }

type Props = {
    authorized: boolean;
};

export const WinningNumbersCard = ({ authorized }: Props) => {
    const now = new Date();
    const year = now.getFullYear();
    const weekNumber = getWeekNumber(now);

    const {
        selected,
        locked,
        loading,
        toggleNumber,
        clearSelection,
        submitDraw,
    } = useWinningNumbers(year, weekNumber, authorized);

    return (
        <WinningNumbersCardView
            year={year}
            weekNumber={weekNumber}
            selected={selected}
            locked={locked}
            loading={loading}
            toggleNumber={toggleNumber}
            clearSelection={clearSelection}
            submitDraw={submitDraw}
        />
    );
};

