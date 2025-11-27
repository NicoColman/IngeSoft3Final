import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App'

// Mock fetch
global.fetch = vi.fn()
global.confirm = vi.fn()

const mockItems = [
  { id: 1, name: 'Manzana' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Naranja' }
]

describe('Componente App', () => {
  beforeEach(() => {
    fetch.mockReset()
    confirm.mockReset()

    fetch.mockImplementation((url, options) => {
      if (url === '/api/items' && (!options || options.method === 'GET')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockItems
        })
      }
      return Promise.resolve({ ok: true })
    })
  })

  describe('Renderizado Inicial y Estructura', () => {
    it('debería renderizar el título "Items"', async () => {
      render(<App />)
      expect(screen.getByRole('heading', { name: /Items/i })).toBeInTheDocument()
    })

    it('debería tener los controles de entrada (input y botón)', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument()
      })
      expect(screen.getByPlaceholderText('Nuevo item')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Agregar/i })).toBeInTheDocument()
    })

    it('debería mostrar el conteo correcto de items al cargar', async () => {
      render(<App />)
      await waitFor(() => {
        // mockItems tiene 3 items
        expect(screen.getByText('3 items')).toBeInTheDocument()
      })
    })

    it('debería mostrar el botón "Eliminar todo" cuando existen items', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.getByText('Eliminar todo')).toBeInTheDocument()
      })
    })
  })

  describe('Interacción del Formulario y Validaciones', () => {
    it('debería permitir escribir y actualizar el conteo de caracteres', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument()
      })
      const input = screen.getByPlaceholderText('Nuevo item')
      
      // Escribimos "Hola" (4 caracteres)
      await userEvent.type(input, 'Hola')
      
      expect(input).toHaveValue('Hola')
      expect(screen.getByText('4/100')).toBeInTheDocument()
    })

    it('debería mostrar un error al intentar agregar un input vacío', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument()
      })
      const button = screen.getByRole('button', { name: /Agregar/i })
      
      await userEvent.click(button)
      
      await waitFor(() => {
        const errorElement = screen.getByText(/nombre/i)
        expect(errorElement).toBeInTheDocument()
      })
    })

    it('debería prevenir agregar items duplicados', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.getByText('Manzana')).toBeInTheDocument()
      })
      const input = screen.getByPlaceholderText('Nuevo item')
      const button = screen.getByText('Agregar')
      
      // Intentamos agregar 'manzana' que ya existe
      fireEvent.change(input, { target: { value: 'manzana' } })
      fireEvent.click(button)
      
      expect(await screen.findByText('El item ya existe')).toBeInTheDocument()
      // Verificamos que no se hizo una nueva llamada a la API
      expect(fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('Filtrado y Ordenamiento de Listas', () => {
    it('debería filtrar items basado en la consulta de búsqueda', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.getByText('Manzana')).toBeInTheDocument()
      })
      const searchInput = screen.getByPlaceholderText('Buscar...')
      
      fireEvent.change(searchInput, { target: { value: 'Ban' } })
      
      expect(screen.getByText('Banana')).toBeInTheDocument()
      expect(screen.queryByText('Manzana')).not.toBeInTheDocument()
      expect(screen.queryByText('Naranja')).not.toBeInTheDocument()
    })

    it('debería ordenar los items alfabéticamente correctamente', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.getByText('Manzana')).toBeInTheDocument()
      })

      let items = screen.getAllByRole('listitem')
      expect(items[0]).toHaveTextContent('Naranja')
      expect(items[1]).toHaveTextContent('Banana')
      expect(items[2]).toHaveTextContent('Manzana')

      // Cambiar orden a A-Z
      const sortSelect = screen.getByRole('combobox')
      fireEvent.change(sortSelect, { target: { value: 'alphabetical' } })

      // Orden alfabético: Banana, Manzana, Naranja
      items = screen.getAllByRole('listitem')
      expect(items[0]).toHaveTextContent('Banana')
      expect(items[1]).toHaveTextContent('Manzana')
      expect(items[2]).toHaveTextContent('Naranja')
    })
  })

  describe('Eliminación', () => {
    it('debería borrar todos los items cuando se confirma', async () => {
      confirm.mockReturnValue(true)

      fetch.mockImplementationOnce((url, options) => {
        return Promise.resolve({
          ok: true,
          json: async () => mockItems
        })
      })
        .mockImplementationOnce((url, options) => {
          if (url === '/api/items' && options.method === 'DELETE') {
            return Promise.resolve({ ok: true })
          }
          return Promise.reject('Unknown request')
        })
        .mockImplementationOnce((url, options) => {
          return Promise.resolve({
            ok: true,
            json: async () => []
          })
        })

      render(<App />)
      await waitFor(() => {
        expect(screen.getByText('Eliminar todo')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Eliminar todo'))
      expect(confirm).toHaveBeenCalled()
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/items', { method: 'DELETE' })
      })
    })

    it('no debería borrar items si se cancela la confirmación', async () => {
      confirm.mockReturnValue(false)
      render(<App />)
      await waitFor(() => {
        expect(screen.getByText('Eliminar todo')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('Eliminar todo'))
      
      expect(confirm).toHaveBeenCalled()
      expect(fetch).not.toHaveBeenCalledWith('/api/items', { method: 'DELETE' })
    })
  })
})