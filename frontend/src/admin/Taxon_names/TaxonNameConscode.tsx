import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {
  Labeled,
  ReferenceField,
  ChipField,
  ReferenceManyField,
  SingleFieldList,
  Datagrid,
  TextField,
  FunctionField,
} from 'react-admin';
import {
  ConservationShort,
  ConservationShortPillAdd,
} from '../Conservation_codes';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold',
  },
  pill: {
    background: 'rgba(44, 83, 49, 0.2)',
    borderRadius: '1rem',
    padding: '0.3rem 1rem',
    marginRight: '0.3rem',
    textWrap: 'nowrap',
  },
});

const TaxonNameConscode = () => {
  const classes = useStyles();
  return (
    <Box mt="1.2em">
      <Box mt="2.2em">
        <Typography variant="h5" className={classes.bold} gutterBottom>
          Conservation Code
        </Typography>
      </Box>
      <>
        <ReferenceManyField
          reference="conscode_taxons"
          target="taxon_name_id"
          sort={{
            field: 'conservation_code___code_priority',
            order: 'ASC',
          }}
          filter={{ effective_to: null }}
        >
          <SingleFieldList>
            <ReferenceField
              source="conservation_code_id"
              reference="conservation_codes"
              link={false}
              allowEmpty
            >
              <div className={classes.pill}>
                <FunctionField
                  label="test"
                  render={(record: any) => (
                    // eslint-disable-next-line
                    <ConservationShort source="record.conservation_code_id" />
                  )}
                />
              </div>
            </ReferenceField>
          </SingleFieldList>
        </ReferenceManyField>
        <ConservationShortPillAdd />
      </>
    </Box>
  );
};

export default TaxonNameConscode;
