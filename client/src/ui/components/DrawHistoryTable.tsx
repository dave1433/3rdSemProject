import { DrawHistoryView } from "./DrawHistoryView";
import { useDrawHistory } from "../../core/hooks/useDrawHistory";

type Props = {
    authorized: boolean;
};

export const DrawHistoryTable = ({ authorized }: Props) => {
    const { history, loading, error, reload } = useDrawHistory(authorized);

    return (
        <DrawHistoryView
            history={history}
            loading={loading}
            error={error}
            reload={reload}
        />
    );
};