'use client'

import { useState, useEffect } from 'react'
import TaskList from './TaskList'
import { Task } from '../types/Task'
import ReactConfetti from 'react-confetti'

const presetTasks = [
  "Read a book",
  "Write a blog post",
  "Exercise",
  "Meditate",
  "Study a new topic",
  "Practice coding",
  "Clean the house",
  "Plan the week ahead"
]

const ranks = [
  { name: "Time Novice", minPoints: 0 },
  { name: "Focus Apprentice", minPoints: 100 },
  { name: "Productivity Pro", minPoints: 500 },
  { name: "Efficiency Expert", minPoints: 1000 },
  { name: "Time Master", minPoints: 2500 },
  { name: "Pomodoro Virtuoso", minPoints: 5000 },
]

const saveToLocalStorage = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

const loadFromLocalStorage = (key: string, defaultValue: any) => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key)
    if (saved !== null) {
      return JSON.parse(saved)
    }
  }
  return defaultValue
}

const PomodoroTimer = () => {
  const [isClient, setIsClient] = useState(false)
  const [time, setTime] = useState(loadFromLocalStorage('time', 25 * 60))
  const [isActive, setIsActive] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(loadFromLocalStorage('sessionDuration', 25))
  const [tasks, setTasks] = useState<Task[]>(loadFromLocalStorage('tasks', []))
  const [isBreak, setIsBreak] = useState(loadFromLocalStorage('isBreak', false))
  const [breakDuration, setBreakDuration] = useState(loadFromLocalStorage('breakDuration', 5))
  
  const [totalSessions, setTotalSessions] = useState(loadFromLocalStorage('totalSessions', 4))
  const [completedSessions, setCompletedSessions] = useState(loadFromLocalStorage('completedSessions', 0))
  
  const [points, setPoints] = useState(loadFromLocalStorage('points', 0))
  const [level, setLevel] = useState(loadFromLocalStorage('level', 1))
  const [streak, setStreak] = useState(loadFromLocalStorage('streak', 0))
  const [rank, setRank] = useState(loadFromLocalStorage('rank', ranks[0].name))
  const [sessionHistory, setSessionHistory] = useState<{ date: string, duration: number }[]>(
    loadFromLocalStorage('sessionHistory', [])
  )
  const [showConfetti, setShowConfetti] = useState(false)

  const [activeTab, setActiveTab] = useState('timer')

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    setIsClient(true)
    requestNotificationPermission()
  }, [])

  useEffect(() => {
    if (!isClient) return;

    let interval: NodeJS.Timeout | null = null

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime: number) => prevTime - 1)
        setTasks((prevTasks: Task[]) =>
          prevTasks.map((task) =>
            task.isActive ? { ...task, elapsedTime: task.elapsedTime + 1 } : task
          )
        )
      }, 1000)
    } else if (time === 0) {
      setIsActive(false)
      if (isBreak) {
        endBreak()
      } else {
        endSession()
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, time, isBreak, sessionDuration, breakDuration, isClient])

  useEffect(() => { saveToLocalStorage('time', time) }, [time])
  useEffect(() => { saveToLocalStorage('sessionDuration', sessionDuration) }, [sessionDuration])
  useEffect(() => { saveToLocalStorage('tasks', tasks) }, [tasks])
  useEffect(() => { saveToLocalStorage('isBreak', isBreak) }, [isBreak])
  useEffect(() => { saveToLocalStorage('breakDuration', breakDuration) }, [breakDuration])
  useEffect(() => { saveToLocalStorage('totalSessions', totalSessions) }, [totalSessions])
  useEffect(() => { saveToLocalStorage('completedSessions', completedSessions) }, [completedSessions])
  useEffect(() => { saveToLocalStorage('points', points) }, [points])
  useEffect(() => { saveToLocalStorage('level', level) }, [level])
  useEffect(() => { saveToLocalStorage('streak', streak) }, [streak])
  useEffect(() => { saveToLocalStorage('rank', rank) }, [rank])
  useEffect(() => { saveToLocalStorage('sessionHistory', sessionHistory) }, [sessionHistory])

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
    }
  }

  const showNotification = (title: string, body: string) => {
    if (notificationPermission === 'granted') {
      new Notification(title, { body })
    }
  }

  const endBreak = () => {
    showNotification('Break ended', 'Time to start working!')
    setIsBreak(false)
    setTime(sessionDuration * 60)
    addPoints(10)
  }

  const endSession = () => {
    showNotification('Session ended', 'Time for a break!')
    setIsBreak(true)
    setTime(breakDuration * 60)
    addPoints(50)
    setStreak((prevStreak: number) => prevStreak + 1)
    setCompletedSessions((prev: number) => prev + 1)
    
    setSessionHistory((prevHistory: { date: string, duration: number }[]) => [
      ...prevHistory,
      { date: new Date().toISOString(), duration: sessionDuration }
    ])

    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 5000)
  }

  const addPoints = (amount: number) => {
    setPoints((prevPoints: number) => {
      const newPoints = prevPoints + amount
      if (newPoints >= level * 100) {
        setLevel((prevLevel: number) => prevLevel + 1)
        showNotification('Level Up!', `You've reached level ${level + 1}!`)
      }
      updateRank(newPoints)
      return newPoints
    })
  }

  const updateRank = (points: number) => {
    const newRank = ranks.reduce((acc, rank) => {
      if (points >= rank.minPoints) {
        return rank.name
      }
      return acc
    }, ranks[0].name)

    if (newRank !== rank) {
      setRank(newRank)
      showNotification('Rank Up!', `You've achieved the rank of ${newRank}!`)
    }
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setTime(sessionDuration * 60)
    setIsActive(false)
    setIsBreak(false)
    setCompletedSessions(0)
    setPoints(0)
    setLevel(1)
    setStreak(0)
    setRank(ranks[0].name)
    setTasks([])
    
    Object.keys(localStorage).forEach(key => {
      if (key !== 'sessionHistory') {
        localStorage.removeItem(key)
      }
    })
  }

  const handleSessionDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseInt(e.target.value, 10)
    setSessionDuration(newDuration)
    if (!isActive && !isBreak) {
      setTime(newDuration * 60)
    }
  }

  const handleBreakDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseInt(e.target.value, 10)
    setBreakDuration(newDuration)
  }

  const handleTotalSessionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTotalSessions = parseInt(e.target.value, 10)
    setTotalSessions(newTotalSessions)
  }

  const addTask = (taskName: string) => {
    setTasks([...tasks, { id: Date.now(), name: taskName, isCompleted: false, isActive: false, elapsedTime: 0 }])
  }

  const addPresetTask = (taskName: string) => {
    if (!tasks.some(task => task.name === taskName)) {
      addTask(taskName)
    }
  }

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        if (!task.isCompleted) {
          addPoints(25)
        }
        return { ...task, isCompleted: !task.isCompleted }
      }
      return task
    }))
  }

  const toggleTaskActive = (taskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId 
        ? { ...task, isActive: !task.isActive, elapsedTime: task.isActive ? task.elapsedTime : 0 } 
        : { ...task, isActive: false }
    ))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isClient) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <ReactConfetti width={window.innerWidth} height={window.innerHeight} />
        </div>
      )}
      <div className="flex-grow flex flex-col">
        {/* Navigation Tabs */}
        <div className="bg-white shadow-md">
          <div className="container mx-auto px-4">
            <nav className="grid grid-cols-4 text-center">
              {['timer', 'tasks', 'history', 'progress'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 transition-all duration-300 ease-in-out ${
                    activeTab === tab
                      ? 'flex-grow font-semibold border-b-2 border-blue-500'
                      : 'flex-shrink'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow container mx-auto px-4 py-8">
          {activeTab === 'timer' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h1 className="text-3xl font-bold text-center mb-8">
                {isBreak ? 'Break Time' : 'Pomodoro Timer'}
              </h1>
              <div className="text-8xl font-bold text-center mb-8 animate-pulse">
                {formatTime(time)}
              </div>
              <div className="text-center mb-6">
                Session {completedSessions + 1} of {totalSessions}
              </div>
              <div className="flex justify-center space-x-4 mb-8">
                <button
                  onClick={toggleTimer}
                  className={`px-6 py-3 rounded-lg text-lg ${
                    isActive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isActive ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={resetTimer}
                  className="px-6 py-3 rounded-lg text-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="sessionDuration" className="block mb-2">
                    Session Duration (minutes)
                  </label>
                  <input
                    id="sessionDuration"
                    type="number"
                    value={sessionDuration}
                    onChange={handleSessionDurationChange}
                    min={1}
                    max={60}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="breakDuration" className="block mb-2">
                    Break Duration (minutes)
                  </label>
                  <input
                    id="breakDuration"
                    type="number"
                    value={breakDuration}
                    onChange={handleBreakDurationChange}
                    min={1}
                    max={30}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="totalSessions" className="block mb-2">
                    Total Sessions
                  </label>
                  <input
                    id="totalSessions"
                    type="number"
                    value={totalSessions}
                    onChange={handleTotalSessionsChange}
                    min={1}
                    max={10}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
              <TaskList
                tasks={tasks}
                addTask={addTask}
                addPresetTask={addPresetTask}
                presetTasks={presetTasks}
                toggleTaskCompletion={toggleTaskCompletion}
                toggleTaskActive={toggleTaskActive}
                isBreak={isBreak}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold mb-4">Session History</h2>
              <ul className="space-y-4">
                {sessionHistory.slice().reverse().map((session, index) => (
                  <li key={index} className="p-4 bg-gray-50 rounded-lg shadow">
                    <p className="font-semibold">{new Date(session.date).toLocaleDateString()}</p>
                    <p>{new Date(session.date).toLocaleTimeString()}</p>
                    <p>{session.duration} minutes</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold mb-4">Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg shadow">
                  <p className="text-lg font-semibold">Points</p>
                  <p className="text-3xl font-bold">{points}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg shadow">
                  <p className="text-lg font-semibold">Level</p>
                  <p className="text-3xl font-bold">{level}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg shadow">
                  <p className="text-lg font-semibold">Streak</p>
                  <p className="text-3xl font-bold">{streak}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg shadow">
                  <p className="text-lg font-semibold">Rank</p>
                  <p className="text-3xl font-bold">{rank}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {notificationPermission === 'default' && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <p className="mb-2">Enable notifications for break and session alerts?</p>
          <button
            onClick={requestNotificationPermission}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Enable Notifications
          </button>
        </div>
      )}
    </div>
  )
}

export default PomodoroTimer