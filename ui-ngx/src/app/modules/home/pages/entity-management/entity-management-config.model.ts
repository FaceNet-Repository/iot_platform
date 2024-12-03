export type EntityManagementConfig = {
  title: string;
  entityType: 'DEVICE' | 'ASSET';
  entityProfileType: string;
  latestTelemetries: string[];
  serverScopeAttributes: string[];
  clientScopeAttributes: string[];
  sharedScopeAttributes: string[];
  displayedColumns: string[];
  tableConfig: {
    displayedColumns: string[];
    columns: {
      key: string;
      label: string;
      cellType: 'index' | 'text' | 'datetime' | 'badge' | 'actions';
    }[];
  };
};
