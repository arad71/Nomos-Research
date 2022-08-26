import React, { Fragment, PropsWithChildren, useState } from 'react';
import {
  BooleanField,
  Datagrid,
  Loading,
  Pagination,
  RichTextField,
  TextField,
  useQuery,
  useRecordContext,
} from 'react-admin';
import { GlobalTheme } from '../../GlobalTheme';
import { hierarchyRowClick } from './HierarchyRowClick';
import _ from 'lodash';
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
  const { data, total, loading, error } = useQuery({
    type: 'getList',
    resource: 'hierarchies',
    payload: {
      pagination: { page, perPage },
      sort,
      filter: hierarchyFilter,
    },
  });
  const rowStyle = (record: HierarchyRecord) => ({
    backgroundColor: record.taxon_name_id == recordId ? 'lightgrey' : 'inherit',
  });
  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <p>ERROR: {error}</p>;
  }
  return (
    <Fragment>
      <Datagrid
        rowClick={hierarchyRowClick}
        rowStyle={rowStyle}
        className={globalClasses.equalColumnWidth}
        data={_.keyBy(data, 'id')}
        ids={data.map(({ id }: { id: number }) => id)}
        currentSort={sort}
        setSort={(field: string, order: string) => setSort({ field, order })}
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
      <Pagination
        page={page}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
        total={total}
        rowsPerPageOptions={[50, 100, 200, 500, 1000]}
      />
    </Fragment>
  );
}
