import {
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  BooleanInput,
} from 'react-admin';
import React, { FC } from 'react';
import LanguageType from './LanguageType';
import { Box, Typography, makeStyles } from '@material-ui/core';
import { GlobalTheme } from '../../GlobalTheme';
import EditToolbar from '../shared/EditToolbar';

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    width: '70%',
    gridColumnGap: '1.5em',
  },
}));

export const VernacularCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm
      {...props}
      toolbar={<EditToolbar resource="vernaculars" />}
      warnWhenUnsavedChanges
    >
      <Box>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Vernacular Name
        </Typography>
      </Box>
      <Box className={classes.mainGrid}>
        <TextInput source="vernacular" validate={required()} />
        <ReferenceInput source="taxon_name_id" reference="taxon_names">
          <SelectInput optionText="scientific_name" validate={required()} />
        </ReferenceInput>
        <SelectInput
          source="language"
          choices={LanguageType}
          validate={required()}
        />
        <BooleanInput
          label="Lang Pref"
          source="lang_pref"
          validate={required()}
          defaultValue={false}
        />
        <TextInput source="source" />
        <NumberInput source="sort_order" />
        <BooleanInput
          label="preferred"
          source="preferred"
          validate={required()}
          defaultValue={false}
        />
        <BooleanInput
          label="Enabled"
          source="enabled"
          validate={required()}
          defaultValue={false}
        />
      </Box>
    </SimpleForm>
  );
};
