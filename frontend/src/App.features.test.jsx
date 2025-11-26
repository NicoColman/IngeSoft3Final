import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

// Mock fetch
global.fetch = vi.fn()

const mockItems = [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' }
]

describe('App Additional Features', () => {
    beforeEach(() => {
        fetch.mockReset()
        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockItems
        })
    })

    it('should display the correct item count', async () => {
        render(<App />)

        await waitFor(() => {
            expect(screen.getByText('2 items')).toBeInTheDocument()
        })
    })

    it('should prevent adding duplicate items', async () => {
        render(<App />)

        await waitFor(() => {
            expect(screen.getByText('Apple')).toBeInTheDocument()
        })

        const input = screen.getByPlaceholderText('Nuevo item')
        const button = screen.getByText('Agregar')

        // Try to add 'Apple' again (case insensitive)
        fireEvent.change(input, { target: { value: 'apple' } })
        fireEvent.click(button)

        expect(await screen.findByText('El item ya existe')).toBeInTheDocument()
        expect(fetch).toHaveBeenCalledTimes(1) // Only initial load, no POST request
    })

    it('should show character count', async () => {
        render(<App />)

        const input = screen.getByPlaceholderText('Nuevo item')
        fireEvent.change(input, { target: { value: 'Hello' } })

        expect(screen.getByText('5/100')).toBeInTheDocument()
    })
})
