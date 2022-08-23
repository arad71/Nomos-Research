import React from 'react';
import {
  Datagrid,
  NumberField,
  ReferenceField,
  ReferenceManyField,
  SelectField,
  TextField,
} from 'react-admin';
import { Box, Typography } from '@material-ui/core';
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
        field: 'author_type,author_order',
        order: 'ASC,ASC',
      }}
      {...props.props}
    >
      <Datagrid empty={<Empty />} className={globalClasses.equalColumnWidth}>
        <ReferenceField source={props.source} reference="authors" allowEmpty>
          <TextField source="abbreviation" />
        </ReferenceField>
        <SelectField source="author_type" choices={AuthorType} />
        <NumberField source="author_order" />
      </Datagrid>
    </ReferenceManyField>
  );
};
