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
  maxValue,
} from 'react-admin';
import React, { FC } from 'react';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import EditToolbar from '../shared/EditToolbar';
import ScientificNameReference from '../Taxon_names/ScientificNameReference';
import { ConservationShort } from '../Conservation_codes';
import { CalendarToday, DateRange, Today } from '@mui/icons-material';

const useStyles = makeStyles((theme: any) => ({
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

const validatedate = [required(), maxValue(new Date('2024-04-17'))];

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
          <DateInput source="effective_from" validate={validatedate} />
          <DateInput source="effective_to" />
        </Box>
        <Box className={classes.mainGridLong}>
          <TextInput source="notes" multiline fullWidth />
        </Box>
      </SimpleForm>
    </>
  );
};
