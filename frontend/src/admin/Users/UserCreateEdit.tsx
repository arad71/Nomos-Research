import {
  BooleanInput,
  PasswordInput,
  SimpleForm,
  TextInput,
  ReferenceArrayInput,
  SelectArrayInput,
  required,
} from 'react-admin';

import React, { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { GlobalTheme } from '../../GlobalTheme';
import makeStyles from '@mui/styles/makeStyles';
import { AUTH_PROVIDER } from '../../config';
import EditToolbar from '../shared/EditToolbar';

const useStyles = makeStyles((theme: any) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    width: '50%',
    gridColumnGap: '1.5em',
  },
  twoColSpan: {
    gridColumnStart: '1',
    gridColumnEnd: '3',
  },
}));

export const UserCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm
      {...props}
      toolbar={<EditToolbar resource="users" />}
      warnWhenUnsavedChanges
    >
      <Box className={classes.mainGrid}>
        <Box className={classes.twoColSpan}>
          <Typography variant="h5" className={globalClasses.bold} gutterBottom>
            User information
          </Typography>
        </Box>
        <TextInput source="first_name" />
        <TextInput source="last_name" validate={required()} />
        <TextInput
          source="email"
          className={classes.twoColSpan}
          validate={required()}
        />
        {AUTH_PROVIDER !== 'auth2' && (
          <PasswordInput source="password" fullWidth />
        )}
      </Box>
      <Box className={classes.mainGrid}>
        <Box className={classes.twoColSpan}>
          <Typography variant="h5" className={globalClasses.bold} gutterBottom>
            Access
          </Typography>
        </Box>
        <Box className={classes.twoColSpan}>
          <ReferenceArrayInput source="role_ids" reference="roles">
            <SelectArrayInput
              optionText="name"
              fullWidth
              validate={required()}
            />
          </ReferenceArrayInput>
        </Box>
        <Box className={classes.twoColSpan}>
          <BooleanInput
            source="deleted"
            /* eslint-disable-next-line max-len */
            helperText="Toggle to mark the user as deleted (inactive) or not (active)"
          />
        </Box>
      </Box>
    </SimpleForm>
  );
};
