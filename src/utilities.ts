"use client"
import { Color, PieceSymbol, Square, validateFen } from "chess.js";

export const getColor = (rowIndex: number, columnIndex: number): string => {
    console.log(rowIndex + columnIndex % 2 === 0 ? "bg-gray-400" : "bg-gray-800");
    return (rowIndex + columnIndex) % 2 === 0 ? "bg-white" : "bg-gray-800";
  };

  export interface ChessBoardProps {
    board:
      | ({
          square: Square;
          type: PieceSymbol;
          color: Color;
        } | null)[][]
      | undefined;
    socket: WebSocket | null | any;
    setBoard: React.Dispatch<
      React.SetStateAction<
        | ({
            square: Square;
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
  export   const getChessCoordinates = (row: number, col: number, isWhite: boolean | null) => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const rank = 8 - row;
    const file = files[col];
    return `${file}${rank}`;
  };
  export const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };