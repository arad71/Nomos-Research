import { useCanAccess } from 'react-admin';

export function useCanBulkDelete() {
  return useCanAccess({
    action: 'bulkdelete',
    resource: '*',
  }).canAccess;
}
