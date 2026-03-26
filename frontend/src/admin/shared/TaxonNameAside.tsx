import React from 'react';
import Aside from './Aside';
import TaxonNameInformalGroups from '../Taxon_names/TaxonNameInformalGroups';
import TaxonNameConscode from '../Taxon_names/TaxonNameConscode';
import TaxonHierarchy from '../Taxon_names/TaxonHierarchy';

const TaxonNameAside = (props: any) => (
  <>
    <Aside />
    <TaxonNameInformalGroups />
    <TaxonNameConscode />
    <TaxonHierarchy {...props} />
  </>
);

export default TaxonNameAside;
