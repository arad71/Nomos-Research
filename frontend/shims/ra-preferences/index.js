const React = require('react');
const Button = require('@mui/material/Button').default;
const Menu = require('@mui/material/Menu').default;
const MenuItem = require('@mui/material/MenuItem').default;
const Checkbox = require('@mui/material/Checkbox').default;
const ListItemText = require('@mui/material/ListItemText').default;
const ViewColumnIcon = require('@mui/icons-material/ViewColumn').default;

const resolveHook = (moduleExports, hookName) => {
  if (!moduleExports) {
    return undefined;
  }
  if (typeof moduleExports[hookName] === 'function') {
    return moduleExports[hookName];
  }
  if (
    moduleExports.default &&
    typeof moduleExports.default[hookName] === 'function'
  ) {
    return moduleExports.default[hookName];
  }
  if (
    moduleExports.raCore &&
    typeof moduleExports.raCore[hookName] === 'function'
  ) {
    return moduleExports.raCore[hookName];
  }
  return undefined;
};

const getRaHook = (hookName) => {
  let hook;
  try {
    const raCore = require('ra-core');
    hook = resolveHook(raCore, hookName);
  } catch (error) {
    hook = undefined;
  }
  if (typeof hook !== 'function') {
    const ra = require('react-admin');
    hook = resolveHook(ra, hookName);
  }
  return typeof hook === 'function' ? hook : undefined;
};

const readPreference = (key, defaultValue) => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const raw = window.localStorage.getItem(key);
  if (raw == null) {
    return defaultValue;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return raw;
  }
};

const usePreferences = (key, defaultValue) => {
  const useStore = getRaHook('useStore');
  if (useStore) {
    return useStore(key, defaultValue);
  }

  const [value, setValue] = React.useState(() =>
    readPreference(key, defaultValue)
  );

  React.useEffect(() => {
    setValue(readPreference(key, defaultValue));
  }, [key, defaultValue]);

  const setPreference = React.useCallback(
    (nextValue) => {
      const resolvedValue =
        typeof nextValue === 'function' ? nextValue(value) : nextValue;
      setValue(resolvedValue);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(resolvedValue));
      }
    },
    [key, value]
  );

  return [value, setPreference];
};

const useRemoveFromStore = (key) => {
  const hook = getRaHook('useRemoveFromStore');
  if (hook) {
    return hook(key);
  }
  return React.useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  }, [key]);
};

const useResetStore = () => {
  const hook = getRaHook('useResetStore');
  if (hook) {
    return hook();
  }
  return React.useCallback(() => undefined, []);
};

const normalizeSelectedColumns = (selectedColumns, defaultColumns) => {
  if (Array.isArray(selectedColumns)) {
    return selectedColumns.length > 0 ? selectedColumns : defaultColumns;
  }

  if (
    selectedColumns &&
    typeof selectedColumns === 'object' &&
    Array.isArray(selectedColumns.columns)
  ) {
    return selectedColumns.columns.length > 0
      ? selectedColumns.columns
      : defaultColumns;
  }

  if (typeof selectedColumns === 'string') {
    try {
      const parsed = JSON.parse(selectedColumns);
      if (Array.isArray(parsed)) {
        return parsed.length > 0 ? parsed : defaultColumns;
      }
      if (parsed && Array.isArray(parsed.columns)) {
        return parsed.columns.length > 0 ? parsed.columns : defaultColumns;
      }
    } catch (error) {
      const split = selectedColumns
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);
      return split.length > 0 ? split : defaultColumns;
    }
  }

  return defaultColumns;
};

const useSelectedColumns = ({ preferences, columns, omit = [] }) => {
  const defaultColumns = Object.keys(columns).filter(
    (columnName) => !omit.includes(columnName)
  );
  const [selectedColumns] = usePreferences(preferences, defaultColumns);
  const normalizedColumns = normalizeSelectedColumns(
    selectedColumns,
    defaultColumns
  );
  return normalizedColumns
    .map((columnName) => columns[columnName])
    .filter(Boolean);
};

const SelectColumnsButton = ({ preference, columns, label = 'Select columns' }) => {
  const allColumnNames = Object.keys(columns || {});
  const [selectedColumns, setSelectedColumns] = usePreferences(
    preference,
    allColumnNames
  );
  const normalizedColumns = normalizeSelectedColumns(
    selectedColumns,
    allColumnNames
  );
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const toggleColumn = (columnName) => {
    const nextColumns = normalizedColumns.includes(columnName)
      ? normalizedColumns.filter((name) => name !== columnName)
      : normalizedColumns.concat(columnName);

    setSelectedColumns(nextColumns.length > 0 ? nextColumns : allColumnNames);
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      Button,
      {
        onClick: (event) => setAnchorEl(event.currentTarget),
        startIcon: React.createElement(ViewColumnIcon, null),
      },
      label
    ),
    React.createElement(
      Menu,
      {
        anchorEl,
        open,
        onClose: () => setAnchorEl(null),
      },
      allColumnNames.map((columnName) =>
        React.createElement(
          MenuItem,
          {
            key: columnName,
            onClick: () => toggleColumn(columnName),
            dense: true,
          },
          React.createElement(Checkbox, {
            checked: normalizedColumns.includes(columnName),
            size: 'small',
          }),
          React.createElement(ListItemText, {
            primary: columnName.replace(/_/g, ' '),
          })
        )
      )
    )
  );
};

module.exports = {
  SelectColumnsButton,
  usePreferences,
  useSelectedColumns,
  useRemoveFromStore,
  useResetStore,
};
