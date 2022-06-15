import {
  NumberInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  NullableBooleanInput,
} from 'react-admin';
import React, { FC } from 'react';
import ClassificationType from './ClassificationType';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    width: '70%',
    gridColumnGap: '1.5em',
  },
}));

export const ClassSystemCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm {...props} warnWhenUnsavedChanges>
      <Box>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Classification system
        </Typography>
      </Box>
      <Box className={classes.mainGrid}>
        <Box>
          <TextInput source="class_desc" validate={[required()]} fullWidth />
        </Box>
        <Box>
          <SelectInput
            source="class_type"
            choices={ClassificationType}
            validate={[required()]}
            fullWidth
          />
        </Box>
        <Box>
          <NullableBooleanInput
            label="Preferred"
            source="preferred"
            fullWidth
          />
        </Box>
        <Box>
          <NumberInput source="sort_order" fullWidth />
        </Box>
      </Box>
    </SimpleForm>
  );
};
