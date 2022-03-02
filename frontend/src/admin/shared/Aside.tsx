import { Typography } from '@material-ui/core';
import {ReferenceField, DateField} from 'react-admin';
import FullNameField from './FullNameField'

const Aside = () => (
  <div style={{ width: 200, margin: '1em' }}>
    <Typography variant="h6">Record Details</Typography>
    <Typography variant="body1">
      <div>
        Created:
      </div>
      <ReferenceField source="created_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <br/>
      <DateField source="created_on" showTime />
      <div>
        Updated:
      </div>
      <ReferenceField source="updated_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <br/>
      <DateField source="updated_on" showTime />
    </Typography>
  </div>
);

export default Aside;
