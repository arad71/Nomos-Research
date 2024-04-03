import {
  ReferenceInput,
  ReferenceManyField,
  ReferenceArrayInput,
  ArrayInput,
  required,
  SelectInput,
  SelectArrayInput,
  SimpleForm,
  SimpleFormIterator,
  useRecordContext,
  TextInput,
  NumberInput,
  DateInput,
  Datagrid,
  DateField,
  TextField,
  EditButton,
} from 'react-admin';
import React, { FC } from 'react';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography, makeStyles } from '@material-ui/core';
import EditToolbar from '../shared/EditToolbar';
import ScientificNameReference from '../Taxon_names/ScientificNameReference';
import { ConservationShort } from '../Conservation_codes';

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    width: '100%',
    gridColumnGap: '1.5em',
  },
  mainGridLong: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    width: '100%',
    gridColumnGap: '1.5em',
  },
  mainGridShort: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    width: '100%',
    gridColumnGap: '1.5em',
  },
}));

export const ConscodeTaxonCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();

  // const taxonRedirect = (props: any) =>
  //   `/taxon_names_code/${props.record.taxon_name_id}/show`;

  const FullNameField = (props: any) => {
    const record = useRecordContext(props);
    if (!record) return null;
    return (
      <>
        {record.authorising_org}:
        <strong>{record.conservation_code_value}</strong>
      </>
    );
  };

  return (
    <>
      <SimpleForm
        {...props}
        toolbar={<EditToolbar resource="conscode_taxons" />}
        warnWhenUnsavedChanges
      >
        <Box className={classes.mainGridLong}>
          <Typography variant="h5" className={globalClasses.bold} gutterBottom>
            Conservation Code - Taxon link
          </Typography>
        </Box>
        <Box className={classes.mainGridLong}>
          <ScientificNameReference
            source="taxon_name_id"
            validate={required()}
          />
        </Box>
        <Box className={classes.mainGridShort}>
          <ReferenceInput
            source="conservation_code_id"
            reference="conservation_codes"
            label="Conservation code"
            sort={{
              field: 'code_priority',
              order: 'ASC',
            }}
          >
            <SelectInput
              optionText={<ConservationShort source="conservation_code_id" />}
              validate={required()}
            />
          </ReferenceInput>
          <DateInput source="effective_from" validate={required()} />
          <DateInput source="effective_to" />
        </Box>
        <Box className={classes.mainGridLong}>
          <TextInput source="notes" multiline fullWidth />
        </Box>
      </SimpleForm>
    </>
  );
};
