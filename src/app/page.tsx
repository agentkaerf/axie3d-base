'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="w-screen h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-green-600">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
          Axie Adventure
        </h1>
        <p className="text-xl text-white/80 mb-8">
          Explore a world of wonder with your Axie companion
        </p>
        <button
          onClick={() => router.push('/game')}
          className="px-10 py-4 bg-yellow-400 text-black font-bold rounded-xl text-2xl hover:bg-yellow-300 transition shadow-lg"
        >
          Play Now
        </button>
      </div>
    </main>
  )
}
