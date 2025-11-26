import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App'

// Mock fetch
global.fetch = vi.fn()
global.confirm = vi.fn()

const mockItems = [
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Cherry' }
]

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockReset()
    confirm.mockReset()

    // Default fetch behavior: return items
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

  describe('Simple Tests', () => {
    it('should render the title "Items"', async () => {
      render(<App />)
      expect(screen.getByRole('heading', { name: /Items/i })).toBeInTheDocument()
    })

    it('should have an input with placeholder "Nuevo item"', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument()
      })
      const input = screen.getByPlaceholderText('Nuevo item')
      expect(input).toBeInTheDocument()
    })

    it('should have a button with text "Agregar"', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument()
      })
      const button = screen.getByRole('button', { name: /Agregar/i })
      expect(button).toBeInTheDocument()
    })

    it('should allow typing in the input field', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument()
      })
      const input = screen.getByPlaceholderText('Nuevo item')
      await userEvent.type(input, 'Test Item')
      expect(input).toHaveValue('Test Item')
    })

    it('should show error for empty input', async () => {
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
  })

  describe('Search and Sort', () => {
    it('should filter items based on search query', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument()
      })
      const searchInput = screen.getByPlaceholderText('🔍 Buscar...')
      fireEvent.change(searchInput, { target: { value: 'Ban' } })
      expect(screen.getByText('Banana')).toBeInTheDocument()
      expect(screen.queryByText('Apple')).not.toBeInTheDocument()
      expect(screen.queryByText('Cherry')).not.toBeInTheDocument()
    })

    it('should sort items alphabetically', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument()
      })

      // Default is newest first (id descending: 3, 2, 1) -> Cherry, Banana, Apple
      let items = screen.getAllByRole('listitem')
      expect(items[0]).toHaveTextContent('Cherry')
      expect(items[1]).toHaveTextContent('Banana')
      expect(items[2]).toHaveTextContent('Apple')

      // Change sort to A-Z
      const sortSelect = screen.getByRole('combobox')
      fireEvent.change(sortSelect, { target: { value: 'alphabetical' } })

      // Apple, Banana, Cherry
      items = screen.getAllByRole('listitem')
      expect(items[0]).toHaveTextContent('Apple')
      expect(items[1]).toHaveTextContent('Banana')
      expect(items[2]).toHaveTextContent('Cherry')
    })
  })

  describe('Additional Features', () => {
    it('should display the correct item count', async () => {
      render(<App />)
      await waitFor(() => {
        // mockItems has 3 items
        expect(screen.getByText('3 items')).toBeInTheDocument()
      })
    })

    it('should prevent adding duplicate items', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument()
      })
      const input = screen.getByPlaceholderText('Nuevo item')
      const button = screen.getByText('Agregar')
      fireEvent.change(input, { target: { value: 'apple' } })
      fireEvent.click(button)
      expect(await screen.findByText('El item ya existe')).toBeInTheDocument()
      // fetch called once for initial load
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('should show character count', async () => {
      render(<App />)
      const input = screen.getByPlaceholderText('Nuevo item')
      fireEvent.change(input, { target: { value: 'Hello' } })
      expect(screen.getByText('5/100')).toBeInTheDocument()
    })
  })

  describe('Clear All', () => {
    it('should show "Eliminar todo" button when items exist', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.getByText('Eliminar todo')).toBeInTheDocument()
      })
    })

    it('should clear all items when confirmed', async () => {
      confirm.mockReturnValue(true)

      // Override fetch for this specific test sequence
      fetch.mockImplementationOnce((url, options) => {
        // Initial load
        return Promise.resolve({
          ok: true,
          json: async () => mockItems
        })
      })
        .mockImplementationOnce((url, options) => {
          // DELETE request
          if (url === '/api/items' && options.method === 'DELETE') {
            return Promise.resolve({ ok: true })
          }
          return Promise.reject('Unknown request')
        })
        .mockImplementationOnce((url, options) => {
          // Reload after delete
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

    it('should not clear items if cancelled', async () => {
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