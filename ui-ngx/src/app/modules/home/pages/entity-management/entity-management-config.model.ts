export type EntityManagementConfig = {
  title: string;
  entityType: 'DEVICE' | 'ASSET';
  entityProfileType: string;
  latestTelemetries: string[];
  serverScopeAttributes: string[];
  clientScopeAttributes: string[];
  sharedScopeAttributes: string[];
  displayedColumns: string[];
  columns: {
    key: string;
    label: string;
    cellType: 'index' | 'text' | 'datetime' | 'badge' | 'actions';
    sticky?: boolean;
    stickyEnd?: boolean;
  }[];
  detailConfig: {
    title: string;
    fields: {
      key: string;
      label: string;
      fieldType: 'index' | 'text' | 'datetime' | 'badge';
    }[];
  };
  statisticConfig: {
    key: string;
    onlineValue: any;
    offlineValue: any;
  };
};
