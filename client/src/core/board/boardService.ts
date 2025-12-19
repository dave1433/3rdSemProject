import { openapiAdapter } from "../../api/connection";
import {
    BoardClient,
    BoardPriceClient,
    type BoardPriceDtoResponse,
    type CreateBoardRequest,
    type IsBoardLockedResponse,
} from "../../generated-ts-client";

const boardClient = openapiAdapter(BoardClient);
const boardPriceClient = openapiAdapter(BoardPriceClient);

// --------------------------------------------------
// GET board prices
// --------------------------------------------------
export async function fetchBoardPrices() {
    const rows: BoardPriceDtoResponse[] =
        (await boardPriceClient.getAll()) ?? [];

    const map: Record<number, number> = {};
    for (const r of rows) {
        map[r.fieldsCount] = r.price;
    }

    return map;
}

// --------------------------------------------------
// GET purchase status
// --------------------------------------------------
export async function getPurchaseStatus(): Promise<IsBoardLockedResponse> {
    return boardClient.getIsBoardLockedStatus();
}

// --------------------------------------------------
// POST purchase boards
// --------------------------------------------------
export async function purchaseBoards(payload: CreateBoardRequest[]) {
    return boardClient.purchase(payload);
}
