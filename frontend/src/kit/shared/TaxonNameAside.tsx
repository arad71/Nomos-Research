import React from 'react';
import Aside from './Aside';
import TaxonNameInformalGroups from '../taxon-names/TaxonNameInformalGroups';
import TaxonNameConscode from '../taxon-names/TaxonNameConscode';
import TaxonHierarchy from '../taxon-names/TaxonHierarchy';

const TaxonNameAside = (props: any) => (
  <>
    <Aside />
    <TaxonNameInformalGroups />
    <TaxonNameConscode />
    <TaxonHierarchy {...props} />
  </>
);

export default TaxonNameAside;
