import { render, screen } from '@testing-library/react';
import App from './App';

test('renders builderai app', () => {
  render(<App />);
  const dataPreLoad = screen.getByText(/fetching the data.../i);
  expect(dataPreLoad).toBeInTheDocument();
});
