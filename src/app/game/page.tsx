'use client';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import ChessBoard from '@/components/ChessBoard';
import { useSocket } from '@/hooks/useSocket';
import { Chess } from 'chess.js';
import { Square, PieceSymbol, Color } from 'chess.js';
import { cookies } from 'next/headers';
import toast from 'react-hot-toast';
import { getServerSession } from 'next-auth';
import { options } from '../api/auth/[...nextauth]/options';
import { useMyContext } from '@/Context/MyContextProvider';
import { useSession } from 'next-auth/react';
import "next-auth";

//we have to check is any prevGame there in client side
interface ChessBoardProps {
  board: (
    {
      square: Square;
      type: PieceSymbol;
      color: Color;
    } | null)[][] | undefined
  }
  declare module "next-auth" {
    interface Session {
      user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
      }
    }
  }
export default function Game() {
  const socket: WebSocket | null | any | undefined = useSocket();
  const { data: session, status } = useSession();
  const [chessBoard , setChessBoard] = useState<Chess | null | any>(null);
  const [board, setBoard] = useState<ChessBoardProps[][] | null | any>(new Chess().board());
  const [isWhite, setIsWhite] = useState<boolean | null>(null);

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
          console.log(new Chess()?.board());
          console.log(message);
          toast.success('Successfully initialized!')
          if(message.payload.color === "white"){
            setIsWhite(true);
          } else{
            setIsWhite(false);
          }
          break;
        case "move":
          console.log("move");
          // Move in client side
          console.log("move has been on client side");
          chessBoard?.move(message.move);
          console.log(chessBoard);
          setBoard(chessBoard?.board());
          // Move in server side
          socket.send(JSON.stringify({ type: "move", move: message.move }));
          break;
        case "game_over":
          console.log("game over");
          break;
        case "state":
          setBoard(new Chess(message?.payload).board());
          setChessBoard(new Chess(message?.payload));
          case "reinit_game":
            console.log(message);
            toast.success('Successfully reinitialized!')

        default:
          break;
      }
    };

    socket.onmessage = handleMessage;

    // Cleanup function
    return () => {
      console.log("nulling the socket")
      socket.onmessage = null;
    };
  }, [socket]);
  console.log(chessBoard?.ascii());
  return (
    <div className="container m-auto flex flex-col items-center justify-center min-h-screen text-white">
      <Head>
        <title>Chess Game</title>
        <meta name="description" content="Play chess online" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-row flex-1 w-full p-4">
        <div className="flex-1 flex-grow-0 basis-3/5">
          <ChessBoard board={board} socket={socket} setBoard={setBoard} chessBoard={chessBoard} setChessBoard={setChessBoard} isWhite={isWhite}/>
        </div>
        <div className="flex-1 flex-grow-0 basis-2/5 flex flex-col items-center p-4">
          <h2 className="text-2xl mb-4">Settings & Utilities</h2>
          <button
      className="w-full px-4 py-2 mb-4 text-xl bg-blue-600 rounded hover:bg-blue-700"
      onClick={() => {
        if (session?.user?.id) {
          socket.send(JSON.stringify({ type: "init_game", payload: { id: session.user.id } }));
        } else {
          console.error("User ID is missing in session");
        }
      }}
    >
            New Game
          </button>
          <button className="w-full px-4 py-2 mb-4 text-xl bg-blue-600 rounded hover:bg-blue-700">
            Undo Move
          </button>
          <button className="w-full px-4 py-2 mb-4 text-xl bg-blue-600 rounded hover:bg-blue-700">
            Resign
          </button>
          <h1>You are playing as {isWhite ? "white" : "black"}</h1>
          <h1>Turn :- {chessBoard?.turn()}</h1>
          {/* <h1> you are : - {session}</h1> */}
        </div>
      </main>
    </div>
  );
}
