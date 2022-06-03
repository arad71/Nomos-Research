import { useCanAccess } from '@react-admin/ra-rbac';

export function useCanBulkDelete() {
  return useCanAccess({
    action: 'bulkdelete',
    resource: '*',
  }).canAccess;
}
