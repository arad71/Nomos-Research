import { RichTextField } from 'react-admin';
import React from 'react';
import { TaxonNameStatus } from './TaxonNameStatus';

export const FormattedScientificNameWithStatus = () => (
  <>
    <RichTextField source="formatted_scientific_name" />
    <TaxonNameStatus />
  </>
);
