import { db } from "@/lib/db";

import {
  GameDataType,
  PlayerData,
  useBotTurn,
  usePlayersInfo,
} from "@/lib/bingo";
import { HeadingSection } from "../common/heading-section";
import { PlayersGrid } from "./players-info";
import { BingoResultsScreen } from "./result-screen";
import { StartBingoGame } from "./start-game";
import { UserInput } from "./user-input";

export const BingoGameArea = ({
  gameData,
  players,
}: {
  gameData: GameDataType;
  players: PlayerData[];
}) => {
  const me = db.useUser();
  console.log("players", gameData, players);
  const myData = players?.find((p) => p.userId === me.id);
  // --- Fetch Expanded Player Info
  const playersInfo = usePlayersInfo(gameData, players);

  // --- Bot Turn Handler
  useBotTurn(gameData, players, playersInfo);

  const renderGameState = () => {
    if (!gameData) return null;

    switch (gameData.status) {
      case "created":
        return (
          <StartBingoGame
            gameId={gameData.id}
            bgId={myData?.id!}
            board={myData?.board || []}
          />
        );

      case "playing":
        return (
          <>
            <PlayersGrid
              playersInfo={playersInfo}
              currentTurn={gameData.orderOfTurns[0]}
              players={players}
            />

            <UserInput
              gameId={gameData.id}
              board={myData?.board || []}
              winningArray={myData?.winningArray || [[]]}
              markedNumbers={gameData.markedNumbers}
              orderOfTurns={gameData.orderOfTurns}
              bpId={myData?.id || ""}
            />
          </>
        );

      case "completed":
        return (
          <BingoResultsScreen
            playersInfo={playersInfo}
            players={players}
            markedNumbers={gameData.markedNumbers}
            myId={me.id}
            wonBy={gameData.wonBy}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <HeadingSection heading="Bingo Game" />
      {playersInfo.length > 0 && renderGameState()}
    </>
  );
};
