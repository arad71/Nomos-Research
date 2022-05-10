import {
  BooleanInput,
  PasswordInput,
  FormWithRedirect,
  TextInput,
  required,
  Toolbar,
  ReferenceManyField,
} from 'react-admin';
import { Typography, Box, Grid } from '@material-ui/core';

import React, { FC } from 'react';

import { makeStyles } from '@material-ui/core';
//import { ResourceContextProvider } from 'react-admin';
import { SingleFieldList } from 'react-admin';
import {
  ReferenceManyToManyField,
  ReferenceManyToManyInput,
} from '@react-admin/ra-relationships';
import { ChipField } from 'react-admin';
import { ArrayInput } from 'react-admin';
import { SimpleFormIterator } from 'react-admin';
import { SelectArrayInput } from 'react-admin';

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
  bool: {
    color: '#FFFFFF',
  },
  roleSelect: {
    width: '100%',
  },
}));

// const buttonStyles = makeStyles(
//   { inputMarginDense: { paddingTop: '100px' } },
//   { name: 'MuiFilledInput' }
// );

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
              {/*<ReferenceManyToManyInput*/}
              {/*  reference="roles"*/}
              {/*  through="user_roles"*/}
              {/*  using="user_id,role_id"*/}
              {/*>*/}
              {/*  <SingleFieldList>*/}
              {/*    <ChipField source="name" />*/}
              {/*  </SingleFieldList>*/}
              {/*</ReferenceManyToManyInput>*/}
              {/*<ReferenceManyField*/}
              {/*  label="One to Many"*/}
              {/*  target="user_id"*/}
              {/*  reference="user_roles"*/}
              {/*>*/}
              {/*  <ReferenceManyField*/}
              {/*    label="One to Many"*/}
              {/*    target="role_id"*/}
              {/*    reference="roles"*/}
              {/*  >*/}
              <ReferenceManyToManyField
                reference="roles"
                through="user_roles"
                using="user_id,role_id"
              >
                <SelectArrayInput
                  source="name"
                  className={classes.roleSelect}
                  choices={[
                    { id: 1, name: 'Reader' },
                    { id: 2, name: 'Officer' },
                    { id: 3, name: 'Manager' },
                    { id: 4, name: 'Application Support' },
                    { id: 5, name: 'Super Admin' },
                  ]}
                ></SelectArrayInput>
              </ReferenceManyToManyField>
              {/*<ReferenceManyField*/}
              {/*  label="One to Many"*/}
              {/*  target="user_id"*/}
              {/*  reference="user_roles"*/}
              {/*>*/}
              {/* eslint-disable-next-line max-len */}
              {/*  <ReferenceManyField label="" target="role_id" reference="roles">*/}
              {/*    <SingleFieldList>*/}
              {/*      <ChipField source="name" />*/}
              {/*    </SingleFieldList>*/}
              {/*  </ReferenceManyField>*/}
              {/*</ReferenceManyField>*/}
              {/*  </ReferenceManyField>*/}
              {/*</ReferenceManyField>*/}
              {/*<SelectArrayInput source="user_roles" fullWidth />*/}
              <BooleanInput
                className={classes.bool}
                source="is_active"
                defaultValue={false}
              />
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
