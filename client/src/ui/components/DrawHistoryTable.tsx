import { DrawHistoryView } from "./DrawHistoryView";
import { useDrawHistory } from "../../core/hooks/useDrawHistory";

export const DrawHistoryTable = () => {
    const { history, loading, error, reload } = useDrawHistory();

    return (
        <DrawHistoryView
            history={history}
            loading={loading}
            error={error}
            reload={reload}
        />
    );
};
