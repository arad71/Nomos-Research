import * as React from 'react';
import { CanAccess } from 'react-admin';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

type RecordActionButtonsProps = {
  resource: string;
  showTo?: string;
  editTo?: string;
  className?: string;
};

const RecordActionButtons = ({
  resource,
  showTo,
  editTo,
  className,
}: RecordActionButtonsProps) => (
  <div className={cn('flex justify-end gap-2', className)}>
    {showTo ? (
      <CanAccess resource={resource} action="show">
        <Button asChild variant="outline" size="sm">
          <Link to={showTo}>Show</Link>
        </Button>
      </CanAccess>
    ) : null}
    {editTo ? (
      <CanAccess resource={resource} action="edit">
        <Button asChild size="sm">
          <Link to={editTo}>Edit</Link>
        </Button>
      </CanAccess>
    ) : null}
  </div>
);

export default RecordActionButtons;
