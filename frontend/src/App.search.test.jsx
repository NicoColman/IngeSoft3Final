import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

// Mock fetch
global.fetch = vi.fn()

const mockItems = [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' },
    { id: 3, name: 'Cherry' }
]

describe('App Search and Sort', () => {
    beforeEach(() => {
        fetch.mockReset()
        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockItems
        })
    })

    it('should filter items based on search query', async () => {
        render(<App />)

        // Wait for items to load
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

        // Default is newest first (id descending: 3, 2, 1)
        // Cherry, Banana, Apple
        const itemsBefore = screen.getAllByRole('listitem')
        expect(itemsBefore[0]).toHaveTextContent('Cherry')
        expect(itemsBefore[1]).toHaveTextContent('Banana')
        expect(itemsBefore[2]).toHaveTextContent('Apple')

        // Change sort to A-Z
        const sortSelect = screen.getByRole('combobox')
        fireEvent.change(sortSelect, { target: { value: 'alphabetical' } })

        // Apple, Banana, Cherry
        const itemsAfter = screen.getAllByRole('listitem')
        expect(itemsAfter[0]).toHaveTextContent('Apple')
        expect(itemsAfter[1]).toHaveTextContent('Banana')
        expect(itemsAfter[2]).toHaveTextContent('Cherry')
    })
})
