import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App'

// Mock fetch
global.fetch = vi.fn()

describe('App Component - Simple Tests', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('should render the title "Items"', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })
    
    render(<App />)
    
    // Busca el texto "Items" incluso si está dentro del emoji
    expect(screen.getByText(/Items/i)).toBeInTheDocument()
  })

  it('should have an input with placeholder "Nuevo item"', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })
    
    render(<App />)
    
    // Espera a que termine de cargar
    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument()
    })
    
    // This will BREAK if you change the placeholder text
    const input = screen.getByPlaceholderText('Nuevo item')
    expect(input).toBeInTheDocument()
  })

  it('should have a button with text "Agregar"', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })
    
    render(<App />)
    
    // Espera a que termine de cargar
    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument()
    })
    
    // This will BREAK if you change button text from "Agregar"
    const button = screen.getByRole('button', { name: /Agregar/i })
    expect(button).toBeInTheDocument()
  })

  it('should allow typing in the input field', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })
    
    render(<App />)
    
    // Espera a que termine de cargar
    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument()
    })
    
    const input = screen.getByPlaceholderText('Nuevo item')
    await userEvent.type(input, 'Test Item')
    
    // This will BREAK if input doesn't work
    expect(input).toHaveValue('Test Item')
  })

  it('should show error for empty input', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })
    
    render(<App />)
    
    // Espera a que termine de cargar usando regex
    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Espera a que el botón esté habilitado
    const button = screen.getByRole('button', { name: /Agregar/i })
    await waitFor(() => {
      expect(button).not.toBeDisabled()
    }, { timeout: 3000 })
    
    // Clic en el botón con input vacío
    await userEvent.click(button)
    
    // Verifica que aparezca un mensaje de error
    await waitFor(() => {
      // Busca por el emoji de advertencia o cualquier texto con "nombre"
      const errorElement = screen.getByText(/nombre/i)
      expect(errorElement).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})