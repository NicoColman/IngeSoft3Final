import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

// Mock fetch
global.fetch = vi.fn()
global.confirm = vi.fn()

const mockItems = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
]

describe('App Clear All', () => {
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

    it('should show "Eliminar todo" button when items exist', async () => {
        render(<App />)
        await waitFor(() => {
            expect(screen.getByText('Eliminar todo')).toBeInTheDocument()
        })
    })

    it('should clear all items when confirmed', async () => {
        confirm.mockReturnValue(true)

        // Mock fetch to return empty list after delete
        fetch.mockImplementationOnce((url, options) => {
            if (url === '/api/items' && (!options || options.method === 'GET')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockItems
                })
            }
            return Promise.resolve({ ok: true })
        })
            .mockImplementationOnce((url, options) => {
                // DELETE request
                if (url === '/api/items' && options.method === 'DELETE') {
                    return Promise.resolve({ ok: true })
                }
                return Promise.reject('Unknown request')
            })
            .mockImplementationOnce((url, options) => {
                // GET request after delete (reload)
                if (url === '/api/items' && (!options || options.method === 'GET')) {
                    return Promise.resolve({
                        ok: true,
                        json: async () => []
                    })
                }
                return Promise.reject('Unknown request')
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
