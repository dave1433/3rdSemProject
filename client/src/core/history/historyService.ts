import { openapiAdapter } from "../../api/connection";
import {
    BoardClient,
    RepeatClient,
    type BoardDtoResponse,
    type RepeatDtoResponse,
} from "../../generated-ts-client";
import { getIsoWeekLabel } from "../../utils/date/getIsoWeekLabel";
import type { PlayerRecord } from "./types";

const boardClient = openapiAdapter(BoardClient);
const repeatClient = openapiAdapter(RepeatClient);

export async function fetchPlayerHistory(
    userId: string
): Promise<PlayerRecord[]> {
    const [boards, repeats] = await Promise.all([
        boardClient.getByUser(userId),
        repeatClient.getMine(),
    ]);

    const repMap = new Map<string, RepeatDtoResponse>();
    (repeats ?? []).forEach((r: RepeatDtoResponse) =>
        repMap.set(r.id, r)
    );

    return (boards ?? []).map((b: BoardDtoResponse) => {
        const repeatId = b.repeatId ?? undefined;
        const repeat = repeatId ? repMap.get(repeatId) : undefined;

        return {
            id: b.id,
            createdAt: b.createdAt ?? null,
            weekLabel: getIsoWeekLabel(b.createdAt),
            numbers: b.numbers ?? [],
            times: b.times ?? 1,
            totalAmountDkk: b.price ?? 0,

            // DO NOT invert backend values
            autoRepeat: !b.autoRepeat,

            repeatId,

            // DO NOT invert this either
            repeatOptOut: repeat ? !repeat.optOut : false,
        };
    });
}

export async function toggleAutoRepeat(
    boardId: string,
    autoRepeat: boolean
) {
    return boardClient.setAutoRepeat(boardId, { autoRepeat });
}
