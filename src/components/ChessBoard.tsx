"use client";
import React from 'react';
import { Color, PieceSymbol, Square } from 'chess.js';

interface ChessBoardProps {
  board: (
    {
      square: Square;
      type: PieceSymbol;
      color: Color;
    } | null)[][] | undefined
  }


const ChessBoard: React.FC<ChessBoardProps> = ({ board }: ChessBoardProps) => {

  const getColor = (rowIndex: number, columnIndex: number): string => {
    return (rowIndex + columnIndex) % 2 === 0 ? 'bg-white' : 'bg-gray-800';
  };
  console.log(board)
  return (
    <div className="chessboard">
      {board?.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((square, columnIndex) => (
            <div key={`${rowIndex}-${columnIndex}`} className={`square ${getColor(rowIndex, columnIndex)}`}>
              {square && <Piece color={square.color} type={square.type} />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const Piece: React.FC<{ color: Color; type: PieceSymbol }> = ({ color, type }) => {
  return <div className={`piece ${color}-${type}`} />;
};

export default ChessBoard;
