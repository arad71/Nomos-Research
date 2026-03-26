import React from 'react';
import Aside from './Aside';
import TaxonNameInformalGroups from '../../admin/Taxon_names/TaxonNameInformalGroups';
import TaxonNameConscode from '../../admin/Taxon_names/TaxonNameConscode';
import TaxonHierarchy from '../../admin/Taxon_names/TaxonHierarchy';

const TaxonNameAside = (props: any) => (
  <>
    <Aside />
    <TaxonNameInformalGroups />
    <TaxonNameConscode />
    <TaxonHierarchy {...props} />
  </>
);

export default TaxonNameAside;
