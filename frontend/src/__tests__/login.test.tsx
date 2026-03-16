import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../views';

it('Login renders correctly', () => {
  const login = render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
  expect(login.getByText('Email')).toBeInTheDocument();
  expect(login.getByText('Password')).toBeInTheDocument();
  expect(login.getByText('Login')).toBeInTheDocument();
});
