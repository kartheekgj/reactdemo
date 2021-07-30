import { render, fireEvent, screen, act } from '@testing-library/react';
import selectEvent from 'react-select-event'


import App from './App';

test('renders builderai app', () => {
  render(<App />);
  const dataPreLoad = screen.getByText(/Builder AI demo/);
  expect(dataPreLoad).toBeInTheDocument();
});

test('check the input box', () => {
  render(<App />);
  expect(screen.getByPlaceholderText(/Name of the repo/)).toBeInTheDocument();
  expect(screen.getByText(/Select Type of repo/)).toBeInTheDocument();
});

test('Changing input', async () => {
  render(<App />);
  fireEvent.change(screen.getByPlaceholderText('Name of the repo'), { target: { value: 'kartheekgj' } });
  //fireEvent.change(screen.getByTestId('selecttyperepo'), { target: { key: 'users', text: 'Users', value: 'users' } });
  await selectEvent.select(screen.getByTestId("selecttyperepo"), "Users");
  // Wait for page to update with query text
  fireEvent.click(screen.getByText('Search'));
  const items = await screen.findAllByText(/Repos of/)
  expect(items).toHaveLength(1);
});