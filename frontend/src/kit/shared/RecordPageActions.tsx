import * as React from 'react';
import { CanAccess } from 'react-admin';
import { useRecordContext } from 'ra-core';
import { Link } from 'react-router-dom';
import { DeleteButton } from '@/components/admin/delete-button';
import { Button } from '../../components/ui/button';
import { HardDeleteButton } from '@/components/admin/hard-delete-button';
import { RestoreButton } from '@/components/admin/restore-button';
import { getRememberedListLocation } from './listNavigation';

type RecordPageActionsProps = {
  listTo: string;
  showTo?: string | null;
  editTo?: string | null;
  showResource?: string;
  editResource?: string;
  resource: string;
  extra?: React.ReactNode;
  restoreable?: boolean;
};

const RecordPageActions = ({
  listTo,
  showTo,
  editTo,
  showResource,
  editResource,
  resource,
  extra,
  restoreable = false,
}: RecordPageActionsProps) => {
  const record = useRecordContext<{ deleted?: boolean | null }>();
  const resolvedListTo = React.useMemo(
    () => getRememberedListLocation(listTo),
    [listTo]
  );

  return (
    <div className="flex items-center gap-2">
      {!record?.deleted ? <DeleteButton resource={resource} redirect={resolvedListTo} /> : null}
      {restoreable && record?.deleted ? <RestoreButton resource={resource} /> : null}
      {restoreable && record?.deleted ? (
        <HardDeleteButton resource={resource} redirectTo={resolvedListTo} />
      ) : null}
      {extra}
      <Button asChild variant="outline">
        <Link to={resolvedListTo}>Back to list</Link>
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
};

export default RecordPageActions;
