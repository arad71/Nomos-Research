import React from 'react';
import {
  Datagrid,
  ReferenceField,
  ReferenceManyField,
  SelectField,
  TextField,
} from 'react-admin';
import { EmbeddedCrossReferenceShow } from './EmbeddedCrossReferenceShow';

import CrossRefType from './CrossRefType';
import { FormattedScientificNameWithStatus, TaxonName } from '../Taxon_names';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography } from '@material-ui/core';

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
      rowClick={(id: number, basePath: string, record: TaxonName) =>
        `/taxon_names/${record[props.source]}/show/related_names`
      }
      reference="cross_references"
      target={props.target}
      filter={{ active: true }}
      {...props.props}
    >
      <Datagrid
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
        <TextField source="comments" />
      </Datagrid>
    </ReferenceManyField>
  );
};
