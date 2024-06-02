'use client';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import ChessBoard from '@/components/ChessBoard';
import { useSocket } from '@/hooks/useSocket';
import { Chess } from 'chess.js';
import { Square, PieceSymbol, Color } from 'chess.js';

interface ChessBoardProps {
  board: (
    {
      square: Square;
      type: PieceSymbol;
      color: Color;
    } | null)[][] | undefined
  }
export default function Game() {
  const socket = useSocket();
  const [chessBoard , setChessBoard] = useState<Chess | null>(null);
  const [board, setBoard] = useState<ChessBoardProps[][] | null | any>(null);
  
  useEffect(() => {
    if (!socket) return;
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      console.log(message);
      switch (message.type) {
        case "init_game":
          console.log("init game");
          setChessBoard(new Chess());
          setBoard(new Chess().board());
          console.log(chessBoard?.board()); 
          break;
        case "move":
          console.log("move");
          // Move in client side
          chessBoard?.move(message.move);
          setBoard(chessBoard?.board());
          // Move in server side
          socket.send(JSON.stringify({ type: "move", move: message.move }));
          break;
        case "game_over":
          console.log("game over");
          break;
        default:
          break;
      }
    };

    socket.onmessage = handleMessage;

    // Cleanup function
    return () => {
      socket.onmessage = null;
    };
  }, [socket]);
  
  return (
    <div className="container m-auto flex flex-col items-center justify-center min-h-screen text-white">
      <Head>
        <title>Chess Game</title>
        <meta name="description" content="Play chess online" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-row flex-1 w-full p-4">
        <div className="flex-1 flex-grow-0 basis-3/5">
          <ChessBoard board={board}/>
        </div>
        <div className="flex-1 flex-grow-0 basis-2/5 flex flex-col items-center p-4">
          <h2 className="text-2xl mb-4">Settings & Utilities</h2>
          <button className="w-full px-4 py-2 mb-4 text-xl bg-blue-600 rounded hover:bg-blue-700" onClick={() => socket?.send(JSON.stringify({type:"init_game"})) }>
            New Game
          </button>
          <button className="w-full px-4 py-2 mb-4 text-xl bg-blue-600 rounded hover:bg-blue-700">
            Undo Move
          </button>
          <button className="w-full px-4 py-2 mb-4 text-xl bg-blue-600 rounded hover:bg-blue-700">
            Resign
          </button>
        </div>
      </main>
    </div>
  );
}
