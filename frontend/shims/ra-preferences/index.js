const React = require('react');
const { useStore } = require('react-admin');
const Button = require('@mui/material/Button').default;
const Menu = require('@mui/material/Menu').default;
const MenuItem = require('@mui/material/MenuItem').default;
const Checkbox = require('@mui/material/Checkbox').default;
const ListItemText = require('@mui/material/ListItemText').default;
const ViewColumnIcon = require('@mui/icons-material/ViewColumn').default;

const usePreferences = (key, defaultValue) => useStore(key, defaultValue);

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
  const [selectedColumns] = useStore(preferences, defaultColumns);
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
  const [selectedColumns, setSelectedColumns] = useStore(
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
};
