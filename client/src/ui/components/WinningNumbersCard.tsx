export const WinningNumbersCard = () => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-jerneNavy font-semibold">Winning Numbers</span>
                    <span className="text-sm text-gray-500">Last: Week 47 2025</span>
                </div>

                <div className="flex items-center gap-3">
                    <button className="text-sm text-gray-600 hover:underline">Collapse</button>
                    <button className="px-3 py-1 rounded bg-jerneRed text-white text-sm">Lock</button>
                </div>
            </div>

            {/* Number grid */}
            <div className="grid grid-cols-4 gap-3 mt-4">
                {Array.from({length:16}, (_,i)=>i+1).map(n => (
                    <button key={n}
                            className="h-12 rounded-md bg-gray-100 border border-gray-200 hover:bg-gray-200">
                        {n}
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">Select 3 numbers (order not important)</div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded-lg bg-white border border-gray-200">Clear</button>
                    <button className="px-4 py-2 rounded-lg bg-jerneRed text-white">Enter draw</button>
                </div>
            </div>
        </div>
    )
}