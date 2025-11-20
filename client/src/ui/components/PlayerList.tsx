export const PlayerList = () => {
    // Static items only for UI preview
    const mockedPlayers = [
        { id: 1, name: "Thomas Hansen", phone: "12345678", active: true },
        { id: 2, name: "Marie Jensen", phone: "87654321", active: false },
        { id: 3, name: "Lucas Sørensen", phone: "11223344", active: true },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 w-full h-[600px] overflow-y-auto">
            <h2 className="text-jerneNavy text-lg font-semibold mb-4">Players</h2>

            <div className="flex flex-col gap-4">

                {mockedPlayers.map((player) => (
                    <div
                        key={player.id}
                        className="flex justify-between items-center border border-greyBorder rounded-lg px-4 py-3"
                    >
                        <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-sm text-gray-600">{player.phone}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Static toggle (no logic) */}
                            <span
                                className={`
                  px-2 py-1 text-xs rounded 
                  ${player.active ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-700"}
                `}
                            >
                {player.active ? "Active" : "Inactive"}
              </span>

                            <button className="text-red-600 hover:underline text-sm">Edit</button>
                            <button className="text-red-600 hover:underline text-sm">Delete</button>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
};
