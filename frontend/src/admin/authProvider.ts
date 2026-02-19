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
  | 'viewdeleted'
  | 'deletedfilter'
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

const parseStoredScopes = (): string[] => {
  const rawScopes = localStorage.getItem('scopes');
  if (!rawScopes) {
    const token = localStorage.getItem('token');
    if (!token) {
      return [];
    }

    try {
      const decoded: any = decodeJwt(token);
      const tokenScopes = decoded?.scopes;
      if (Array.isArray(tokenScopes)) {
        const normalizedScopes = tokenScopes
          .map((scope) => String(scope).trim())
          .filter(Boolean);
        if (normalizedScopes.length > 0) {
          localStorage.setItem('scopes', normalizedScopes.join(','));
        }
        return normalizedScopes;
      }
      if (typeof tokenScopes === 'string') {
        const normalizedScopes = tokenScopes
          .split(',')
          .map((scope) => scope.trim())
          .filter(Boolean);
        if (normalizedScopes.length > 0) {
          localStorage.setItem('scopes', normalizedScopes.join(','));
        }
        return normalizedScopes;
      }
    } catch (error) {
      return [];
    }

    return [];
  }

  try {
    const parsedScopes = JSON.parse(rawScopes);
    if (Array.isArray(parsedScopes)) {
      return parsedScopes.map((scope) => String(scope).trim()).filter(Boolean);
    }
    if (typeof parsedScopes === 'string') {
      return parsedScopes
        .split(',')
        .map((scope) => scope.trim())
        .filter(Boolean);
    }
  } catch (error) {
    // Fallback for non-JSON string values persisted in localStorage
  }

  return rawScopes
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);
};

const getRolesDefinition = (): Permissions => {
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
    // { action: ['create', 'edit'], resource: 'conservation_code' },
  ];
  permissions[Role.MANAGER] = [
    { action: ['show', 'list', 'export'], resource: '*' },
    { action: ['create', 'edit', 'delete'], resource: 'authors' },
    { action: ['create', 'edit', 'delete'], resource: 'citations' },
    { action: ['create', 'edit', 'delete'], resource: 'cross_references' },
    { action: ['create', 'edit', 'delete'], resource: 'conservation_code' },
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
      resource: 'conscode_taxons',
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
      action: ['create', 'edit', 'delete'],
      resource: 'vernaculars',
    },
  ];

  permissions[Role.APPLICATION_SUPPORT] = [
    { action: ['show', 'list', 'export'], resource: '*' },
    {
      action: ['create', 'edit', 'delete', 'viewdeleted', 'deletedfilter'],
      resource: 'users',
    },
    {
      action: ['create', 'delete'],
      resource: 'user_roles',
    },
    {
      action: ['create', 'edit', 'delete'],
      resource: 'kingdoms',
    },
    {
      action: ['create', 'edit', 'delete'],
      resource: 'taxon_ranks',
    },
    {
      action: ['create', 'edit', 'delete'],
      resource: 'classification_systems',
    },
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
        'viewdeleted',
        'deletedfilter',
      ],
      resource: '*',
    },
  ];

  return permissions;
};

export function clearLocalStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('scopes');
  localStorage.removeItem('username');
  localStorage.removeItem('fullName');
  localStorage.removeItem('id');
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
    .then(({ access_token: accessToken, id, full_name }) => {
      const { logout_url, scopes }: any = decodeJwt(accessToken);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('scopes', scopes);
      localStorage.setItem('id', id);
      localStorage.setItem('fullName', full_name);
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
  getIdentity: () => {
    return {
      id: localStorage.getItem('id'),
      fullName: localStorage.getItem('fullName'),
    };
  },
  checkError: (error: { status: number }) => {
    const status = error.status;
    if (status === 401) {
      // Need to login, so we try to login.
      return getAuthToken();
    } else if (status === 403) {
      return Promise.reject(
        'Forbidden - you do not have access to the resource'
      );
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
      // Token has not expired so we just keep using it.
      return Promise.resolve();
    }
    // Refresh the auth token
    return getAuthToken();
  },
  getPermissions: async () => {
    let scopes = parseStoredScopes();

    if (scopes.length === 0) {
      const token = localStorage.getItem('token');
      if (!token && useAuth2()) {
        try {
          await getAuthToken();
        } catch (error) {
          return [];
        }
      }

      scopes = parseStoredScopes();
    }

    return scopes.flatMap((role) => getRolesDefinition()[role] || []);
  },
  getRoles: () => {
    // see https://marmelab.com/ra-enterprise/modules/ra-rbac#resource
    return Promise.resolve(getRolesDefinition());
  },
};

export default authProvider;
