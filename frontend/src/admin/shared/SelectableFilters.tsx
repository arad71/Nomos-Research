import React from 'react';
import { BooleanInput, SearchInput, useResourceContext } from 'react-admin';
import { useCanAccess } from '@react-admin/ra-rbac';

export const addDeletedFilterIfApplicable = (filters: JSX.Element[]) => {
  if (
    useCanAccess({
      action: 'deletedfilter',
      resource: useResourceContext(),
    }).canAccess
  ) {
    filters.push(<BooleanInput label="Deleted?" source="deleted" />);
  }
};

export const selectableFilters = () => {
  const filters = [<SearchInput source="q" alwaysOn />];
  addDeletedFilterIfApplicable(filters);
  return filters;
};
