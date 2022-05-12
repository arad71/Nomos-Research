// in src/users.js
import React, { FC } from 'react';
import {
  DateField,
  NumberField,
  ReferenceField,
  Show,
  TabbedShowLayout,
  Labeled,
  Tab,
  SelectField,
  TextField,
  BooleanField,
  RichTextField,
} from 'react-admin';
import Aside from '../shared/Aside';
import NaturalisedStatus from './NaturalisedStatus';
import PublicationStatus from './PublicationStatus';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

const useStyles = makeStyles({
  tablabel: {
    fontWeight: 'bold',
  },
});

export const TaxonNameShow: FC = (props) => {
  const classes = useStyles();
  return (
    <Show aside={<Aside />} {...props}>
      <TabbedShowLayout>
        <Tab label="Name" className={classes.tablabel}>
          <Box my="1.2em">
            <ReferenceField source="rank_id" reference="taxon_ranks" my="1.2em">
              <Labeled label="Rank">
                <TextField source="rank_name" />
              </Labeled>
            </ReferenceField>
          </Box>
          <Box
            display={{ xs: 'block', sm: 'flex' }}
            mb="1.2em"
            justifyContent="flex-start"
          >
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Genus">
                <TextField source="genus" label="Genus" />
              </Labeled>
            </Box>
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Specific Epithet">
                <TextField source="specific_epithet" />
              </Labeled>
            </Box>
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Infraspecific Epithet">
                <TextField source="infraspecific_epithet" />
              </Labeled>
            </Box>
          </Box>
          <Box
            display={{ xs: 'block', sm: 'flex' }}
            mb="1.2em"
            justifyContent="flex-start"
          >
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Day">
                <NumberField source="form_desc_dy" />
              </Labeled>
            </Box>
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Month">
                <NumberField source="form_desc_mn" />
              </Labeled>
            </Box>
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Year">
                <NumberField source="form_desc_yr" />
              </Labeled>
            </Box>
          </Box>
          <Box
            display={{ xs: 'block', sm: 'flex' }}
            mb="1em"
            justifyContent="flex-start"
          >
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Publication status">
                <SelectField
                  source="publication_status"
                  choices={PublicationStatus}
                />
              </Labeled>
            </Box>
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Is current">
                <BooleanField source="is_current" />
              </Labeled>
            </Box>
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Validated">
                <BooleanField source="validated" />
              </Labeled>
            </Box>
          </Box>
        </Tab>
        <Tab label="Details" className={classes.tablabel}></Tab>
        <Tab label="Heirarchy" className={classes.tablabel}></Tab>
        <Tab label="Cross References" className={classes.tablabel}></Tab>
        <Tab label="Notes" className={classes.tablabel}></Tab>
      </TabbedShowLayout>
    </Show>
  );
};
