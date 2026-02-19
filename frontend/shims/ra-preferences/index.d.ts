import * as React from 'react';

export type ListProps = Record<string, unknown>;

export declare const SelectColumnsButton: React.FC<any>;

export declare const usePreferences: <T = any>(
  key: string,
  defaultValue?: T
) => [T, (value: T) => void];

export declare const useRemoveFromStore: (key: string) => void;
export declare const useResetStore: () => void;

export declare const useSelectedColumns: (params: {
  preferences: string;
  columns: Record<string, React.ReactNode>;
  omit?: string[];
}) => React.ReactNode[];
