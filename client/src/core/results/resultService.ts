import { openapiAdapter } from "../../api/connection";
import {
    GameResultClient,
    type GameHistoryResponse,
} from "../../generated-ts-client";
import type { ResultRow } from "./types";

const gameResultClient = openapiAdapter(GameResultClient);

function weekLabel(year: number, weekNumber: number): string {
    return `Week ${weekNumber}, ${year}`;
}

export async function fetchPlayerResults(): Promise<ResultRow[]> {
    const history: GameHistoryResponse[] =
        (await gameResultClient.getDrawHistoryForPlayers()) ?? [];

    const sorted = [...history].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        if (a.weekNumber !== b.weekNumber)
            return b.weekNumber - a.weekNumber;

        return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
    });

    return sorted.map(g => ({
        id: g.id,
        weekLabel: weekLabel(g.year, g.weekNumber),
        winningNumbers: g.winningNumbers ?? [],
        createdAt: g.createdAt,
    }));
}
