import React from 'react';
import { Datagrid, TextField, useGetOne } from 'react-admin';

export const InfragenericNamesGrid = (props: {
  props: React.PropsWithChildren<{}>;
  id: number;
}) => {
  const { data, loading, error } = useGetOne(
    'taxon_names_infrageneric_names',
    props.id
  );

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <Datagrid data={[data]} currentSort={'name_version, ASC'}>
      <TextField source="name_version" />
      <TextField source="formatted_name" />
      <TextField source="author" />
      <TextField source="formatted_name_with_author" />
      <TextField source="info" />
    </Datagrid>
  );
};
