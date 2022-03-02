import {useRecordContext} from "react-admin";
import React from "react";

const FullNameField = (props: any) => {
    const record = useRecordContext(props);

    return (
      <span>
        {record.first_name} {record.last_name}
      </span>
  );
};

FullNameField.defaultProps = { label: 'Name' };

export default FullNameField;
