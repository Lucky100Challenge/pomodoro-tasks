import dynamic from 'next/dynamic'

const PomodoroTimer = dynamic(() => import('./components/PomodoroTimer'), { ssr: false })

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-8">
      <PomodoroTimer />
    </main>
  )
}
