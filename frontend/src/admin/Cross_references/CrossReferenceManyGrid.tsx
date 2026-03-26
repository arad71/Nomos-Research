import React from 'react';
import {
  Datagrid,
  ReferenceField,
  ReferenceManyField,
  SelectField,
  TextField,
} from 'react-admin';
import { EmbeddedCrossReferenceShow } from './EmbeddedCrossReferenceShow';

import CrossRefType from '../../kit/shared/choices/CrossRefType';
import { FormattedScientificNameWithStatus } from '../Taxon_names';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography } from '@mui/material';

const Empty = () => (
  <Box>
    <Typography variant="body1">No synonyms exist</Typography>
  </Box>
);

export const CrossReferenceManyGrid = (props: {
  source: string;
  target: string;
  label: string;
  props: React.PropsWithChildren<{}>;
}) => {
  const globalClasses = GlobalTheme();
  return (
    <ReferenceManyField
      reference="cross_references"
      target={props.target}
    >
      <Datagrid
        rowClick={false}
        bulkActionButtons={false}
        empty={<Empty />}
        className={globalClasses.equalColumnWidth}
        expand={<EmbeddedCrossReferenceShow />}
      >
        <SelectField source="cross_reference_type" choices={CrossRefType} />
        <ReferenceField
          source={props.source}
          reference="taxon_names"
          sortBy="cross_reference_type"
          link="show"
        >
          <FormattedScientificNameWithStatus />
        </ReferenceField>
        <TextField source="reference_comments" />
      </Datagrid>
    </ReferenceManyField>
  );
};
