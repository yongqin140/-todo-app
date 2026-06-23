import { useState, useEffect, useCallback } from 'react'
import './App.css'

const API = '/api/todos'

const PRIORITY_LABELS = { high: '高', medium: '中', low: '低' }
const SORT_OPTIONS = [
  { value: 'createdAt', label: '创建时间' },
  { value: 'title', label: '标题' },
  { value: 'priority', label: '优先级' },
]

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editPriority, setEditPriority] = useState('medium')

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams()
    if (search.trim()) params.append('q', search.trim())
    params.append('sort', sort)
    params.append('order', order)
    return params.toString()
  }, [search, sort, order])

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch(`${API}?${buildQuery()}`)
      if (!res.ok) throw new Error('加载失败')
      const data = await res.json()
      setTodos(data)
      setError('')
    } catch {
      setError('无法连接到服务器，请确保后端已启动')
    } finally {
      setLoading(false)
    }
  }, [buildQuery])

  useEffect(() => { fetchTodos() }, [fetchTodos])

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

  const startEdit = (todo) => {
    setEditingId(todo._id)
    setEditTitle(todo.title)
    setEditPriority(todo.priority)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditPriority('medium')
  }

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return
    try {
      const res = await fetch(`${API}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim(), priority: editPriority })
      })
      const updated = await res.json()
      setTodos(todos.map(t => t._id === updated._id ? updated : t))
      cancelEdit()
    } catch {
      setError('编辑失败')
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

  const clearSearch = () => {
    setSearch('')
  }

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

        <div className="toolbar">
          <div className="search-box">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索任务..."
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={clearSearch}>x</button>
            )}
          </div>
          <div className="sort-box">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              className="order-btn"
              onClick={() => setOrder(order === 'desc' ? 'asc' : 'desc')}
              title={order === 'desc' ? '降序' : '升序'}
            >
              {order === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

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
                {editingId === todo._id ? (
                  <div className="edit-row">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="edit-input"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(todo._id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                    />
                    <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="edit-priority">
                      <option value="high">高</option>
                      <option value="medium">中</option>
                      <option value="low">低</option>
                    </select>
                    <button className="edit-save-btn" onClick={() => saveEdit(todo._id)}>保存</button>
                    <button className="edit-cancel-btn" onClick={cancelEdit}>取消</button>
                  </div>
                ) : (
                  <>
                    <label className="todo-check">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo)}
                      />
                      <span className={`priority-badge ${todo.priority}`}>
                        {PRIORITY_LABELS[todo.priority]}
                      </span>
                      <span className="todo-title" title="双击编辑" onDoubleClick={() => startEdit(todo)}>
                        {todo.title}
                      </span>
                    </label>
                    <div className="todo-actions">
                      <button className="edit-trigger-btn" onClick={() => startEdit(todo)}>编辑</button>
                      <button className="delete-btn" onClick={() => deleteTodo(todo._id)}>删除</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
