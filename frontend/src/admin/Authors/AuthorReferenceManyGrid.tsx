import React from 'react';
import {
  Datagrid,
  NumberField,
  ReferenceField,
  ReferenceManyField,
  SelectField,
  TextField,
  useRecordContext,
} from 'react-admin';

import { GlobalTheme } from '../../GlobalTheme';
import AuthorType from '../Citations/AuthorType';

export const AuthorReferenceManyGrid = (props: {
  source: string;
  target: string;
  label: string;
  props: React.PropsWithChildren<{}>;
}) => {
  const record = useRecordContext();
  return (
    <>
      {record.author ? (
        <ReferenceManyField
          fullWidth
          label="Authors"
          reference="citations"
          target={props.target}
          sort={{
            field: 'author_type,author_order',
            order: 'ASC,ASC',
          }}
          {...props.props}
        >
          <Datagrid>
            <ReferenceField source={props.source} reference="authors">
              <TextField source="abbreviation" />
            </ReferenceField>
            <SelectField source="author_type" choices={AuthorType} />
            <NumberField source="author_order" />
          </Datagrid>
        </ReferenceManyField>
      ) : (
        <span>No related citations found</span>
      )}
    </>
  );
};
