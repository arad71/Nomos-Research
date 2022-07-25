import React from 'react';
import { BooleanInput, SearchInput, useResourceContext } from 'react-admin';
import { useCanAccess } from '@react-admin/ra-rbac';

export const selectableFilters = () => {
  const filters = [<SearchInput source="q" alwaysOn />];
  if (
    useCanAccess({
      action: 'delete',
      resource: useResourceContext(),
    }).canAccess
  ) {
    filters.push(<BooleanInput label="Soft deleted?" source="deleted" />);
  }
  return filters;
};
