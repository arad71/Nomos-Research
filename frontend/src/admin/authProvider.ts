import decodeJwt, { JwtPayload } from 'jwt-decode';
import { AUTH_PROVIDER, BASE_URL } from '../config';
import Role from './role';

type loginFormType = {
  username: string;
  password: string;
};
type Action =
  | 'read' // for a field in the resource
  | 'list'
  | 'show'
  | 'export'
  | 'create'
  | 'edit'
  | 'clone'
  | 'write' // for a field in the resource
  | 'delete'
  | 'bulkdelete'
  | 'harddelete'
  | '*';
type Actions = Action[] | Action;

interface Permission {
  action: Actions;
  resource: string;
  type?: 'deny' | 'allow';
}
interface Permissions {
  [key: string]: Permission[];
}

function clearLocalStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('scopes');
  localStorage.removeItem('username');
  localStorage.removeItem('logout_url');
}
function useAuth2() {
  return AUTH_PROVIDER === 'auth2';
}

function getAuthToken(params: RequestInit = { method: 'POST' }) {
  const url = useAuth2() ? 'api/auth2token' : 'api/token';
  const request = new Request(`${BASE_URL}/${url}`, params);
  return fetch(request)
    .then((response) => {
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(({ access_token: accessToken }) => {
      const { logout_url, scopes }: any = decodeJwt(accessToken);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('scopes', scopes);
      if (logout_url) {
        localStorage.setItem('logout_url', logout_url);
      }
    });
}

const authProvider = {
  login: ({ username, password }: loginFormType) => {
    const params: RequestInit = { method: 'POST' };
    if (!useAuth2()) {
      const formData = new FormData();
      localStorage.setItem('username', username);
      formData.append('username', username);
      formData.append('password', password);
      params.body = formData;
    }
    return getAuthToken(params);
  },
  logout: () => {
    const logoutUrl = localStorage.getItem('logout_url');
    clearLocalStorage();
    if (logoutUrl) {
      window.location.href = logoutUrl;
    }
    return Promise.resolve();
  },
  getIdentity: () => {
    return localStorage.getItem('username');
  },
  checkError: (error: { status: number }) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      clearLocalStorage();
      return Promise.reject();
    }
    return Promise.resolve();
  },
  checkAuth: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (useAuth2()) {
        return getAuthToken();
      }
      return Promise.reject();
    }
    const decoded: JwtPayload = decodeJwt(token);
    if (decoded && decoded.exp && decoded.exp > Date.now() / 1000) {
      return Promise.resolve();
    }
    return Promise.reject();
  },
  getPermissions: () =>
    // See https://marmelab.com/ra-enterprise/modules/ra-rbac#resource
    Promise.resolve({
      roles: localStorage.scopes,
    }),
  getRoles: () => {
    // see https://marmelab.com/ra-enterprise/modules/ra-rbac#resource

    const permissions: Permissions = {};
    permissions[Role.READER] = [
      { action: ['show', 'list', 'export'], resource: '*' },
    ];

    permissions[Role.OFFICER] = [
      { action: ['show', 'list', 'export'], resource: '*' },
      { action: 'delete', resource: '*', type: 'deny' },
      { action: ['create', 'edit'], resource: 'authors' },
      { action: ['create', 'edit'], resource: 'citations' },
      { action: ['create', 'edit'], resource: 'cross_references' },
      { action: ['create', 'edit'], resource: 'publications' },
      { action: ['create', 'edit'], resource: 'publication_authors' },
      { action: ['create', 'edit'], resource: 'taxon_names' },
      { action: ['create', 'edit'], resource: 'vernaculars' },
    ];
    permissions[Role.MANAGER] = [
      { action: ['show', 'list', 'export'], resource: '*' },
      { action: ['create', 'edit', 'delete'], resource: 'authors' },
      { action: ['create', 'edit', 'delete'], resource: 'citations' },
      { action: ['create', 'edit', 'delete'], resource: 'cross_references' },
      {
        action: ['create', 'edit', 'delete'],
        resource: 'hierarchies',
      },
      {
        action: ['create', 'edit', 'delete'],
        resource: 'informal_groups',
      },
      {
        action: ['create', 'edit', 'delete'],
        resource: 'publications',
      },
      {
        action: ['create', 'edit'],
        resource: 'publication_authors',
      },
      {
        action: ['create', 'edit', 'delete'],
        resource: 'taxon_names',
      },
      {
        action: ['create', 'edit'],
        resource: 'vernaculars',
      },
    ];

    permissions[Role.APPLICATION_SUPPORT] = [
      { action: ['show', 'list', 'export'], resource: '*' },
      { action: '*', resource: 'users' },
      { action: '*', resource: 'user_roles' },
      { action: '*', resource: 'kingdoms' },
      { action: '*', resource: 'taxon_ranks' },
      { action: '*', resource: 'classification_systems' },
    ];
    permissions[Role.SUPER_ADMIN] = [
      {
        action: [
          'show',
          'list',
          'export',
          'create',
          'edit',
          'delete',
          'harddelete',
        ],
        resource: '*',
      },
    ];
    return Promise.resolve(permissions);
  },
};

export default authProvider;
