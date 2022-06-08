import { Pagination } from 'react-admin';
import React from 'react';

export function DefaultPagination() {
  return <Pagination rowsPerPageOptions={[50, 100, 200, 500, 1000]} />;
}
