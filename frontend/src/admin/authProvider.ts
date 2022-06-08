import decodeJwt from 'jwt-decode';
import { BASE_URL } from '../config';
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
}

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
    clearLocalStorage();
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
  checkAuth: () =>
    localStorage.getItem('token') ? Promise.resolve() : Promise.reject(),
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
      { action: ['create', 'edit', 'clone'], resource: 'authors' },
      { action: ['create', 'edit', 'clone'], resource: 'citations' },
      { action: ['create', 'edit', 'clone'], resource: 'hierarchies' },
      { action: ['create', 'edit', 'clone'], resource: 'informal_groups' },
      { action: ['create', 'edit', 'clone'], resource: 'publications' },
      { action: ['create', 'edit', 'clone'], resource: 'publication_authors' },
      { action: ['create', 'edit', 'clone'], resource: 'taxon_names' },
      { action: ['create', 'edit', 'clone'], resource: 'vernaculars' },
    ];
    permissions[Role.MANAGER] = [
      { action: ['show', 'list', 'export'], resource: '*' },
      { action: ['create', 'edit', 'clone', 'delete'], resource: 'authors' },
      { action: ['create', 'edit', 'clone', 'delete'], resource: 'citations' },
      {
        action: ['create', 'edit', 'clone', 'delete'],
        resource: 'hierarchies',
      },
      {
        action: ['create', 'edit', 'clone', 'delete'],
        resource: 'informal_groups',
      },
      {
        action: ['create', 'edit', 'clone', 'delete'],
        resource: 'publications',
      },
      {
        action: ['create', 'edit', 'clone', 'delete'],
        resource: 'publication_authors',
      },
      {
        action: ['create', 'edit', 'clone', 'delete'],
        resource: 'taxon_names',
      },
      {
        action: ['create', 'edit', 'clone', 'delete'],
        resource: 'vernaculars',
      },
    ];

    permissions[Role.APPLICATION_SUPPORT] = [
      { action: ['show', 'list', 'export', 'bulkdelete'], resource: '*' },
      { action: '*', resource: 'users' },
      { action: '*', resource: 'user_roles' },
      { action: '*', resource: 'kingdoms' },
      { action: '*', resource: 'taxon_ranks' },
      { action: '*', resource: 'classification_systems' },
    ];
    permissions[Role.SUPER_ADMIN] = [{ action: '*', resource: '*' }];
    return Promise.resolve(permissions);
  },
};

export default authProvider;
