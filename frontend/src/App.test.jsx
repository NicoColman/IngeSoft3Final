import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

test('renders and allows adding item (UI only)', async () => {
  render(<App />)
  expect(screen.getByText('Items')).toBeInTheDocument()
  // Input exists
  const input = screen.getByPlaceholderText('Nuevo item')
  await userEvent.type(input, 'Demo')
  expect(input).toHaveValue('Demo')
})


