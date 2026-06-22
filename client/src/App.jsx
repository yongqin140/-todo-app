import { useState, useEffect } from 'react'
import './App.css'

const API = '/api/todos'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTodos = async () => {
    try {
      const res = await fetch(API)
      if (!res.ok) throw new Error('加载失败')
      const data = await res.json()
      setTodos(data)
      setError('')
    } catch (err) {
      setError('无法连接到服务器，请确保后端已启动')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTodos() }, [])

  const addTodo = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), priority })
      })
      const newTodo = await res.json()
      setTodos([newTodo, ...todos])
      setTitle('')
      setPriority('medium')
    } catch {
      setError('添加失败')
    }
  }

  const toggleTodo = async (todo) => {
    try {
      const res = await fetch(`${API}/${todo._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      })
      const updated = await res.json()
      setTodos(todos.map(t => t._id === updated._id ? updated : t))
    } catch {
      setError('更新失败')
    }
  }

  const deleteTodo = async (id) => {
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' })
      setTodos(todos.filter(t => t._id !== id))
    } catch {
      setError('删除失败')
    }
  }

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const priorityLabels = { high: '高', medium: '中', low: '低' }

  if (loading) return <div className="page"><div className="loading">加载中...</div></div>

  return (
    <div className="page">
      <div className="app">
        <h1>我的任务</h1>
        <p className="subtitle">{todos.filter(t => !t.completed).length} 项未完成</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={addTodo} className="add-form">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入新任务..."
            className="add-input"
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="priority-select">
            <option value="high">高优先级</option>
            <option value="medium">中优先级</option>
            <option value="low">低优先级</option>
          </select>
          <button type="submit" className="add-btn">添加</button>
        </form>

        <div className="filters">
          {['all', 'active', 'completed'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '全部' : f === 'active' ? '未完成' : '已完成'}
            </button>
          ))}
        </div>

        {filteredTodos.length === 0 ? (
          <p className="empty">暂无任务</p>
        ) : (
          <ul className="todo-list">
            {filteredTodos.map(todo => (
              <li key={todo._id} className={`todo-item ${todo.completed ? 'done' : ''}`}>
                <label className="todo-check">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                  />
                  <span className={`priority-badge ${todo.priority}`}>
                    {priorityLabels[todo.priority]}
                  </span>
                  <span className="todo-title">{todo.title}</span>
                </label>
                <button className="delete-btn" onClick={() => deleteTodo(todo._id)}>删除</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
