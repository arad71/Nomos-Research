import { Datagrid, FunctionField, Loading, TextField } from 'react-admin';
import React, { PropsWithChildren } from 'react';
import { InfragenericData } from './TaxonTypes';
import useFetchInfragenericNames from './useFetchInfragenericNames';
import { Typography } from '@material-ui/core';

export const InfragenericNamesGrid = (props: PropsWithChildren<any>) => {
  const { loading, error, infragenericNames } = useFetchInfragenericNames(
    props.id
  );
  if (loading) return <Loading />;
  if (error) {
    return (
      <Typography className="colorError" variant="body1">
        No name formats found. You need to place the name in a hierarchy to
        generate name formats
      </Typography>
    );
  }
  const namesById = infragenericNames.infrageneric_names.reduce(
    (
      namesById: Record<number, InfragenericData>,
      current: InfragenericData
    ) => {
      namesById[current.id] = current;
      return namesById;
    },
    {}
  );
  const ids = Object.keys(namesById);

  return (
    <Datagrid
      data={namesById}
      currentSort={{ field: 'id', order: 'ASC' }}
      total={ids.length}
      ids={ids}
      loaded={!loading}
    >
      <TextField source="name_version" />
      <TextField source="formatted_name" />
      <TextField source="author" />
      <TextField source="formatted_name_with_author" />
      <FunctionField
        source="contributing_taxon_names"
        render={(record: InfragenericData) =>
          record.contributing_taxon_names.join(', ')
        }
      />
    </Datagrid>
  );
};
