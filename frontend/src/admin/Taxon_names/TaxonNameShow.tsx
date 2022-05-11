// in src/users.js
import React, { FC } from 'react';
import {
  DateField,
  NumberField,
  ReferenceField,
  Show,
  TabbedShowLayout,
  Tab,
  SelectField,
  TextField,
  BooleanField,
  RichTextField,
  Labeled,
} from 'react-admin';
import Aside from '../shared/Aside';
import NaturalisedStatus from './NaturalisedStatus';
import PublicationStatus from './PublicationStatus';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';

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
          <ReferenceField source="kingdom_id" reference="kingdoms">
            <TextField source="kingdom_name" />
          </ReferenceField>
          <ReferenceField source="rank_id" reference="taxon_ranks">
            <TextField source="rank_name" />
          </ReferenceField>
          <TextField source="canonical_name" />
          <TextField source="scientific_name" />
          <RichTextField source="formatted_scientific_name" />
          <TextField source="phylum" />
          <TextField source="taxon_class" label="Class" />
          <TextField source="order" />
          <TextField source="family" />
          <TextField source="genus" />
          <TextField source="subgenus" />
          <TextField source="species" />
          <TextField source="subspecies" />
          <TextField source="specific_epithet" />
          <TextField source="infraspecific_epithet" />
          <ReferenceField source="publication_id" reference="publications">
            <TextField source="publication_name" />
          </ReferenceField>
          <TextField source="volume_information" />
          <BooleanField source="is_current" />
          <TextField source="origin" />
          <SelectField
            source="publication_status"
            choices={PublicationStatus}
          />
          <NumberField source="form_desc_yr" />
          <NumberField source="form_desc_mn" />
          <NumberField source="form_desc_dy" />
          <TextField source="comments" />
          <TextField source="contributed_by" />
          git
          <DateField source="contributed_on" showTime />
          <BooleanField source="validated" />
          <TextField source="source" />
          <TextField source="external_id" />
          <TextField source="family_code" />
          <TextField source="author" />
          <TextField source="vernacular" />
          <TextField source="editor" />
          <SelectField
            source="naturalised_status"
            choices={NaturalisedStatus}
          />
          <BooleanField source="naturalised_certainty" />
          <TextField source="is_eradicated" />
          <TextField source="naturalised_comments" />
          <NumberField source="linear_sequence" />
          <ReferenceField
            label="Family"
            source="family_nid"
            reference="taxon_names"
          >
            <RichTextField source="formatted_scientific_name" />
          </ReferenceField>
          <TextField source="all_vernaculars" />
          <TextField source="notes" />
          <DateField source="authorised_on" showTime />
        </Tab>
        <Tab label="Details" className={classes.tablabel}>
          <Box
            display={{ xs: 'block', sm: 'flex' }}
            my="1.2em"
            justifyContent="flex-start"
          >
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Family code">
                <TextField source="family_code" />
              </Labeled>
            </Box>
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Origin">
                <TextField source="origin" />
              </Labeled>
            </Box>
          </Box>
          <Box
            display={{ xs: 'block', sm: 'flex' }}
            mb="1.2em"
            justifyContent="flex-start"
          >
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Naturalised status">
                <SelectField
                  source="naturalised_status"
                  choices={NaturalisedStatus}
                />
              </Labeled>
            </Box>
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Naturalised certainty">
                <BooleanField source="naturalised_certainty" />
              </Labeled>
            </Box>
          </Box>
          <Box
            display={{ xs: 'block', sm: 'flex' }}
            mb="1em"
            justifyContent="flex-start"
          >
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Naturalised comments">
                <TextField source="naturalised_comments" />
              </Labeled>
            </Box>
          </Box>
          <Box mt="2.2em">
            <Typography variant="h6" gutterBottom>
              Type Specimen (placeholder section)
            </Typography>
          </Box>
          <Box
            display={{ xs: 'block', sm: 'flex' }}
            my="1.2em"
            justifyContent="flex-start"
          >
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Type specimen Status">
                <Typography variant="body2" gutterBottom>
                  See notes
                </Typography>
              </Labeled>
            </Box>
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Type specimen ID">
                <Typography variant="body2" gutterBottom>
                  WAM001
                </Typography>
              </Labeled>
            </Box>
          </Box>
          <Box
            display={{ xs: 'block', sm: 'flex' }}
            mb="1.2em"
            justifyContent="flex-start"
          >
            <Box mr={{ xs: 0, sm: '1em' }}>
              <Labeled label="Type specimen location">
                <Typography variant="body2" gutterBottom>
                  WA Museum Welshpool
                </Typography>
              </Labeled>
            </Box>
          </Box>
        </Tab>
        <Tab label="Heirarchy" className={classes.tablabel}></Tab>
        <Tab label="Cross References" className={classes.tablabel}></Tab>
        <Tab label="Notes" className={classes.tablabel}>
          <Box my="1.2em">
            <Labeled label="Notes">
              <TextField source="notes" />
            </Labeled>
          </Box>
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};
