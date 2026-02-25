import { Card as MuiCard, CardContent } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { FilterLiveSearch } from 'react-admin';
import { DeletedFilter, RolesFilter } from './UserFilters';
import React from 'react';
import { IfCanAccess } from '@react-admin/ra-rbac';

export const Card = withStyles((theme) => ({
  root: {
    [theme.breakpoints.up('sm')]: {
      order: -1, // display on the left rather than on the right of the list
      width: '15em',
      marginRight: '1em',
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}))(MuiCard);
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
