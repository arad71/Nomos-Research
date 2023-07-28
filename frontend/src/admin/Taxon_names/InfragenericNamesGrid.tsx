import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { InfragengerenicData } from './TaxonTypes';

export const InfragenericNamesGrid = (props: {
  props: React.PropsWithChildren<{}>;
  id: number;
  infraData:
    | never[]
    | [
        {
          id: number;
          name_version: string;
          formatted_name: string;
          author: string;
          formatted_name_with_author: string;
          contributing_taxon_names: [[number, string]];
        }
      ];
}) => {
  return (
    <div>
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name Version</TableCell>
              <TableCell align="right">Formatted Name</TableCell>
              <TableCell align="right">Author</TableCell>
              <TableCell align="right">Formatted Name with Author</TableCell>
              <TableCell align="right">Contributing Taxon Names</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.infraData
              ? props.infraData.map((row: InfragengerenicData) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      {row.name_version}
                    </TableCell>
                    <TableCell align="right">{row.formatted_name}</TableCell>
                    <TableCell align="right">{row.author}</TableCell>
                    <TableCell align="right">
                      {row.formatted_name_with_author}
                    </TableCell>
                    <TableCell align="right">
                      {row.contributing_taxon_names.map(
                        (item: [number, string], index: number) => {
                          return (
                            <span>
                              {item[1]}
                              {index + 1 <
                                row.contributing_taxon_names.length && ', '}
                            </span>
                          );
                        }
                      )}
                    </TableCell>
                  </TableRow>
                ))
              : 'No Subgenera Names exist'}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
