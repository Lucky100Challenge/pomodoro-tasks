import React, { useState } from 'react'
import { Task } from '../types/Task'

interface TaskListProps {
  tasks: Task[]
  addTask: (taskName: string) => void
  addPresetTask: (taskName: string) => void
  presetTasks: string[]
  toggleTaskCompletion: (taskId: number) => void
  toggleTaskActive: (taskId: number) => void
  isBreak: boolean
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  addTask,
  addPresetTask,
  presetTasks,
  toggleTaskCompletion,
  toggleTaskActive,
  isBreak,
}) => {
  const [newTaskName, setNewTaskName] = useState('')

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskName.trim()) {
      addTask(newTaskName.trim())
      setNewTaskName('')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddTask} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Add a new task"
            className="flex-grow px-2 py-1 text-sm border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-md font-semibold mb-2">Your Tasks</h3>
        <ul className="space-y-2 max-h-40 overflow-y-auto">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`flex items-center justify-between p-1 rounded text-sm ${
                task.isCompleted ? 'bg-green-100' : 'bg-white'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => toggleTaskCompletion(task.id)}
                  className="mr-2"
                />
                <span className={`${task.isCompleted ? 'line-through' : ''} truncate max-w-[120px]`}>{task.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs">{formatTime(task.elapsedTime)}</span>
                <button
                  onClick={() => toggleTaskActive(task.id)}
                  className={`px-2 py-1 text-xs rounded ${
                    task.isActive ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                  disabled={isBreak}
                >
                  {task.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-md font-semibold mb-2">Preset Tasks</h3>
        <div className="grid grid-cols-1 gap-1">
          {presetTasks.map((task, index) => (
            <button
              key={index}
              onClick={() => addPresetTask(task)}
              className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 truncate"
            >
              {task}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TaskList