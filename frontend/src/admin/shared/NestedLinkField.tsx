import * as React from 'react';
import { Link, linkToRecord, useRecordContext } from 'react-admin';
import { PublicFieldProps } from 'ra-ui-materialui/src/field/types';

export interface NestedFieldPropType extends PublicFieldProps {
  reference: string;
  source: string;
  idKey: string;
  labelKey: string;
}
const NestedLinkField = (props: NestedFieldPropType) => {
  const record = useRecordContext(props);
  const { idKey, labelKey, source, reference } = props;
  const showPage = linkToRecord(`/${reference}`, record[source][idKey], 'show');
  return <Link to={showPage}>{record[source][labelKey]}</Link>;
};

NestedLinkField.defaultProps = {
  addLabel: true,
};
export default NestedLinkField;
