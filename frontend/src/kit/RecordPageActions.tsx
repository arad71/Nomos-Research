import * as React from 'react';
import { CanAccess } from 'react-admin';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

type RecordPageActionsProps = {
  listTo: string;
  showTo?: string | null;
  editTo?: string | null;
  showResource?: string;
  editResource?: string;
  resource: string;
  extra?: React.ReactNode;
};

const RecordPageActions = ({
  listTo,
  showTo,
  editTo,
  showResource,
  editResource,
  resource,
  extra,
}: RecordPageActionsProps) => (
  <div className="flex items-center gap-2">
    {extra}
    <Button asChild variant="outline">
      <Link to={listTo}>Back to list</Link>
    </Button>
    {showTo ? (
      <CanAccess resource={showResource ?? resource} action="show">
        <Button asChild variant="outline">
          <Link to={showTo}>Show</Link>
        </Button>
      </CanAccess>
    ) : null}
    {editTo ? (
      <CanAccess resource={editResource ?? resource} action="edit">
        <Button asChild variant="outline">
          <Link to={editTo}>Edit</Link>
        </Button>
      </CanAccess>
    ) : null}
  </div>
);

export default RecordPageActions;
