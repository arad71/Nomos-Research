import React from 'react';
import {
  Datagrid,
  NumberField,
  ReferenceField,
  ReferenceManyField,
  RichTextField,
  SelectField,
  TextField,
  DateField,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { GlobalTheme } from '../../GlobalTheme';
import { ConservationShort } from '../Conservation_codes';

const Empty = () => (
  <Box>
    <Typography variant="body1">No related Taxon Names found</Typography>
  </Box>
);

export const ConscodeTaxonReferenceManyGrid = (props: {
  source: string;
  target: string;
  label: string;
  props: React.PropsWithChildren<{}>;
}) => {
  const globalClasses = GlobalTheme();
  return (
    <ReferenceManyField
      fullWidth
      label="Taxon Names"
      reference="conscode_taxons"
      sort={{
        field: 'conservation_code___code_priority',
        order: 'ASC',
      }}
      target={props.target}
      {...props.props}
    >
      <Datagrid
        bulkActionButtons={false}
        empty={<Empty />}
        className={globalClasses.equalColumnWidth}
      >
        <ReferenceField
          source="conservation_code_id"
          reference="conservation_codes"
          link={false}
        >
          <ConservationShort source="conservation_code_id" />
        </ReferenceField>
        <DateField source="effective_from" />
        <DateField source="effective_to" />
        <TextField source="notes" />
      </Datagrid>
    </ReferenceManyField>
  );
};

export const ConscodeTaxonReferenceManyGridTaxon = (props: {
  source: string;
  target: string;
  label: string;
  props: React.PropsWithChildren<{}>;
}) => {
  const globalClasses = GlobalTheme();
  return (
    <ReferenceManyField
      fullWidth
      label="Taxon Names"
      reference="conscode_taxons"
      sort={{
        field: 'conservation_code___code_priority',
        order: 'ASC',
      }}
      target={props.target}
      {...props.props}
    >
      <Datagrid
        bulkActionButtons={false}
        empty={<Empty />}
        className={globalClasses.equalColumnWidth}
      >
        <ReferenceField
          source={props.source}
          reference="taxon_names"
          allowEmpty
          link="show"
        >
          <RichTextField source="formatted_scientific_name" />
        </ReferenceField>
        <ReferenceField
          source="conservation_code_id"
          reference="conservation_codes"
          link={false}
        >
          <ConservationShort source="conservation_code_id" />
        </ReferenceField>
        <TextField source="notes" />
        <DateField source="effective_from" />
        <DateField source="effective_to" />
      </Datagrid>
    </ReferenceManyField>
  );
};
