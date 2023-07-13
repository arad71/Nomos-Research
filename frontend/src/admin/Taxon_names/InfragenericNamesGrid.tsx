import React from 'react';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchStart, fetchEnd, useNotify } from 'react-admin';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

export const InfragenericNamesGrid = (props: {
  props: React.PropsWithChildren<{}>;
  id: number;
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [gridData, setGridData] = useState([]);
  useEffect(() => {
    setLoading(true);
    dispatch(fetchStart());
    fetch(`/api/v1/taxon_names_infrageneric_names/${props.id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    })
      .then((r) => {
        return r.json();
      })
      .then((data) => {
        setGridData(data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
        dispatch(fetchEnd());
      });
  }, [props.id]);

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error) {
    return <span>There was an issue loading Infrageneric Names</span>;
  }

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
              <TableCell align="right">Contributing Taxons</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gridData.map(
              (row: {
                id: number;
                name_version: string;
                formatted_name: string;
                author: string;
                formatted_name_with_author: string;
                contributing_taxons: [[number, string]];
              }) => (
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
                    {row.contributing_taxons.map((item: [number, string]) => {
                      return (
                        <span>
                          {item[1]} {'\n'}
                        </span>
                      );
                    })}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
