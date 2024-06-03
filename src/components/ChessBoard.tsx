import React, { useState } from "react";
import { Color, PieceSymbol, Square, validateFen } from "chess.js";
import toast from "react-hot-toast";

interface ChessBoardProps {
  board:
    | ({
        square: Square | string;
        type: PieceSymbol;
        color: Color;
      } | null)[][]
    | undefined;
  socket: WebSocket | null | any;
  setBoard: React.Dispatch<
    React.SetStateAction<
      | ({
          square: Square | string;
          type: PieceSymbol;
          color: Color;
        } | null)[][]
      | undefined
    >
  >;
  chessBoard: any;
  setChessBoard: React.Dispatch<React.SetStateAction<any>>;
  isWhite: boolean | null;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  socket,
  setBoard,
  chessBoard,
  setChessBoard,
  isWhite
}) => {
  const [from, setFrom] = useState<null | Square | string | undefined>(null);
  const [to, setTo] = useState<null | Square | string | undefined>(null);
  const getColor = (rowIndex: number, columnIndex: number): string => {
    return (rowIndex + columnIndex) % 2 === 0 ? "bg-gray-400" : "bg-gray-800";
  };
  const getChessCoordinates = (row: number, col: number) => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const rank = 8 - row;
    const file = files[col];
    return `${file}${rank}`;
  };
  const moveHandler = (rowIndex: number, columnIndex: number) => {
    const currSquare = getChessCoordinates(rowIndex, columnIndex);
    if (!from) {
      setFrom(currSquare);
    } else {
      try {
        const turn = isWhite ? "w" : "b";
        if(chessBoard?.turn() === turn) {
          const moveResult = chessBoard?.move({ from, to: currSquare });
          if (moveResult) {
            setBoard(chessBoard?.board());
            if (validateFen(chessBoard?.fen())) socket?.send(JSON.stringify({ type: "move", move: { from, to: currSquare } }));
          }
        }else{
          toast.error("Invalid Piece you are trying to move or this is not your turn");
        }
      } catch (e) {
        console.log(e);
        toast.error("Invalid move");
      } finally {
        setFrom(null);
        setTo(null);
      }
    }
  }
  return (
    <div className="chessboard w-auto">
      {board?.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-8 gap-0">
          {row.map((square, columnIndex) => (
            <div
              key={`${rowIndex}-${columnIndex}`}
              className={`h-[100px] w-min-[100px] flex justify-center items-center ${getColor(
                rowIndex,
                columnIndex
              )}`}
              onClick={() => moveHandler(rowIndex, columnIndex)}
            >
              {square && <Piece color={square.color} type={square.type} />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const Piece: React.FC<{ color: Color; type: PieceSymbol }> = ({
  color,
  type,
}) => {
  return <div className={`piece ${color}-${type} text-center`}>{type} </div>;
};

export default ChessBoard;
