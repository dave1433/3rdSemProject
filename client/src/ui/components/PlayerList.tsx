import { PlayerListView } from "./player/PlayerListView.tsx";
import {usePlayerList} from "../../core/hooks/usePlayerList.tsx";

export const PlayerList = () => {
    const { players, loading } = usePlayerList();

    return <PlayerListView players={players} loading={loading} />;
};
