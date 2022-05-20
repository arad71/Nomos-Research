import { required, SimpleForm, TextInput } from 'react-admin';
import React, { FC } from 'react';
import { Box, Typography } from '@material-ui/core';
import { GlobalTheme } from '../../GlobalTheme';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  form: {
    border: '1px solid #DFDFE2',
    borderRadius: '5px',
  },
  formWidth: {
    width: '75%',
  },
  orcid: {
    width: '52%',
    marginBottom: '60px',
  },
}));

export const AuthorCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm {...props} warnWhenUnsavedChanges>
      <Box className={classes.formWidth}>
        <Box>
          <Typography variant="h5" className={globalClasses.bold} gutterBottom>
            Author
          </Typography>
        </Box>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <TextInput source="surname" />
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <TextInput source="first_names" />
          </Box>
          <Box width={'100px'} className={globalClasses.fieldMargin}>
            <TextInput source="initials" />
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <TextInput source="abbreviation" validate={[required()]} />
          </Box>
        </Box>
        <Box>
          <TextInput className={classes.orcid} source="orc_id" />
        </Box>
      </Box>
    </SimpleForm>
  );
};
