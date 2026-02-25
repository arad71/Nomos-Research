import React from 'react';
import {
  Datagrid,
  NumberField,
  ReferenceField,
  ReferenceManyField,
  SelectField,
  TextField,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import AuthorType from '../Citations/AuthorType';
import { GlobalTheme } from '../../GlobalTheme';

const Empty = () => (
  <Box>
    <Typography variant="body1">No related authors found</Typography>
  </Box>
);

export const AuthorReferenceManyGrid = (props: {
  source: string;
  target: string;
  label: string;
  props: React.PropsWithChildren<{}>;
}) => {
  const globalClasses = GlobalTheme();
  return (
    <ReferenceManyField
      fullWidth
      label="Authors"
      reference="citations"
      target={props.target}
      sort={{
        field: 'author_order',
        order: 'ASC',
      }}
      {...props.props}
    >
      <Datagrid
        bulkActionButtons={false}
        empty={<Empty />}
        className={globalClasses.equalColumnWidth}
      >
        <ReferenceField
          source={props.source}
          reference="authors"
          allowEmpty
          link="show"
        >
          <TextField source="abbreviation" />
        </ReferenceField>
        <SelectField source="author_type" choices={AuthorType} />
        <NumberField source="author_order" />
      </Datagrid>
    </ReferenceManyField>
  );
};
