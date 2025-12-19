export interface PlayerRecord {
    id: string;
    createdAt?: string | null;

    weekLabel: string;
    numbers: number[];
    times: number;
    totalAmountDkk: number;

    autoRepeat: boolean;
    repeatId?: string;
    repeatOptOut: boolean;
}