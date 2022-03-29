import decodeJwt from 'jwt-decode';
import { BASE_URL } from '../config';

type loginFormType = {
  username: string;
  password: string;
};

const authProvider = {
  login: ({ username, password }: loginFormType) => {
    const formData = new FormData();
    localStorage.setItem('username', username);
    formData.append('username', username);
    formData.append('password', password);
    const request = new Request(`${BASE_URL}/api/token`, {
      method: 'POST',
      body: formData,
    });
    return fetch(request)
      .then((response) => {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(({ access_token: accessToken }) => {
        const decodedToken: any = decodeJwt(accessToken);
        localStorage.setItem('token', accessToken);
        localStorage.setItem('scopes', decodedToken.scopes);
      });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('scopes');
    localStorage.removeItem('username');
    return Promise.resolve();
  },
  getIdentity: () => {
    return localStorage.getItem('username');
  },
  checkError: (error: { status: number }) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      return Promise.reject();
    }
    return Promise.resolve();
  },
  checkAuth: () =>
    localStorage.getItem('token') ? Promise.resolve() : Promise.reject(),
  getPermissions: () => {
    const role = localStorage.getItem('scopes');
    return role ? Promise.resolve(role) : Promise.reject();
  },
};

export default authProvider;
