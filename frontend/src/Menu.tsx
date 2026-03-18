import * as React from 'react';
import { Menu as RaMenu, usePermissions } from 'react-admin';
import {
  adminNavSections,
  getStoredRoles,
  hasAnyRole,
} from './adminShell';

const Menu = () => {
  const { isLoading } = usePermissions();
  const roles = getStoredRoles();

  if (isLoading) {
    return null;
  }

  return (
    <RaMenu>
      {adminNavSections.flatMap((section) =>
        section.items
          .filter((item) => hasAnyRole(roles, item.roles))
          .map((item) => (
            <RaMenu.Item
              key={item.to}
              to={item.to}
              primaryText={item.label}
              leftIcon={item.icon}
            />
          ))
      )}
    </RaMenu>
  );
};

export default Menu;
