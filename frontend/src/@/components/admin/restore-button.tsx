import * as React from 'react';
import { RotateCcw } from 'lucide-react';
import { fetchUtils } from 'react-admin';
import {
  useCanAccess,
  useGetRecordRepresentation,
  useNotify,
  useRecordContext,
  useRefresh,
  useResourceContext,
  useResourceTranslation,
  useTranslate,
} from 'ra-core';
import { humanize, singularize } from 'inflection';
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

type RestoreButtonProps = {
  label?: string;
  resource?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

export const RestoreButton = (props: RestoreButtonProps) => {
  const {
    label: labelProp,
    className = 'cursor-pointer border-sky-600! text-sky-700! hover:bg-sky-50! focus-visible:ring-sky-200 dark:text-sky-300!',
    size,
  } = props;
  const record = useRecordContext<{ id?: string | number; deleted?: boolean | null }>(props);
  const resource = useResourceContext(props);
  const refresh = useRefresh();
  const notify = useNotify();
  const translate = useTranslate();
  const [open, setOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const { canAccess, isPending: isAccessPending } = useCanAccess({
    resource,
    action: 'restore',
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
    resourceI18nKey: `resources.${resource}.action.restore`,
    baseI18nKey: 'ra.action.undo',
    options: {
      name: resourceName,
      recordRepresentation,
    },
    userText: labelProp ?? 'Restore',
  });

  const confirmationMessage = `Restore ${
    recordRepresentation ? `"${recordRepresentation}"` : `this ${resourceName}`
  }?`;

  const handleRestore = React.useCallback(async () => {
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

      await fetchUtils.fetchJson(`${BACKEND_URL}/${resource}/${record.id}/restore`, {
        method: 'POST',
        headers,
      });

      notify(
        `${resourceName}${recordRepresentation ? ` "${recordRepresentation}"` : ''} restored`,
        { type: 'success' },
      );
      setOpen(false);
      refresh();
    } catch (error: any) {
      notify(error?.message || 'Failed to restore record', { type: 'error' });
    } finally {
      setIsPending(false);
    }
  }, [notify, record, recordRepresentation, refresh, resource, resourceName]);

  if (isAccessPending || !canAccess || !record?.deleted) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        aria-label={typeof label === 'string' ? label : 'Restore'}
        size={size}
        className={className}
      >
        <RotateCcw />
        {label}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm restore</AlertDialogTitle>
          <AlertDialogDescription>{confirmationMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className={alertDialogCancelClassName}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="inline-flex h-10 items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
            onClick={handleRestore}
          >
            Restore
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
