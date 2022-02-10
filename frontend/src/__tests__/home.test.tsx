import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Home } from '../views';

it('Home renders correctly', () => {
  const home = render(<Home />);
  expect(home.getByText('Admin Dashboard')).toBeInTheDocument();
  expect(home.getByText('Login')).toBeInTheDocument();
});
