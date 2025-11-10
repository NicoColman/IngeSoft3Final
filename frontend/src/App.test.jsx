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
    
    // This will BREAK if you change <h1>Items</h1> to anything else
    expect(screen.getByText('Items')).toBeInTheDocument()
  })

  it('should have an input with placeholder "Nuevo item"', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })
    
    render(<App />)
    
    await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument())
    
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
    
    await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument())
    
    // This will BREAK if you change button text from "Agregar"
    const button = screen.getByRole('button', { name: 'Agregar' })
    expect(button).toBeInTheDocument()
  })

  it('should allow typing in the input field', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })
    
    render(<App />)
    
    await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument())
    
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
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument()
    })
    
    const button = screen.getByRole('button', { name: 'Agregar' })
    
    // Wait for button to be enabled
    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
    
    // Click the button with empty input
    await userEvent.click(button)
    
    // This will BREAK if you remove validation for empty input
    await waitFor(() => {
      const errorMessage = screen.getByText(/nombre/i)
      expect(errorMessage).toBeInTheDocument()
    })
  })
})