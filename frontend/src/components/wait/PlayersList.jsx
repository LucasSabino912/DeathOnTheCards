export default function PlayersList({ players = [] }) {
  console.log(players);
  
  return (
    <ul className="divide-y divide-[#825012]/40">
      {players.map((player, index) => {
        const playerId = player.id;
        const isHost = player.is_host; // Changed from player.isHost
        
        return (
          <li
            key={playerId}
            className="flex items-center justify-between px-6 py-4"
          >
            <span className="truncate">
              {isHost && (
                <span role="img" aria-label="host" className="mr-2">
                  👑
                </span>
              )}
              {player?.name ?? `Jugador ${index + 1}`}
            </span>
            <span className="text-sm opacity-80">
              {isHost ? "Host" : "Jugador"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}