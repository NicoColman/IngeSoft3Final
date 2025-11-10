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
      setItems([]) // Reset to empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function addItem(e) {
    e.preventDefault()
    
    // Validate input
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
    
    setError('') // Clear previous errors
    
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
    // Validate id exists and is valid
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      setError('ID inválido')
      return
    }
    
    // Check if item exists in list
    const itemExists = items.find(item => item.id === id)
    if (!itemExists) {
      setError('El item no existe')
      return
    }
    
    setError('') // Clear previous errors
    
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
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.2)'
      }}>
        <h1 style={{
          margin: 0,
          color: 'white',
          fontSize: '32px',
          fontWeight: '700',
          letterSpacing: '-0.5px'
        }}>✨ Items</h1>
      </div>

      <form onSubmit={addItem} style={{ 
        display: 'flex', 
        gap: 12,
        marginBottom: '24px'
      }}>
        <input
          placeholder="Nuevo item"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ 
            flex: 1, 
            padding: '14px 16px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '15px',
            outline: 'none',
            transition: 'all 0.2s',
            backgroundColor: 'white'
          }}
          maxLength={100}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
        />
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

      {loading && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f7fafc',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#718096',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '20px' }}>⏳</span> Cargando...
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
          ⚠️ {error}
        </div>
      )}
      
      {!loading && items.length === 0 && !error && (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: '#f7fafc',
          borderRadius: '12px',
          color: '#718096'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
          <p style={{ margin: 0, fontSize: '16px' }}>No hay items todavía</p>
        </div>
      )}
      
      <ul style={{ 
        listStyle: 'none', 
        padding: 0,
        margin: 0
      }}>
        {items.map(it => (
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
    </div>
  )
}

export default App