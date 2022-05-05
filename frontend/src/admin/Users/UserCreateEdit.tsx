import {
  BooleanInput,
  PasswordInput,
  FormWithRedirect,
  TextInput,
  required,
  // SingleFieldList,
  // ChipField,
  Toolbar,
} from 'react-admin';
//import { ReferenceManyToManyField } from '@react-admin/ra-relationships';
import { Typography, Box, Grid } from '@material-ui/core';

import React, { FC } from 'react';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  form: {
    border: '1px solid #DFDFE2',
    borderRadius: '5px',
  },
  formContent: {
    width: '50%',
    padding: '25px',
  },
  nameInputs: {
    display: 'flex',
  },
}));

export const UserCreateEdit: FC = (props) => {
  const classes = useStyles();
  return (
    <FormWithRedirect
      {...props}
      render={(formProps: any) => (
        <form className={classes.form}>
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            className={classes.formContent}
          >
            <Grid item>
              <Typography variant="h4">User information</Typography>
              <Box className={classes.nameInputs}>
                <Box flex={1} mr={{ xs: 0, sm: '0.5em' }}>
                  <TextInput source="first_name" fullWidth />
                </Box>
                <Box flex={1} ml={{ xs: 0, sm: '0.5em' }}>
                  <TextInput
                    source="last_name"
                    fullWidth
                    validate={required()}
                  />
                </Box>
              </Box>
              <TextInput source="email" fullWidth validate={required()} />
              <PasswordInput source="password" />
              <Typography variant="h4">Access</Typography>
              {/*<ReferenceManyToManyField*/}
              {/*  reference="roles"*/}
              {/*  through="user_roles"*/}
              {/*  using="user_id,role_id"*/}
              {/*  source="role_id"*/}
              {/*>*/}
              {/*  <SingleFieldList>*/}
              {/*    <ChipField source="name" />*/}
              {/*  </SingleFieldList>*/}
              {/*</ReferenceManyToManyField>*/}
              <BooleanInput source="is_active" defaultValue={false} />
            </Grid>
          </Grid>
          <Toolbar
            record={formProps.record}
            basePath={formProps.basePath}
            undoable={true}
            invalid={formProps.invalid}
            handleSubmit={formProps.handleSubmit}
            saving={formProps.saving}
            resource="users"
          />
        </form>
      )}
    />
  );
};
