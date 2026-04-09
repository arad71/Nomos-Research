export const BASE_URL: string =
  import.meta.env.REACT_APP_BASE_URL || 'http://localhost:8000';
export const BACKEND_URL: string =
  import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8000/api/v1';
export const AUTH_PROVIDER: string =
  import.meta.env.REACT_APP_AUTH_PROVIDER || import.meta.env.AUTH_PROVIDER || 'auth2';
export const MAX_RESULTS: number = 1000;
