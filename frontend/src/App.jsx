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

      // Validate that data is an array
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format')
      }

      setItems(data)
    } catch (e) {
      setError('No se pudo cargar la lista')
      setItems([]) 
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => { load() }, [])


  async function addItem(e) {
    e.preventDefault()

    if (!name || typeof name !== 'string') {
      setError('Nombre inválido')
      return
    }

    if (!name.trim()) {
      setError('El nombre no puede estar vacío')
      return
    }

    if (name.trim().length > 100) {
      setError('El nombre es demasiado largo (máximo 100 caracteres)')
      return
    }

    // Check for duplicates
    if (items.some(item => item.name.toLowerCase() === name.trim().toLowerCase())) {
      setError('El item ya existe')
      return
    }

    setError('')

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })

      if (!res.ok) {
        throw new Error('Failed to add item')
      }

      setName('')
      await load()
    } catch (e) {
      setError('No se pudo agregar el item')
    }
  }


  async function removeItem(id) {
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      setError('ID inválido')
      return
    }

    const itemExists = items.find(item => item.id === id)
    if (!itemExists) {
      setError('El item no existe')
      return
    }

    setError('')

    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })

      if (!res.ok) {
        throw new Error('Failed to delete item')
      }

      await load()
    } catch (e) {
      setError('No se pudo eliminar el item')
    }
  }

  async function clearAll() {
    if (!confirm('¿Estás seguro de que quieres eliminar todos los items?')) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/items', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to clear items')
      await load()
    } catch (e) {
      setError('No se pudo vaciar la lista')
      setLoading(false)
    }
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')

  const filteredItems = items
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'newest') return b.id - a.id
      return a.name.localeCompare(b.name)
    })

  return (
    <div style={{
      maxWidth: 520,
      margin: '40px auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '0 20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '32px',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          margin: 0,
          color: 'white',
          fontSize: '32px',
          fontWeight: '700',
          letterSpacing: '-0.5px'
        }}>Items</h1>
        <span style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {filteredItems.length} items
        </span>
      </div>

      <form onSubmit={addItem} style={{
        display: 'flex',
        gap: 12,
        marginBottom: '8px' // Reduced margin to fit counter
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            placeholder="Nuevo item"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '15px',
              outline: 'none',
              transition: 'all 0.2s',
              backgroundColor: 'white',
              color: '#2d3748',
              boxSizing: 'border-box'
            }}
            maxLength={100}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
          <span style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '12px',
            color: '#a0aec0',
            pointerEvents: 'none'
          }}>
            {name.length}/100
          </span>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px 24px',
            backgroundColor: loading ? '#cbd5e0' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.target.style.backgroundColor = '#5568d3'
          }}
          onMouseLeave={(e) => {
            if (!loading) e.target.style.backgroundColor = '#667eea'
          }}
        >
          Agregar
        </button>
      </form>
      <div style={{ marginBottom: '24px' }}></div>

      {/* Search and Sort Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: '24px' }}>
        <input
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{
            padding: '10px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'black',
            cursor: 'pointer'
          }}
        >
          <option value="newest">Más recientes</option>
          <option value="alphabetical">A-Z</option>
        </select>
      </div>

      {loading && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f7fafc',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#718096',
          marginBottom: '16px'
        }}>
          Cargando...
        </div>
      )}


      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fed7d7',
          color: '#c53030',
          borderRadius: '12px',
          marginBottom: '16px',
          border: '1px solid #fc8181',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      {!loading && filteredItems.length === 0 && !error && (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: '#f7fafc',
          borderRadius: '12px',
          color: '#718096'
        }}>
          <p style={{ margin: 0, fontSize: '16px' }}>
            {items.length === 0 ? 'No hay items todavía' : 'No se encontraron resultados'}
          </p>
        </div>
      )}

      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0
      }}>
        {filteredItems.map(it => (
          <li
            key={it.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              marginBottom: '12px',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <span style={{
              fontSize: '15px',
              color: '#2d3748',
              fontWeight: '500'
            }}>
              {it.name}
            </span>
            <button
              onClick={() => removeItem(it.id)}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: loading ? '#e2e8f0' : '#fff',
                color: loading ? '#a0aec0' : '#e53e3e',
                border: loading ? '1px solid #cbd5e0' : '1px solid #fc8181',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#e53e3e'
                  e.target.style.color = 'white'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#fff'
                  e.target.style.color = '#e53e3e'
                }
              }}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={clearAll}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#e53e3e',
              border: '1px solid #e53e3e',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#e53e3e'
                e.target.style.color = 'white'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = '#e53e3e'
              }
            }}
          >
            Eliminar todo
          </button>
        </div>
      )}
    </div>
  )
}


export default App