import React from 'react';
import { Box, Card, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Circle from '@material-ui/icons/RadioButtonUncheckedOutlined';
import { Labeled } from 'react-admin';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold',
  },
});

const TaxonHierarchy = () => {
  const classes = useStyles();
  return (
    <Box mt="1.2em">
      <Box mt="2.2em">
        <Typography variant="h5" className={classes.bold} gutterBottom>
          Taxon Hierarchy (placeholder section)
        </Typography>
      </Box>
      <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
        <Circle fontSize="small" />
        <Box
          borderLeft="2px solid #777"
          marginLeft="-0.65em"
          marginTop="0.2em"
          paddingLeft="1em"
        >
          <Labeled label="Kingdom">
            <Typography variant="body2" gutterBottom>
              Animalia
            </Typography>
          </Labeled>
        </Box>
      </Box>
      <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
        <Circle fontSize="small" />
        <Box borderLeft="2px solid #777" marginLeft="-0.65em" paddingLeft="1em">
          <Labeled label="Phylum">
            <Typography variant="body2" gutterBottom>
              Chordata
            </Typography>
          </Labeled>
        </Box>
      </Box>
      <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
        <Circle fontSize="small" />
        <Box borderLeft="2px solid #777" marginLeft="-0.65em" paddingLeft="1em">
          <Labeled label="Class">
            <Typography variant="body2" gutterBottom>
              Aves
            </Typography>
          </Labeled>
        </Box>
      </Box>
      <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
        <Circle fontSize="small" />
        <Box borderLeft="2px solid #777" marginLeft="-0.65em" paddingLeft="1em">
          <Labeled label="Order">
            <Typography variant="body2" gutterBottom>
              Psittaciformes
            </Typography>
          </Labeled>
        </Box>
      </Box>
      <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
        <Circle fontSize="small" />
        <Box borderLeft="2px solid #777" marginLeft="-0.65em" paddingLeft="1em">
          <Labeled label="Family">
            <Typography variant="body2" gutterBottom>
              Cacatuidae
            </Typography>
          </Labeled>
        </Box>
      </Box>
      <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
        <Circle fontSize="small" />
        <Box borderLeft="2px solid #777" marginLeft="-0.65em" paddingLeft="1em">
          <Labeled label="Genus">
            <Typography variant="body2" gutterBottom>
              Calyptorhynchus
            </Typography>
          </Labeled>
        </Box>
      </Box>
      <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
        <Circle fontSize="small" />
        <Box marginLeft="-0.65em" paddingLeft="1em">
          <Labeled label="Species">
            <Typography variant="body2" gutterBottom>
              banksii
            </Typography>
          </Labeled>
        </Box>
      </Box>
    </Box>
  );
};

export default TaxonHierarchy;
