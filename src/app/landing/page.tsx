import React from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { redirect } from 'next/navigation'
import Link from 'next/link';
export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Chess Game</title>
        <meta name="description" content="Play chess online" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <a className="text-blue-600" href="#">
            Chess Game
          </a>
        </h1>

        <div className="mt-6">
          <Image
            src="/chess.webp"
            alt="Chess"
            width={500}
            height={500}
            className="rounded-lg"
          />
        </div>

        <button className="px-8 py-3 mt-6 text-2xl text-white bg-blue-600 rounded hover:bg-blue-700">
            <Link href="/game">
              Play
            </Link>
        </button>
      </main>
    </div>
  );
}
