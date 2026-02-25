import { Card as MuiCard, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FilterLiveSearch } from 'react-admin';
import { DeletedFilter, RolesFilter } from './UserFilters';
import React from 'react';
import { CanAccess as IfCanAccess } from 'react-admin';

export const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    order: -1, // display on the left rather than on the right of the list
    width: '15em',
    marginRight: '1em',
  },
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));
export const FilterSidebar = () => (
  <Card>
    <CardContent>
      <FilterLiveSearch />
      <RolesFilter />
      <IfCanAccess resource="users" action="viewdeleted">
        <DeletedFilter />
      </IfCanAccess>
    </CardContent>
  </Card>
);
