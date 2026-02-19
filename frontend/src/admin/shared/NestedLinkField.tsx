import * as React from 'react';
import { Link, useCreatePath, useRecordContext } from 'react-admin';
import type { RaRecord } from 'ra-core';

export interface NestedFieldPropType {
  reference: string;
  source: string;
  idKey: string;
  labelKey: string;
  record?: RaRecord;
  [key: string]: any;
}
const NestedLinkField = (props: NestedFieldPropType) => {
  const record = useRecordContext(props);
  const createPath = useCreatePath();
  const { idKey, labelKey, source, reference } = props;
  if (
    !record ||
    !record[source] ||
    !record[source][idKey] ||
    !record[source][labelKey]
  ) {
    return null;
  }
  const showPage = createPath({
    resource: reference,
    id: record[source][idKey],
    type: 'show',
  });
  return <Link to={showPage}>{record[source][labelKey]}</Link>;
};

export default NestedLinkField;
