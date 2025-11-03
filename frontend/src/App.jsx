import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/items')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setItems(data)
    } catch (e) {
      setError('No se pudo cargar la lista')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function addItem(e) {
    e.preventDefault()
    if (!name.trim()) return
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    if (res.ok) {
      setName('')
      await load()
    }
  }

  async function removeItem(id) {
    await fetch(`/api/items/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Items</h1>
      <form onSubmit={addItem} style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Nuevo item"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Agregar</button>
      </form>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {items.map(it => (
          <li key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{it.name}</span>
            <button onClick={() => removeItem(it.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
