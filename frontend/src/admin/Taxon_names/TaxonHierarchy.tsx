import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Card, TextField, Typography } from '@material-ui/core';
import RadioButtonUncheckedOutlinedIcon from '@material-ui/icons/RadioButtonUncheckedOutlined';
import { Labeled } from 'react-admin';

const TaxonHierarchy = () => {
  const location = useLocation();
  const currPath = location.pathname.split('/')[1];
  const isTaxonNames = currPath == 'taxon_names';
  return (
    <div>
      <Box mt="1.2em">
        <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
          <RadioButtonUncheckedOutlinedIcon />
          <Box
            borderLeft="2px solid #777"
            marginLeft="-0.8em"
            paddingLeft="1em"
          >
            <Labeled label="Kingdom">
              <Typography variant="body2" gutterBottom>
                WA Museum Welshpool
              </Typography>
            </Labeled>
          </Box>
        </Box>
        <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
          <RadioButtonUncheckedOutlinedIcon />
          <Box
            borderLeft="2px solid #777"
            marginLeft="-0.8em"
            paddingLeft="1em"
          >
            <Labeled label="Type specimen location">
              <Typography variant="body2" gutterBottom>
                WA Museum Welshpool
              </Typography>
            </Labeled>
          </Box>
        </Box>
        <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
          <RadioButtonUncheckedOutlinedIcon />
          <Box
            borderLeft="2px solid #777"
            marginLeft="-0.8em"
            paddingLeft="1em"
          >
            <Labeled label="Type specimen location">
              <Typography variant="body2" gutterBottom>
                WA Museum Welshpool
              </Typography>
            </Labeled>
          </Box>
        </Box>
        <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
          <RadioButtonUncheckedOutlinedIcon />
          <Box
            borderLeft="2px solid #777"
            marginLeft="-0.8em"
            paddingLeft="1em"
          >
            <Labeled label="Type specimen location">
              <Typography variant="body2" gutterBottom>
                WA Museum Welshpool
              </Typography>
            </Labeled>
          </Box>
        </Box>
        <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
          <RadioButtonUncheckedOutlinedIcon />
          <Box
            borderLeft="2px solid #777"
            marginLeft="-0.8em"
            paddingLeft="1em"
          >
            <Labeled label="Type specimen location">
              <Typography variant="body2" gutterBottom>
                WA Museum Welshpool
              </Typography>
            </Labeled>
          </Box>
        </Box>
        <Box display={{ xs: 'block', sm: 'flex' }} justifyContent="flex-start">
          <RadioButtonUncheckedOutlinedIcon />
          <Box
            borderLeft="2px solid #777"
            marginLeft="-0.8em"
            paddingLeft="1em"
          >
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
    </div>
  );
};

export default TaxonHierarchy;
