import {
  BooleanInput,
  PasswordInput,
  SimpleForm,
  TextInput,
  required,
  SingleFieldList,
  ChipField,
} from 'react-admin';
import { ReferenceManyToManyField } from '@react-admin/ra-relationships';
import { Typography, Box, Grid } from '@material-ui/core';

import React, { FC } from 'react';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  form: {
    width: '50%',
  },
  nameInputs: {
    display: 'flex',
  },
}));

export const UserCreateEdit: FC = (props) => {
  const classes = useStyles();
  return (
    <SimpleForm {...props}>
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        className={classes.form}
      >
        <Grid item>
          <Typography variant="h4">User information</Typography>
          <Box className={classes.nameInputs}>
            <Box flex={1} mr={{ xs: 0, sm: '0.5em' }}>
              <TextInput source="first_name" fullWidth />
            </Box>
            <Box flex={1} ml={{ xs: 0, sm: '0.5em' }}>
              <TextInput source="last_name" fullWidth validate={required()} />
            </Box>
          </Box>
          <Box flex={1}>
            <TextInput source="email" fullWidth validate={required()} />
          </Box>
          <PasswordInput source="password" />
          <Typography variant="h4">Access</Typography>
          <ReferenceManyToManyField
            reference="roles"
            through="user_roles"
            using="user_id,role_id"
          >
            <SingleFieldList>
              <ChipField source="name" />
            </SingleFieldList>
          </ReferenceManyToManyField>
          <BooleanInput source="is_active" defaultValue={false} />
        </Grid>
      </Grid>
    </SimpleForm>
  );
};
