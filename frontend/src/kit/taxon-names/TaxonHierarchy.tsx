import React from 'react';
import {
  Datagrid,
  ReferenceField,
  ReferenceManyField,
  RichTextField,
  TextField,
  useRecordContext,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { hierarchyCodeRowClick, hierarchyRowClick } from './HierarchyRowClick';

const TaxonHierarchy = () => {
  const record = useRecordContext();
  const currentURL = window.location.href;
  const splitUrl = currentURL.split('/');
  const sourcecode = splitUrl[4] === 'taxon_names_code' ? true : null;

  let source = null;
  if (record?.path) {
    source = Object.prototype.hasOwnProperty.call(record.path, 'path') ? 'path.path' : 'path';
  }

  return (
    <Box mt="1.2em">
      <Box mt="2.2em">
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Taxon Hierarchy
        </Typography>
      </Box>
      {source && (
        <ReferenceManyField
          reference="hierarchies"
          target="path__ancestor_of"
          source={source}
          sort={{ field: 'path', order: 'ASC' }}
          perPage={25}
        >
          <>
            {sourcecode && (
              <Datagrid
                bulkActionButtons={false}
                rowClick={hierarchyCodeRowClick}
              >
                <TextField
                  source="rank_name"
                  sortBy="taxon_name___taxon_rank___rank_name"
                  label="Rank"
                />
                <ReferenceField
                  source="taxon_name_id"
                  reference="taxon_names"
                  link={false}
                  sortBy="taxon_name___scientific_name"
                >
                  <RichTextField source="formatted_scientific_name" />
                </ReferenceField>
              </Datagrid>
            )}

            {!sourcecode && (
              <Datagrid bulkActionButtons={false} rowClick={hierarchyRowClick}>
                <TextField
                  source="rank_name"
                  sortBy="taxon_name___taxon_rank___rank_name"
                  label="Rank"
                />
                <ReferenceField
                  source="taxon_name_id"
                  reference="taxon_names"
                  link={false}
                  sortBy="taxon_name___scientific_name"
                >
                  <RichTextField source="formatted_scientific_name" />
                </ReferenceField>
              </Datagrid>
            )}
          </>
        </ReferenceManyField>
      )}
    </Box>
  );
};

export default TaxonHierarchy;
