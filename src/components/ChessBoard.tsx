import React, { useState } from "react";
import { Color, PieceSymbol, Square, validateFen } from "chess.js";
import toast from "react-hot-toast";
import { ChessBoardProps, getChessCoordinates, getColor, handleDragOver } from "@/utilities";

// TODO:Redis Queue or Network file System
//TODO: Setup the Open SSL secret key and the change mycontext to ContextProvider

const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  socket,
  setBoard,
  chessBoard,
  setChessBoard,
  isWhite
}) => {
  const [draggedPiece, setDraggedPiece] = useState<null | {
    square: Square;
    type: PieceSymbol;
    color: Color;
  }>(null);
  
  const [from, setFrom] = useState<null | Square | undefined | string>(null);

  const handleDragStart = (piece: {
    square: Square;
    type: PieceSymbol;
    color: Color;
  }) => {
    console.log('dragStart', piece.square)
    setDraggedPiece(piece);
  };

  const handleDrop = (rowIndex: number, columnIndex: number) => {
    const currSquare = getChessCoordinates(rowIndex, columnIndex ,isWhite);
    if (draggedPiece) tryMove(draggedPiece.square, currSquare);
  };

  const handleSquareClick = (rowIndex: number, columnIndex: number) => {
    const currSquare = getChessCoordinates(rowIndex, columnIndex, isWhite);
    if (!from) {
      setFrom(currSquare);
    } else {
      tryMove(from, currSquare);
      setFrom(null);
    }
  };
  const tryMove = (from: Square | string, to: Square | string) => {
    try {
      const turn = isWhite ? "w" : "b";
      if (chessBoard?.turn() === turn) {
        const validMoves = chessBoard?.moves({ square: from, verbose: true });
        console.log("Valid moves:", validMoves);
        console.log("To square:", to);
  
        const moveResult = validMoves?.find(
          (move: any) =>
            move.to === to && move.promotion === undefined && move.captured === undefined
        );
  
        const captureMove = validMoves?.find(
          (move: any) => move.to === to && move.captured !== undefined
        );
  
        const promotionMove = validMoves?.find(
          (move: any) => move.to === to && move.promotion !== undefined
        );
  
        const promotionCaptureMove = validMoves?.find(
          (move: any) => move.to === to && move.promotion !== undefined && move.captured !== undefined
        );
  
        if (moveResult) {
          chessBoard?.move({ from, to });
        } else if (captureMove) {
          chessBoard?.move({ from, to });
        } else if (promotionMove) {
          const promotion = window.prompt("Promote to (q/r/b/n):", "q")?.toLowerCase();
          if (promotion && ["q", "r", "b", "n"].includes(promotion)) {
            chessBoard?.move({ from, to, promotion: promotion as "q" | "r" | "b" | "n" });
          } else {
            toast.error("Invalid promotion choice");
            return;
          }
        } else if (promotionCaptureMove) {
          const promotion = window.prompt("Promote to (q/r/b/n):", "q")?.toLowerCase();
          if (promotion && ["q", "r", "b", "n"].includes(promotion)) {
            chessBoard?.move({ from, to, promotion: promotion as "q" | "r" | "b" | "n" });
          } else {
            toast.error("Invalid promotion choice");
            return;
          }
        } else {
          toast.error("Invalid move");
          return;
        }
  
        setBoard(chessBoard?.board());
        if (validateFen(chessBoard?.fen())) {
          socket?.send(JSON.stringify({ type: "move", move: { from, to } }));
        }
  
        // Check for stalemate
        if (chessBoard?.isStalemate()) {
          toast.success("Stalemate");
        }
      } else {
        toast.error("Invalid Piece you are trying to move or this is not your turn");
      }
    } catch (e) {
      console.log(e);
      toast.error("Invalid move");
    } finally {
      setDraggedPiece(null);
      setFrom(null);
    }
  };
  return (
    <div
    className="w-auto"
  >
      {board?.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-8 gap-0">
          {row.map((square, columnIndex) => (
            <div
              key={`${rowIndex}-${columnIndex}`}
              className={`h-[100px] w-min-[100px] flex justify-center items-center ${(rowIndex + columnIndex) % 2 === 0 ? "bg-white" : "bg-gray-800"}`}
              data-row-index={rowIndex}
              data-column-index={columnIndex}
              onDragOver={handleDragOver}
              onClick={() => handleSquareClick(rowIndex, columnIndex)}
              onDrop = {()=>handleDrop(rowIndex, columnIndex)}
            >
              {square && (
                <Piece
                  color={square.color}
                  type={square.type}
                  chessBoard={chessBoard}
                  square={square.square}
                  onDragStart={handleDragStart}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const Piece: React.FC<{
  color: Color;
  type: PieceSymbol;
  chessBoard: any;
  square: Square;
  onDragStart: (piece: { square: Square; type: PieceSymbol; color: Color }) => void;
}> = ({ color, type, chessBoard, square, onDragStart }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const piece = { square, type, color };
    e.dataTransfer.setData("text/plain", JSON.stringify(piece));
    onDragStart(piece);
  };

  return (
    <div
      className={`piece ${color}-${type} text-center cursor-grab`}
      draggable
      onDragStart={handleDragStart}
    >
      <img src={`${color}${type}.png`} alt={`${color} ${type}`} />
    </div>
  );
};

export default ChessBoard;