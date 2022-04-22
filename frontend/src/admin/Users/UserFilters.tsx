import React from 'react';
import { FilterList, FilterListItem } from 'react-admin';
import { Settings, ToggleOn } from '@material-ui/icons';
import Role from '../role';

export const IsActiveFilter = () => (
  <FilterList label="Is Active" icon={<ToggleOn />}>
    <FilterListItem label="Active" value={{ is_active: true }} />
    <FilterListItem label="Not active" value={{ is_active: false }} />
  </FilterList>
);
export const RolesFilter = () => (
  <FilterList label="User role" icon={<Settings />}>
    <FilterListItem
      label="Super admin"
      value={{ user_role___role___name: Role.SUPER_ADMIN }}
    />
    <FilterListItem
      label="Application support"
      value={{ user_role___role___name: Role.APPLICATION_SUPPORT }}
    />
    <FilterListItem
      label="Manager"
      value={{ user_role___role___name: Role.MANAGER }}
    />
    <FilterListItem
      label="Officer"
      value={{ user_role___role___name: Role.OFFICER }}
    />
    <FilterListItem
      label="Reader"
      value={{ user_role___role___name: Role.READER }}
    />
  </FilterList>
);
