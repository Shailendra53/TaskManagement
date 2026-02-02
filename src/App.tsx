import { useState, useEffect } from 'react';
import type { Task, Category } from './types';
import { db } from './db';
import VoiceInput from './components/VoiceInput';
import TaskItem from './components/TaskItem';
import CategoryManager, { PRESET_COLORS } from './components/CategoryManager';
import LockScreen from './components/LockScreen';
import Settings from './components/Settings';
import { needsUnlock, clearSession, setupAutoLock } from './auth';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [isLocked, setIsLocked] = useState(needsUnlock());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!isLocked) {
      initializeApp();
    }
  }, [isLocked]);

  // Setup auto-lock on tab close/hide
  useEffect(() => {
    const cleanup = setupAutoLock(() => {
      setIsLocked(true);
    });
    return cleanup;
  }, []);

  const initializeApp = async () => {
    try {
      await db.init();
      
      const loadedCategories = await db.getAllCategories();
      if (loadedCategories.length === 0) {
        const defaultCategories: Category[] = [
          { id: 'work', name: 'Work', color: PRESET_COLORS[0] },
          { id: 'personal', name: 'Personal', color: PRESET_COLORS[1] },
          { id: 'ideas', name: 'Ideas', color: PRESET_COLORS[2] },
        ];
        for (const cat of defaultCategories) {
          await db.addCategory(cat);
        }
        setCategories(defaultCategories);
      } else {
        setCategories(loadedCategories);
      }

      const loadedTasks = await db.getAllTasks();
      setTasks(loadedTasks);

      const archived = await db.getArchivedTasks();
      setArchivedTasks(archived);

      // Clean up old archived tasks (older than 30 days)
      await cleanupOldArchives();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      alert('Failed to initialize the app. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupOldArchives = async () => {
    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const archived = await db.getArchivedTasks();
      
      for (const task of archived) {
        if (task.completedAt && task.completedAt < thirtyDaysAgo) {
          await db.deleteArchivedTask(task.id);
        }
      }
      
      // Reload after cleanup
      const updatedArchived = await db.getArchivedTasks();
      setArchivedTasks(updatedArchived);
    } catch (error) {
      console.error('Failed to cleanup old archives:', error);
    }
  };

  const addTask = async (title: string, categoryId?: string) => {
    if (!title.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      category: categoryId || categories[0]?.id || 'uncategorized',
      createdAt: Date.now(),
      isCompleted: false,
    };

    try {
      await db.addTask(newTask);
      setTasks([newTask, ...tasks]);
      setTextInput('');
    } catch (error) {
      console.error('Failed to add task:', error);
      alert('Failed to add task');
    }
  };

  const completeTask = async (task: Task) => {
    const completedTask = { ...task, isCompleted: true, completedAt: Date.now() };
    
    try {
      await db.archiveTask(completedTask);
      setTasks(tasks.filter(t => t.id !== task.id));
      setArchivedTasks([completedTask, ...archivedTasks]);
    } catch (error) {
      console.error('Failed to complete task:', error);
      alert('Failed to complete task');
    }
  };

  const undoComplete = async (task: Task) => {
    const restoredTask = { ...task, isCompleted: false, completedAt: undefined };
    
    try {
      // Remove from archived
      await db.deleteArchivedTask(task.id);
      // Add back to active tasks
      await db.addTask(restoredTask);
      setArchivedTasks(archivedTasks.filter(t => t.id !== task.id));
      setTasks([restoredTask, ...tasks]);
    } catch (error) {
      console.error('Failed to undo task:', error);
      alert('Failed to undo task');
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Delete this task permanently?')) return;

    try {
      await db.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  const addCategory = async (name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color: PRESET_COLORS[categories.length % PRESET_COLORS.length],
    };

    try {
      await db.addCategory(newCategory);
      setCategories([...categories, newCategory]);
    } catch (error) {
      console.error('Failed to add category:', error);
      alert('Failed to add category');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await db.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      if (selectedCategory === id) {
        setSelectedCategory('all');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setTextInput(transcript);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask(textInput, selectedCategory === 'all' ? undefined : selectedCategory);
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  const handleLock = () => {
    clearSession();
    setIsLocked(true);
  };

  const handleImport = async (data: { tasks: Task[]; categories: Category[]; archivedTasks: Task[] }) => {
    try {
      // Clear existing data
      for (const task of tasks) {
        await db.deleteTask(task.id);
      }
      for (const cat of categories) {
        await db.deleteCategory(cat.id);
      }

      // Import new data
      for (const cat of data.categories) {
        await db.addCategory(cat);
      }
      for (const task of data.tasks) {
        await db.addTask(task);
      }
      for (const task of data.archivedTasks) {
        await db.archiveTask(task);
      }

      // Reload data
      setCategories(data.categories);
      setTasks(data.tasks);
      setArchivedTasks(data.archivedTasks);
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data');
    }
  };

  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === selectedCategory);

  if (isLocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header with Settings Button */}
          <div className="text-center mb-8 relative">
            <button
              onClick={() => setShowSettings(true)}
              className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-800 text-2xl"
              title="Settings"
            >
              ⚙️
            </button>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 Task Manager</h1>
            <p className="text-gray-600">Capture your thoughts instantly with voice or text</p>
          </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <span>Add to Category:</span>
                <span className="text-xs text-gray-500">(Select categories below to change)</span>
                <span className="ml-2 px-2 py-1 rounded text-white" 
                      style={{ backgroundColor: selectedCategory === 'all' 
                        ? '#6B7280' 
                        : categories.find(c => c.id === selectedCategory)?.color }}>
                  {selectedCategory === 'all' 
                    ? categories[0]?.name || 'Uncategorized'
                    : categories.find(c => c.id === selectedCategory)?.name}
                </span>
              </label>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your task or use voice input..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <VoiceInput onTranscript={handleVoiceTranscript} />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                ➕ Add Task
              </button>
            </div>
          </form>
        </div>

        <CategoryManager
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
        />

        <div className="my-4 flex justify-center">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            {showArchived ? '📋 Show Active Tasks' : '📦 Show Archived Tasks'}
          </button>
        </div>

        <div className="space-y-3 mt-6">
          {showArchived ? (
            <>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Archived Tasks ({archivedTasks.length})
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ℹ️ <strong>Note:</strong> Archived tasks are automatically deleted after 30 days. You can undo completion within 1 minute.
                </p>
              </div>
              {archivedTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No archived tasks yet</p>
                </div>
              ) : (
                archivedTasks.map(task => {
                  const completedTime = task.completedAt || 0;
                  const oneMinuteAgo = Date.now() - (1 * 60 * 1000);
                  const canUndo = completedTime > oneMinuteAgo;
                  
                  return (
                    <div key={task.id} className="bg-gray-100 border border-gray-300 rounded-lg p-4 opacity-75">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-600 line-through">{task.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                              {task.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              Completed {new Date(task.completedAt!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canUndo && (
                            <button
                              onClick={() => undoComplete(task)}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
                              title="Undo completion (available for 1 minute)"
                            >
                              ↩️ Undo
                            </button>
                          )}
                          <span className="text-green-600 text-xl">✓</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                {selectedCategory === 'all' 
                  ? `All Tasks (${filteredTasks.length})` 
                  : `${categories.find(c => c.id === selectedCategory)?.name} (${filteredTasks.length})`}
              </h2>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No tasks yet</p>
                  <p className="text-sm mt-2">Add your first task using voice or text input above</p>
                </div>
              ) : (
                filteredTasks
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onComplete={completeTask}
                      onDelete={deleteTask}
                    />
                  ))
              )}
            </>
          )}
        </div>
      </div>
    </div>

    {showSettings && (
      <Settings
        onClose={() => setShowSettings(false)}
        tasks={tasks}
        categories={categories}
        archivedTasks={archivedTasks}
        onImport={handleImport}
      />
    )}
    </>
  );
}

export default App;
