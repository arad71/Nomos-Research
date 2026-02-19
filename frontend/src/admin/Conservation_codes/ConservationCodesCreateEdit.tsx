import {
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  DateInput,
} from 'react-admin';
import React, { FC } from 'react';
import ConservationType from './ConservationType';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography } from '@mui/material';
import makeStyles from 'lib/makeStyles';
import EditToolbar from '../shared/EditToolbar';

const useStyles = makeStyles((theme: any) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    width: '100%',
    gridColumnGap: '1.5em',
  },
}));

export const ConservationCodesCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm
      {...props}
      toolbar={<EditToolbar resource="conservation_codes" />}
      redirect="list"
    >
      <Box>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Conservation code
        </Typography>
      </Box>
      <Box className={classes.mainGrid}>
        <TextInput
          source="conservation_code_value"
          label="Conservation code"
          validate={[required()]}
          fullWidth
        />
        <SelectInput
          source="authorising_org"
          label="Authority"
          choices={ConservationType}
          validate={[required()]}
          fullWidth
        />
        <TextInput
          source="code_priority"
          label="Display order"
          validate={[required()]}
          fullWidth
        />
      </Box>
    </SimpleForm>
  );
};
