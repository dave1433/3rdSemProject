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
    (repeats ?? []).forEach((r: RepeatDtoResponse) => repMap.set(r.id, r));

    return (boards ?? []).map((b: BoardDtoResponse) => {
        const rid = b.repeatId ?? undefined;
        const rep = rid ? repMap.get(rid) : undefined;

        return {
            id: b.id,
            createdAt: b.createdAt ?? null,
            weekLabel: getIsoWeekLabel(b.createdAt),
            numbers: b.numbers ?? [],
            times: b.times ?? 1,
            totalAmountDkk: b.price ?? 0,
            autoRepeat: !b.autoRepeat,
            repeatId: rid,
            repeatOptOut: rep ? !rep.optOut : false,
        };
    });
}

export async function toggleAutoRepeat(
    boardId: string,
    autoRepeat: boolean
) {
    return boardClient.setAutoRepeat(boardId, { autoRepeat });
}
