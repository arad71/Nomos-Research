import React from 'react';
import { Box, Card, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import RadioButtonUncheckedOutlinedIcon from '@material-ui/icons/RadioButtonUncheckedOutlined';
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
        <RadioButtonUncheckedOutlinedIcon />
        <Box borderLeft="2px solid #777" marginLeft="-0.8em" paddingLeft="1em">
          <Labeled label="Kingdom">
            <Typography variant="body2" gutterBottom>
              WA Museum Welshpool
            </Typography>
          </Labeled>
        </Box>
      </Box>
      <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
        <RadioButtonUncheckedOutlinedIcon />
        <Box borderLeft="2px solid #777" marginLeft="-0.8em" paddingLeft="1em">
          <Labeled label="Type specimen location">
            <Typography variant="body2" gutterBottom>
              WA Museum Welshpool
            </Typography>
          </Labeled>
        </Box>
      </Box>
      <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
        <RadioButtonUncheckedOutlinedIcon />
        <Box borderLeft="2px solid #777" marginLeft="-0.8em" paddingLeft="1em">
          <Labeled label="Type specimen location">
            <Typography variant="body2" gutterBottom>
              WA Museum Welshpool
            </Typography>
          </Labeled>
        </Box>
      </Box>
      <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
        <RadioButtonUncheckedOutlinedIcon />
        <Box borderLeft="2px solid #777" marginLeft="-0.8em" paddingLeft="1em">
          <Labeled label="Type specimen location">
            <Typography variant="body2" gutterBottom>
              WA Museum Welshpool
            </Typography>
          </Labeled>
        </Box>
      </Box>
      <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
        <RadioButtonUncheckedOutlinedIcon />
        <Box borderLeft="2px solid #777" marginLeft="-0.8em" paddingLeft="1em">
          <Labeled label="Type specimen location">
            <Typography variant="body2" gutterBottom>
              WA Museum Welshpool
            </Typography>
          </Labeled>
        </Box>
      </Box>
      <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
        <RadioButtonUncheckedOutlinedIcon />
        <Box borderLeft="2px solid #777" marginLeft="-0.8em" paddingLeft="1em">
          <Labeled label="Type specimen location">
            <Typography variant="body2" gutterBottom>
              WA Museum Welshpool
            </Typography>
          </Labeled>
        </Box>
      </Box>
      <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
        <RadioButtonUncheckedOutlinedIcon />
        <Box marginLeft="-0.8em" paddingLeft="1em">
          <Labeled label="Type specimen location">
            <Typography variant="body2" gutterBottom>
              WA Museum Welshpool
            </Typography>
          </Labeled>
        </Box>
      </Box>
    </Box>
  );
};

export default TaxonHierarchy;
