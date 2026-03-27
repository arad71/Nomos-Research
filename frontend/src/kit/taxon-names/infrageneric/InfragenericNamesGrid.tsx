import {
  Loading,
} from 'react-admin';
import React, { PropsWithChildren } from 'react';
import { InfragenericData } from './TaxonTypes';
import useFetchInfragenericNames from './useFetchInfragenericNames';
import { Typography } from '@mui/material';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  const rows = infragenericNames.infrageneric_names ?? [];

  if (rows.length === 0) {
    return (
      <Typography className="colorError" variant="body1">
        No name formats found. You need to place the name in a hierarchy to
        generate name formats
      </Typography>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name version</TableHead>
            <TableHead>Formatted name</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Formatted name with author</TableHead>
            <TableHead>Italicized name</TableHead>
            <TableHead>Contributing taxon names</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((record: InfragenericData) => (
            <TableRow key={record.id}>
              <TableCell>{record.name_version}</TableCell>
              <TableCell>{record.formatted_name}</TableCell>
              <TableCell>{record.author}</TableCell>
              <TableCell>{record.formatted_name_with_author}</TableCell>
              <TableCell>
                <span dangerouslySetInnerHTML={{ __html: record.italicized_name }} />
              </TableCell>
              <TableCell>{record.contributing_taxon_names.join(', ')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
