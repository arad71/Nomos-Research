import React from 'react';

export const IsSuperAdmin = localStorage.getItem('scopes') === 'SUPER_ADMIN';
