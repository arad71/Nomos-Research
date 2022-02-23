// in src/users.js
import React, { FC } from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  EditButton,
  ReferenceField,
  useRecordContext,
} from 'react-admin';

const FullNameField = (props: any) => {
  const record = useRecordContext(props);

  return (
    <span>
      {record.first_name} {record.last_name}
    </span>
  );
};

FullNameField.defaultProps = { label: 'Name' };

export const CitationShow: FC = (props) => (
  <Show {...props} sort={{ field: 'kingdom_name', order: 'DESC' }}>
    <SimpleShowLayout>
      <ReferenceField source="taxon_name_id" reference="taxon_names">
        <TextField source="rank_name" />
      </ReferenceField>
      <ReferenceField source="author_id" reference="authors">
        <TextField source="author" />
      </ReferenceField>
      <EditButton />
    </SimpleShowLayout>
  </Show>
);
