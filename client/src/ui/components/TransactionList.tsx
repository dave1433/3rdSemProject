import { useState } from "react";
import { Card } from "./Card";

export const TransactionList = () => {
    const [open, setOpen] = useState(true);

    const transactions = [
        { id: 1, name: "Thomas Hansen", fields: 5, approved: true },
        { id: 2, name: "Marie Jensen", fields: 7, approved: false },
        { id: 3, name: "Lucas Sørensen", fields: 8, approved: true },
    ];

    const prices: Record<number, number> = {
        5: 20,
        6: 40,
        7: 80,
        8: 160,
    };

    return (
        <Card>
            {/* Header */}
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpen(!open)}>
                <h2 className="text-jerneNavy text-lg font-semibold">
                    Transactions
                </h2>

            </div>

                <div className="flex flex-col gap-4 pb-2">
                    {transactions.map(t => (
                        <div
                            key={t.id}
                            className="flex justify-between items-center border border-greyBorder rounded-lg px-4 py-3"
                        >
                            <div>
                                <p className="font-medium">{t.name}</p>
                                <p className="text-sm text-gray-600">
                                    {t.fields} fields → {prices[t.fields]} DKK
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                defaultChecked={t.approved}
                                className="w-5 h-5 accent-jerneRed"
                            />
                        </div>
                    ))}
                </div>
        </Card>
    );
};
