import { openapiAdapter } from "../../api/connection";
import {
    BoardClient,
    BoardPriceClient,
    type BoardPriceDtoResponse,
    type CreateBoardRequest,
} from "../../generated-ts-client";

const boardClient = openapiAdapter(BoardClient);
const boardPriceClient = openapiAdapter(BoardPriceClient);

export async function fetchBoardPrices() {
    const rows: BoardPriceDtoResponse[] =
        (await boardPriceClient.getAll()) ?? [];

    const map: Record<number, number> = {};
    for (const r of rows) {
        map[r.fieldsCount] = r.price;
    }
    return map;
}

export async function purchaseBoards(payload: CreateBoardRequest[]) {
    return boardClient.purchase(payload);
}
