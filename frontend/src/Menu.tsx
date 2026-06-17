import * as React from 'react';
import { Menu as RaMenu, usePermissions } from 'react-admin';
import {
  adminNavSections,
  type AdminNavSection,
  getStoredRoles,
  hasAnyRole,
} from './adminShell';
import authProvider from './kit/app/authProvider';

const Menu = () => {
  const { isLoading } = usePermissions();
  const roles = getStoredRoles();
  const [visibleSections, setVisibleSections] =
    React.useState<AdminNavSection[]>(adminNavSections);

  React.useEffect(() => {
    let active = true;

    const resolveVisibleSections = async () => {
      const nextSections = (
        await Promise.all(
          adminNavSections.map(async (section) => {
            const items = (
              await Promise.all(
                section.items.map(async (item) => {
                  if (!hasAnyRole(roles, item.roles)) {
                    return null;
                  }

                  if (!item.resource || !item.action) {
                    return item;
                  }

                  const canAccess = await authProvider.canAccess({
                    resource: item.resource,
                    action: item.action,
                  });

                  return canAccess ? item : null;
                })
              )
            ).filter(Boolean) as AdminNavSection['items'];

            return { ...section, items };
          })
        )
      ).filter((section) => section.items.length > 0);

      if (active) {
        setVisibleSections(nextSections);
      }
    };

    void resolveVisibleSections();

    return () => {
      active = false;
    };
  }, [roles]);

  if (isLoading) {
    return null;
  }

  return (
    <RaMenu>
      {visibleSections.flatMap((section) =>
        section.items.map((item) => (
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
