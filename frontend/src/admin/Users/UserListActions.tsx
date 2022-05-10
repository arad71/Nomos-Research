import * as React from 'react';

import { TopToolbar, CreateButton, Button } from 'react-admin';

export const UserListActions = (props: any) => (
  <TopToolbar>
    <Button
      onClick={() => {
        alert('Save bookmark');
      }}
      label="Save bookmark"
    ></Button>
    <CreateButton />
  </TopToolbar>
);
