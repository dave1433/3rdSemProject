import { openapiAdapter } from "../../api/connection";
import {
    BoardClient,
    type BoardDtoResponse,
} from "../../generated-ts-client";
import { getIsoWeekLabel } from "../../utils/date/getIsoWeekLabel";
import type { PlayerRecord } from "./types";

const boardClient = openapiAdapter(BoardClient);

// ----------------------------------
// FETCH PLAYER HISTORY
// ----------------------------------
export async function fetchPlayerHistory(
    userId: string
): Promise<PlayerRecord[]> {
    const boards = await boardClient.getByUser(userId);

    return (boards ?? []).map((b: BoardDtoResponse) => ({
        id: b.id,
        createdAt: b.createdAt ?? null,
        weekLabel: getIsoWeekLabel(b.createdAt),
        numbers: b.numbers ?? [],
        times: b.times ?? 1,
        totalAmountDkk: b.price ?? 0,

        // TRUST BACKEND
        autoRepeat: b.autoRepeat ?? false,
        repeatId: b.repeatId ?? undefined,

        //  STOPPED = repeat exists but autoRepeat is false
        repeatOptOut: !!b.repeatId && !b.autoRepeat,
    }));
}

// ----------------------------------
// TOGGLE REPEAT (BOARD-LEVEL)
// ----------------------------------
export async function toggleAutoRepeat(
    boardId: string,
    autoRepeat: boolean
) {
    return boardClient.setAutoRepeat(boardId, { autoRepeat });}
