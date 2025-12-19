export type FieldsCount = 5 | 6 | 7 | 8;

export interface BetPlacement {
    id: string;
    numbers: number[];
    fields: number;
    times: number;
    unitPriceDkk: number;
    amountDkk: number;
}

export type PriceMap = Partial<Record<FieldsCount, number>>;

export type SubmitStatus =
    | { type: "idle" }
    | { type: "loading"; text: string }
    | { type: "success"; text: string }
    | { type: "error"; text: string };
