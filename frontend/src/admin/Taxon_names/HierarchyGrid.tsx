import React, { Fragment, PropsWithChildren, useState } from 'react';
import {
  BooleanField,
  Datagrid,
  Loading,
  RichTextField,
  TextField,
  useGetList,
  useRecordContext,
} from 'react-admin';
import { TablePagination } from '@mui/material';
import { GlobalTheme } from '../../GlobalTheme';
import { hierarchyRowClick } from './HierarchyRowClick';
export interface HierarchyRecord {
  id: number;
  taxon_name_id: number;
  path?: [string];
}
// Based off of https://marmelab.com/react-admin/doc/3.19/List.html#rendering-datagrid-with-a-custom-query
export function HierarchyGrid(props: PropsWithChildren<{}>) {
  const record: HierarchyRecord = useRecordContext();
  const globalClasses = GlobalTheme();

  let hierarchyFilter: {
    taxon_name___scientific_name__gt: string;
    path__in_tree?: [string];
  } = { taxon_name___scientific_name__gt: '' };
  let recordId: number = 0;
  if (record?.path) {
    hierarchyFilter.path__in_tree = record.path;
    recordId = record.id;
  }
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [sort, setSort] = useState({ field: 'path', order: 'ASC' });
  const {
    data = [],
    total = 0,
    isLoading,
    error,
  } = useGetList('hierarchies', {
    pagination: { page, perPage },
    sort,
    filter: hierarchyFilter,
  });
  const rowStyle = (record: HierarchyRecord) => ({
    backgroundColor: record.taxon_name_id == recordId ? 'lightgrey' : 'inherit',
  });
  const formatError = (value: any): string => {
    if (!value) return 'Unknown error';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === 'string') return item;
          if (
            item &&
            typeof item === 'object' &&
            typeof item.msg === 'string'
          ) {
            return item.msg;
          }
          return JSON.stringify(item);
        })
        .join('\n');
    }
    if (value && typeof value === 'object') {
      if (typeof value.message === 'string') return value.message;
      if (Array.isArray(value.message)) return formatError(value.message);
      if (Array.isArray(value.detail)) return formatError(value.detail);
      if (typeof value.msg === 'string') return value.msg;
      return JSON.stringify(value);
    }
    return String(value);
  };
  if (isLoading) {
    return <Loading />;
  }
  if (error) {
    return <p>ERROR: {formatError(error)}</p>;
  }
  return (
    <Fragment>
      <Datagrid
        bulkActionButtons={false}
        rowClick={hierarchyRowClick}
        rowStyle={rowStyle}
        className={globalClasses.equalColumnWidth}
        data={data}
        sort={sort}
        setSort={(nextSort: any) => setSort(nextSort)}
      >
        <TextField
          source="rank_name"
          sortBy="taxon_name___taxon_rank___rank_name"
          label="Rank"
        />
        <RichTextField
          source="taxon_name.formatted_scientific_name"
          label="Scientific name"
          sortBy="taxon_name___scientific_name"
        />
        <BooleanField
          source="taxon_name.is_current"
          label="Is current"
          sortBy="taxon_name___is_current"
        />

        <TextField
          source="taxon_name.all_vernaculars"
          label="Vernaculars"
          sortBy="taxon_name___all_vernaculars"
        ></TextField>
      </Datagrid>
      <TablePagination
        component="div"
        count={total}
        page={Math.max(page - 1, 0)}
        onPageChange={(_event, newPage) => setPage(newPage + 1)}
        rowsPerPage={perPage}
        onRowsPerPageChange={(event) => {
          const nextPerPage = parseInt(event.target.value, 10);
          setPerPage(nextPerPage);
          setPage(1);
        }}
        rowsPerPageOptions={[50, 100, 200, 500, 1000]}
      />
    </Fragment>
  );
}
