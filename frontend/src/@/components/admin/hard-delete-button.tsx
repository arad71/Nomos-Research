import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { fetchUtils } from 'react-admin';
import {
  useCanAccess,
  useGetRecordRepresentation,
  useNotify,
  useRecordContext,
  useResourceContext,
  useResourceTranslation,
  useTranslate,
} from 'ra-core';
import { humanize, singularize } from 'inflection';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../../config';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  alertDialogCancelClassName,
} from '@/components/ui/alert-dialog';

type HardDeleteButtonProps = {
  label?: string;
  resource?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  redirectTo: string;
};

export const HardDeleteButton = (props: HardDeleteButtonProps) => {
  const {
    label: labelProp,
    className = 'cursor-pointer border-destructive! text-destructive! hover:bg-destructive/10! focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
    size,
    redirectTo,
  } = props;
  const record = useRecordContext<{ id?: string | number; deleted?: boolean | null }>(props);
  const resource = useResourceContext(props);
  const notify = useNotify();
  const navigate = useNavigate();
  const translate = useTranslate();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [doubleConfirmOpen, setDoubleConfirmOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const { canAccess, isPending: isAccessPending } = useCanAccess({
    resource,
    action: 'harddelete',
  });

  const getRecordRepresentation = useGetRecordRepresentation(resource);
  let recordRepresentation = getRecordRepresentation(record);
  if (React.isValidElement(recordRepresentation)) {
    recordRepresentation = `#${record?.id}`;
  }

  const resourceName = translate(`resources.${resource}.forcedCaseName`, {
    smart_count: 1,
    _: humanize(
      translate(`resources.${resource}.name`, {
        smart_count: 1,
        _: resource ? singularize(resource) : undefined,
      }),
      true,
    ),
  });

  const label = useResourceTranslation({
    resourceI18nKey: `resources.${resource}.action.hard_delete`,
    baseI18nKey: 'ra.action.delete',
    options: {
      name: resourceName,
      recordRepresentation,
    },
    userText: labelProp ?? 'Hard delete',
  });

  const firstConfirmationMessage = `Permanently delete ${
    recordRepresentation ? `"${recordRepresentation}"` : `this ${resourceName}`
  }?`;
  const secondConfirmationMessage =
    'This cannot be undone and will permanently remove the record from the system.';

  const handleHardDelete = React.useCallback(async () => {
    if (record?.id == null) {
      return;
    }

    setIsPending(true);
    try {
      const headers = new Headers({ Accept: 'application/json' });
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      await fetchUtils.fetchJson(`${BACKEND_URL}/${resource}/${record.id}/hard`, {
        method: 'DELETE',
        headers,
      });

      notify(
        `${resourceName}${recordRepresentation ? ` "${recordRepresentation}"` : ''} permanently deleted`,
        { type: 'success' },
      );
      setDoubleConfirmOpen(false);
      navigate(redirectTo);
    } catch (error: any) {
      notify(error?.message || 'Failed to hard delete record', { type: 'error' });
    } finally {
      setIsPending(false);
    }
  }, [navigate, notify, record, recordRepresentation, redirectTo, resource, resourceName]);

  if (isAccessPending || !canAccess || !record?.deleted) {
    return null;
  }

  return (
    <>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Button
          variant="outline"
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={isPending}
          aria-label={typeof label === 'string' ? label : 'Hard delete'}
          size={size}
          className={className}
        >
          <Trash2 />
          {label}
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm hard delete</AlertDialogTitle>
            <AlertDialogDescription>{firstConfirmationMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={alertDialogCancelClassName}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="inline-flex h-10 items-center justify-center rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/20"
              onClick={() => {
                setConfirmOpen(false);
                setDoubleConfirmOpen(true);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={doubleConfirmOpen} onOpenChange={setDoubleConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Final confirmation</AlertDialogTitle>
            <AlertDialogDescription>{secondConfirmationMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={alertDialogCancelClassName}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="inline-flex h-10 items-center justify-center rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/20"
              onClick={handleHardDelete}
            >
              Permanently delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
