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
import TaxonHierarchy from './TaxonHierarchy';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold',
  },
  linedRow: {
    borderBottom: '1px solid #eee',
  },
});

export const TaxonNameShow: FC = (props) => {
  const classes = useStyles();
  return (
    <Show aside={<Aside />} {...props}>
      <TabbedShowLayout>
        <Tab label="Name" className={classes.bold}>
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
          {/* Authors Section */}
          <Box mt="2.2em">
            <Typography variant="h5" className={classes.bold} gutterBottom>
              Authors (placeholder section)
            </Typography>
          </Box>
          <Box mt="1.2em" className={classes.linedRow}>
            <Box
              display={{ xs: 'block', sm: 'flex' }}
              mb="0.5em"
              justifyContent="flex-start"
            >
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Typography variant="body2" gutterBottom>
                  1
                </Typography>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Author">
                  <Typography variant="body2" gutterBottom>
                    Schodde
                  </Typography>
                </Labeled>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Author type">
                  <Typography variant="body2" gutterBottom>
                    Basionym
                  </Typography>
                </Labeled>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Is active">
                  <BooleanField source="validated" />
                </Labeled>
              </Box>
            </Box>
          </Box>
          <Box mt="1.2em" className={classes.linedRow}>
            <Box
              display={{ xs: 'block', sm: 'flex' }}
              mb="0.5em"
              justifyContent="flex-start"
            >
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Typography variant="body2" gutterBottom>
                  2
                </Typography>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Author">
                  <Typography variant="body2" gutterBottom>
                    Schodde
                  </Typography>
                </Labeled>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Author type">
                  <Typography variant="body2" gutterBottom>
                    Basionym
                  </Typography>
                </Labeled>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Is active">
                  <BooleanField source="validated" />
                </Labeled>
              </Box>
            </Box>
          </Box>
          <Box mt="1.2em" className={classes.linedRow}>
            <Box
              display={{ xs: 'block', sm: 'flex' }}
              mb="0.5em"
              justifyContent="flex-start"
            >
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Typography variant="body2" gutterBottom>
                  3
                </Typography>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Author">
                  <Typography variant="body2" gutterBottom>
                    Schodde
                  </Typography>
                </Labeled>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Author type">
                  <Typography variant="body2" gutterBottom>
                    Basionym
                  </Typography>
                </Labeled>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Is active">
                  <BooleanField source="validated" />
                </Labeled>
              </Box>
            </Box>
          </Box>
          {/* Publication Section */}
          <Box mt="2.2em">
            <Typography variant="h5" className={classes.bold} gutterBottom>
              Publication
            </Typography>
          </Box>
          <Box my="1.2em">
            <ReferenceField
              source="publication_id"
              reference="publications"
              my="1.2em"
            >
              <Labeled label="Publication">
                <TextField source="publication" />
              </Labeled>
            </ReferenceField>
          </Box>
          {/* Vernacular Section */}
          <Box mt="2.2em">
            <Typography variant="h5" className={classes.bold} gutterBottom>
              Vernacular names (placeholder section)
            </Typography>
          </Box>
          <Box mt="1.2em" className={classes.linedRow}>
            <Box
              display={{ xs: 'block', sm: 'flex' }}
              mb="0.5em"
              justifyContent="flex-start"
            >
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Typography variant="body2" gutterBottom>
                  1
                </Typography>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Name">
                  <Typography variant="body2" gutterBottom>
                    Red-tailed black cockatoo
                  </Typography>
                </Labeled>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Name type">
                  <Typography variant="body2" gutterBottom>
                    Common
                  </Typography>
                </Labeled>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Language">
                  <Typography variant="body2" gutterBottom>
                    English
                  </Typography>
                </Labeled>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Preferred">
                  <Typography variant="body2" gutterBottom>
                    Enabled
                  </Typography>
                </Labeled>
              </Box>
            </Box>
          </Box>
          <Box mt="1.2em" className={classes.linedRow}>
            <Box
              display={{ xs: 'block', sm: 'flex' }}
              mb="0.5em"
              justifyContent="flex-start"
            >
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Typography variant="body2" gutterBottom>
                  2
                </Typography>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Name">
                  <Typography variant="body2" gutterBottom>
                    Red-tailed black cockatoo
                  </Typography>
                </Labeled>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Name type">
                  <Typography variant="body2" gutterBottom>
                    Common
                  </Typography>
                </Labeled>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Language">
                  <Typography variant="body2" gutterBottom>
                    English
                  </Typography>
                </Labeled>
              </Box>
              <Box mr={{ xs: 0, sm: '1em' }}>
                <Labeled label="Preferred">
                  <Typography variant="body2" gutterBottom>
                    Enabled
                  </Typography>
                </Labeled>
              </Box>
            </Box>
          </Box>
        </Tab>
        <Tab label="Details" className={classes.bold}>
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
            <Typography variant="h5" className={classes.bold} gutterBottom>
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
        <Tab label="Heirarchy" className={classes.bold}></Tab>
        <Tab label="Cross References" className={classes.bold}></Tab>
        <Tab label="Notes" className={classes.bold}>
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
