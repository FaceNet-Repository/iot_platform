///
/// Copyright © 2016-2024 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { AuthState } from '@core/auth/auth.models';
import { Authority } from '@shared/models/authority.enum';
import { deepClone } from '@core/utils';

export declare type MenuSectionType = 'link' | 'toggle';

export interface MenuSection {
  id: MenuId | string;
  name: string;
  fullName?: string;
  type: MenuSectionType;
  path: string;
  icon: string;
  pages?: Array<MenuSection>;
  opened?: boolean;
  rootOnly?: boolean;
  customTranslate?: boolean;
}

export interface MenuReference {
  id: MenuId;
  pages?: Array<MenuReference>;
}

export interface HomeSectionReference {
  name: string;
  places: Array<MenuId>;
}

export interface HomeSection {
  name: string;
  places: Array<MenuSection>;
}

export enum MenuId {
  home = 'home',
  tenants = 'tenants',
  tenant_profiles = 'tenant_profiles',
  resources = 'resources',
  widget_library = 'widget_library',
  widget_types = 'widget_types',
  widgets_bundles = 'widgets_bundles',
  images = 'images',
  scada_symbols = 'scada_symbols',
  resources_library = 'resources_library',
  notifications_center = 'notifications_center',
  notification_inbox = 'notification_inbox',
  notification_sent = 'notification_sent',
  notification_recipients = 'notification_recipients',
  notification_templates = 'notification_templates',
  notification_rules = 'notification_rules',
  settings = 'settings',
  general = 'general',
  mail_server = 'mail_server',
  home_settings = 'home_settings',
  notification_settings = 'notification_settings',
  repository_settings = 'repository_settings',
  auto_commit_settings = 'auto_commit_settings',
  queues = 'queues',
  mobile_app_settings = 'mobile_app_settings',
  security_settings = 'security_settings',
  security_settings_general = 'security_settings_general',
  two_fa = 'two_fa',
  oauth2 = 'oauth2',
  domains = 'domains',
  mobile_apps = 'mobile_apps',
  clients = 'clients',
  audit_log = 'audit_log',
  alarms = 'alarms',
  dashboards = 'dashboards',
  entities = 'entities',
  devices = 'devices',
  assets = 'assets',
  entity_views = 'entity_views',
  profiles = 'profiles',
  device_profiles = 'device_profiles',
  asset_profiles = 'asset_profiles',
  customers = 'customers',
  rule_chains = 'rule_chains',
  edge_management = 'edge_management',
  edges = 'edges',
  edge_instances = 'edge_instances',
  rulechain_templates = 'rulechain_templates',
  features = 'features',
  otaUpdates = 'otaUpdates',
  version_control = 'version_control',
  api_usage = 'api_usage',
  entity_management = 'entity_management',
  hcp_management = 'hcp_management',
  home_management = 'home_management',
  room_management = 'room_management',
  entity_hierarchy_tree = 'entity_hierarchy_tree',
}

declare type MenuFilter = (authState: AuthState) => boolean;

export const menuSectionMap = new Map<MenuId, MenuSection>([
  [
    MenuId.home,
    {
      id: MenuId.home,
      name: 'home.home',
      type: 'link',
      path: '/home',
      icon: 'home'
    }
  ],
  [
    MenuId.tenants,
    {
      id: MenuId.tenants,
      name: 'tenant.tenants',
      type: 'link',
      path: '/tenants',
      icon: 'supervisor_account'
    }
  ],
  [
    MenuId.tenant_profiles,
    {
      id: MenuId.tenant_profiles,
      name: 'tenant-profile.tenant-profiles',
      type: 'link',
      path: '/tenantProfiles',
      icon: 'mdi:alpha-t-box'
    }
  ],
  [
    MenuId.resources,
    {
      id: MenuId.resources,
      name: 'admin.resources',
      type: 'toggle',
      path: '/resources',
      icon: 'folder'
    }
  ],
  [
    MenuId.widget_library,
    {
      id: MenuId.widget_library,
      name: 'widget.widget-library',
      type: 'link',
      path: '/resources/widgets-library',
      icon: 'now_widgets'
    }
  ],
  [
    MenuId.widget_types,
    {
      id: MenuId.widget_types,
      name: 'widget.widgets',
      type: 'link',
      path: '/resources/widgets-library/widget-types',
      icon: 'now_widgets'
    }
  ],
  [
    MenuId.widgets_bundles,
    {
      id: MenuId.widgets_bundles,
      name: 'widgets-bundle.widgets-bundles',
      type: 'link',
      path: '/resources/widgets-library/widgets-bundles',
      icon: 'now_widgets'
    }
  ],
  [
    MenuId.images,
    {
      id: MenuId.images,
      name: 'image.gallery',
      type: 'link',
      path: '/resources/images',
      icon: 'filter'
    }
  ],
  [
    MenuId.scada_symbols,
    {
      id: MenuId.scada_symbols,
      name: 'scada.symbols',
      type: 'link',
      path: '/resources/scada-symbols',
      icon: 'view_in_ar'
    }
  ],
  [
    MenuId.resources_library,
    {
      id: MenuId.resources_library,
      name: 'resource.resources-library',
      type: 'link',
      path: '/resources/resources-library',
      icon: 'mdi:rhombus-split'
    }
  ],
  [
    MenuId.notifications_center,
    {
      id: MenuId.notifications_center,
      name: 'notification.notification-center',
      type: 'link',
      path: '/notification',
      icon: 'mdi:message-badge'
    }
  ],
  [
    MenuId.notification_inbox,
    {
      id: MenuId.notification_inbox,
      name: 'notification.inbox',
      fullName: 'notification.notification-inbox',
      type: 'link',
      path: '/notification/inbox',
      icon: 'inbox'
    }
  ],
  [
    MenuId.notification_sent,
    {
      id: MenuId.notification_sent,
      name: 'notification.sent',
      fullName: 'notification.notification-sent',
      type: 'link',
      path: '/notification/sent',
      icon: 'outbox'
    }
  ],
  [
    MenuId.notification_recipients,
    {
      id: MenuId.notification_recipients,
      name: 'notification.recipients',
      fullName: 'notification.notification-recipients',
      type: 'link',
      path: '/notification/recipients',
      icon: 'contacts'
    }
  ],
  [
    MenuId.notification_templates,
    {
      id: MenuId.notification_templates,
      name: 'notification.templates',
      fullName: 'notification.notification-templates',
      type: 'link',
      path: '/notification/templates',
      icon: 'mdi:message-draw'
    }
  ],
  [
    MenuId.notification_rules,
    {
      id: MenuId.notification_rules,
      name: 'notification.rules',
      fullName: 'notification.notification-rules',
      type: 'link',
      path: '/notification/rules',
      icon: 'mdi:message-cog'
    }
  ],
  [
    MenuId.settings,
    {
      id: MenuId.settings,
      name: 'admin.settings',
      type: 'link',
      path: '/settings',
      icon: 'settings'
    }
  ],
  [
    MenuId.general,
    {
      id: MenuId.general,
      name: 'admin.general',
      fullName: 'admin.general-settings',
      type: 'link',
      path: '/settings/general',
      icon: 'settings_applications'
    }
  ],
  [
    MenuId.mail_server,
    {
      id: MenuId.mail_server,
      name: 'admin.outgoing-mail',
      type: 'link',
      path: '/settings/outgoing-mail',
      icon: 'mail'
    }
  ],
  [
    MenuId.home_settings,
    {
      id: MenuId.home_settings,
      name: 'admin.home',
      fullName: 'admin.home-settings',
      type: 'link',
      path: '/settings/home',
      icon: 'settings_applications'
    }
  ],
  [
    MenuId.notification_settings,
    {
      id: MenuId.notification_settings,
      name: 'admin.notifications',
      fullName: 'admin.notifications-settings',
      type: 'link',
      path: '/settings/notifications',
      icon: 'mdi:message-badge'
    }
  ],
  [
    MenuId.repository_settings,
    {
      id: MenuId.repository_settings,
      name: 'admin.repository',
      fullName: 'admin.repository-settings',
      type: 'link',
      path: '/settings/repository',
      icon: 'manage_history'
    }
  ],
  [
    MenuId.auto_commit_settings,
    {
      id: MenuId.auto_commit_settings,
      name: 'admin.auto-commit',
      fullName: 'admin.auto-commit-settings',
      type: 'link',
      path: '/settings/auto-commit',
      icon: 'settings_backup_restore'
    }
  ],
  [
    MenuId.queues,
    {
      id: MenuId.queues,
      name: 'admin.queues',
      type: 'link',
      path: '/settings/queues',
      icon: 'swap_calls'
    }
  ],
  [
    MenuId.mobile_app_settings,
    {
      id: MenuId.mobile_app_settings,
      name: 'admin.mobile-app.mobile-app',
      fullName: 'admin.mobile-app.mobile-app',
      type: 'link',
      path: '/settings/mobile-app',
      icon: 'smartphone'
    }
  ],
  [
    MenuId.security_settings,
    {
      id: MenuId.security_settings,
      name: 'security.security',
      type: 'toggle',
      path: '/security-settings',
      icon: 'security'
    }
  ],
  [
    MenuId.security_settings_general,
    {
      id: MenuId.security_settings_general,
      name: 'admin.general',
      fullName: 'security.general-settings',
      type: 'link',
      path: '/security-settings/general',
      icon: 'settings_applications'
    }
  ],
  [
    MenuId.two_fa,
    {
      id: MenuId.two_fa,
      name: 'admin.2fa.2fa',
      type: 'link',
      path: '/security-settings/2fa',
      icon: 'mdi:two-factor-authentication'
    }
  ],
  [
    MenuId.oauth2,
    {
      id: MenuId.oauth2,
      name: 'admin.oauth2.oauth2',
      type: 'link',
      path: '/security-settings/oauth2',
      icon: 'mdi:shield-account'
    }
  ],
  [
    MenuId.domains,
    {
      id: MenuId.domains,
      name: 'admin.oauth2.domains',
      type: 'link',
      path: '/security-settings/oauth2/domains',
      icon: 'domain'
    }
  ],
  [
    MenuId.mobile_apps,
    {
      id: MenuId.mobile_apps,
      name: 'admin.oauth2.mobile-apps',
      type: 'link',
      path: '/security-settings/oauth2/mobile-applications',
      icon: 'smartphone'
    }
  ],
  [
    MenuId.clients,
    {
      id: MenuId.clients,
      name: 'admin.oauth2.clients',
      type: 'link',
      path: '/security-settings/oauth2/clients',
      icon: 'public'
    }
  ],
  [
    MenuId.audit_log,
    {
      id: MenuId.audit_log,
      name: 'audit-log.audit-logs',
      type: 'link',
      path: '/security-settings/auditLogs',
      icon: 'track_changes'
    }
  ],
  [
    MenuId.alarms,
    {
      id: MenuId.alarms,
      name: 'alarm.alarms',
      type: 'link',
      path: '/alarms',
      icon: 'mdi:alert-outline'
    }
  ],
  [
    MenuId.dashboards,
    {
      id: MenuId.dashboards,
      name: 'dashboard.dashboards',
      type: 'link',
      path: '/dashboards',
      icon: 'dashboards'
    }
  ],
  [
    MenuId.entities,
    {
      id: MenuId.entities,
      name: 'entity.entities',
      type: 'toggle',
      path: '/entities',
      icon: 'category'
    }
  ],
  [
    MenuId.devices,
    {
      id: MenuId.devices,
      name: 'device.devices',
      type: 'link',
      path: '/entities/devices',
      icon: 'devices_other'
    }
  ],
  [
    MenuId.assets,
    {
      id: MenuId.assets,
      name: 'asset.assets',
      type: 'link',
      path: '/entities/assets',
      icon: 'domain'
    }
  ],
  [
    MenuId.entity_views,
    {
      id: MenuId.entity_views,
      name: 'entity-view.entity-views',
      type: 'link',
      path: '/entities/entityViews',
      icon: 'view_quilt'
    }
  ],
  [
    MenuId.profiles,
    {
      id: MenuId.profiles,
      name: 'profiles.profiles',
      type: 'toggle',
      path: '/profiles',
      icon: 'badge'
    }
  ],
  [
    MenuId.device_profiles,
    {
      id: MenuId.device_profiles,
      name: 'device-profile.device-profiles',
      type: 'link',
      path: '/profiles/deviceProfiles',
      icon: 'mdi:alpha-d-box'
    }
  ],
  [
    MenuId.asset_profiles,
    {
      id: MenuId.asset_profiles,
      name: 'asset-profile.asset-profiles',
      type: 'link',
      path: '/profiles/assetProfiles',
      icon: 'mdi:alpha-a-box'
    }
  ],
  [
    MenuId.customers,
    {
      id: MenuId.customers,
      name: 'customer.customers',
      type: 'link',
      path: '/customers',
      icon: 'supervisor_account'
    }
  ],
  [
    MenuId.rule_chains,
    {
      id: MenuId.rule_chains,
      name: 'rulechain.rulechains',
      type: 'link',
      path: '/ruleChains',
      icon: 'settings_ethernet'
    }
  ],
  [
    MenuId.edge_management,
    {
      id: MenuId.edge_management,
      name: 'edge.management',
      type: 'toggle',
      path: '/edgeManagement',
      icon: 'settings_input_antenna'
    }
  ],
  [
    MenuId.edges,
    {
      id: MenuId.edges,
      name: 'edge.instances',
      fullName: 'edge.edge-instances',
      type: 'link',
      path: '/edgeManagement/instances',
      icon: 'router'
    }
  ],
  [
    MenuId.edge_instances,
    {
      id: MenuId.edge_instances,
      name: 'edge.edge-instances',
      fullName: 'edge.edge-instances',
      type: 'link',
      path: '/edgeManagement/instances',
      icon: 'router'
    }
  ],
  [
    MenuId.rulechain_templates,
    {
      id: MenuId.rulechain_templates,
      name: 'edge.rulechain-templates',
      fullName: 'edge.edge-rulechain-templates',
      type: 'link',
      path: '/edgeManagement/ruleChains',
      icon: 'settings_ethernet'
    }
  ],
  [
    MenuId.features,
    {
      id: MenuId.features,
      name: 'feature.advanced-features',
      type: 'toggle',
      path: '/features',
      icon: 'construction'
    }
  ],
  [
    MenuId.otaUpdates,
    {
      id: MenuId.otaUpdates,
      name: 'ota-update.ota-updates',
      type: 'link',
      path: '/features/otaUpdates',
      icon: 'memory'
    }
  ],
  [
    MenuId.version_control,
    {
      id: MenuId.version_control,
      name: 'version-control.version-control',
      type: 'link',
      path: '/features/vc',
      icon: 'history'
    }
  ],
  [
    MenuId.api_usage,
    {
      id: MenuId.api_usage,
      name: 'api-usage.api-usage',
      type: 'link',
      path: '/usage',
      icon: 'insert_chart'
    }
  ],
  [
    MenuId.entity_management,
    {
      id: MenuId.entity_management,
      name: 'entity-management.entity-management',
      type: 'toggle',
      path: '/entity-management',
      icon: 'app_registration'
    }
  ],
  [
    MenuId.hcp_management,
    {
      id: MenuId.hcp_management,
      name: 'entity-management.hcp-management',
      type: 'link',
      path: '/entity-management/hcp',
      icon: 'devices_other'
    }
  ],
  [
    MenuId.home_management,
    {
      id: MenuId.home_management,
      name: 'entity-management.home-management',
      type: 'link',
      path: '/entity-management/home',
      icon: 'domain'
    }
  ],
  [
    MenuId.room_management,
    {
      id: MenuId.room_management,
      name: 'entity-management.room-management',
      type: 'link',
      path: '/entity-management/room',
      icon: 'view_quilt'
    }
  ],
  [
    MenuId.entity_hierarchy_tree,
    {
      id: MenuId.entity_hierarchy_tree,
      name: 'entity-management.entity-hierarchy-tree',
      type: 'link',
      path: '/entity-hierarchy-tree',
      icon: 'domain'
    }
  ],
]);

const menuFilters = new Map<MenuId, MenuFilter>([
  [
    MenuId.edges, (authState) => authState.edgesSupportEnabled
  ],
  [
    MenuId.edge_management, (authState) => authState.edgesSupportEnabled
  ],
  [
    MenuId.rulechain_templates, (authState) => authState.edgesSupportEnabled
  ]
]);

const defaultUserMenuMap = new Map<Authority, MenuReference[]>([
  [
    Authority.SYS_ADMIN,
    [
      {id: MenuId.home},
      {id: MenuId.tenants},
      {id: MenuId.tenant_profiles},
      {
        id: MenuId.resources,
        pages: [
          {
            id: MenuId.widget_library,
            pages: [
              {id: MenuId.widget_types},
              {id: MenuId.widgets_bundles}
            ]
          },
          {id: MenuId.images},
          {id: MenuId.scada_symbols},
          {id: MenuId.resources_library}
        ]
      },
      {
        id: MenuId.notifications_center,
        pages: [
          {id: MenuId.notification_inbox},
          {id: MenuId.notification_sent},
          {id: MenuId.notification_recipients},
          {id: MenuId.notification_templates},
          {id: MenuId.notification_rules}
        ]
      },
      {
        id: MenuId.settings,
        pages: [
          {id: MenuId.general},
          {id: MenuId.mail_server},
          {id: MenuId.notification_settings},
          {id: MenuId.queues},
          {id: MenuId.mobile_app_settings}
        ]
      },
      {
        id: MenuId.security_settings,
        pages: [
          {id: MenuId.security_settings_general},
          {id: MenuId.two_fa},
          {
            id: MenuId.oauth2,
            pages: [
              {id: MenuId.domains},
              {id: MenuId.mobile_apps},
              {id: MenuId.clients}
            ]
          }
        ]
      }
    ]
  ],
  [
    Authority.TENANT_ADMIN,
    [
      {id: MenuId.home},
      {id: MenuId.alarms},
      {id: MenuId.dashboards},
      {
        id: MenuId.entity_management,
        pages: [
          {id: MenuId.hcp_management},
          {id: MenuId.home_management},
          {id: MenuId.room_management},
          {id: MenuId.entity_hierarchy_tree},
        ]
      },
      {
        id: MenuId.entities,
        pages: [
          {id: MenuId.devices},
          {id: MenuId.assets},
          {id: MenuId.entity_views}
        ]
      },
      {
        id: MenuId.profiles,
        pages: [
          {id: MenuId.device_profiles},
          {id: MenuId.asset_profiles}
        ]
      },
      {id: MenuId.customers},
      {id: MenuId.rule_chains},
      {
        id: MenuId.edge_management,
        pages: [
          {id: MenuId.edges},
          {id: MenuId.rulechain_templates}
        ]
      },
      {
        id: MenuId.features,
        pages: [
          {id: MenuId.otaUpdates},
          {id: MenuId.version_control}
        ]
      },
      {
        id: MenuId.resources,
        pages: [
          {
            id: MenuId.widget_library,
            pages: [
              {id: MenuId.widget_types},
              {id: MenuId.widgets_bundles}
            ]
          },
          {id: MenuId.images},
          {id: MenuId.scada_symbols},
          {id: MenuId.resources_library}
        ]
      },
      {
        id: MenuId.notifications_center,
        pages: [
          {id: MenuId.notification_inbox},
          {id: MenuId.notification_sent},
          {id: MenuId.notification_recipients},
          {id: MenuId.notification_templates},
          {id: MenuId.notification_rules}
        ]
      },
      {id: MenuId.api_usage},
      {
        id: MenuId.settings,
        pages: [
          {id: MenuId.home_settings},
          {id: MenuId.notification_settings},
          {id: MenuId.repository_settings},
          {id: MenuId.auto_commit_settings}
        ]
      },
      {
        id: MenuId.security_settings,
        pages: [
          {id: MenuId.audit_log}
        ]
      }
    ]
  ],
  [
    Authority.CUSTOMER_USER,
    [
      {id: MenuId.home},
      {id: MenuId.alarms},
      {id: MenuId.dashboards},
      {
        id: MenuId.entities,
        pages: [
          {id: MenuId.devices},
          {id: MenuId.assets},
          {id: MenuId.entity_views}
        ]
      },
      {id: MenuId.edge_instances},
      {
        id: MenuId.notifications_center,
        pages: [
          {id: MenuId.notification_inbox}
        ]
      }
    ]
  ]
]);

const defaultHomeSectionMap = new Map<Authority, HomeSectionReference[]>([
  [
    Authority.SYS_ADMIN,
    [
      {
        name: 'tenant.management',
        places: [MenuId.tenants, MenuId.tenant_profiles]
      },
      {
        name: 'widget.management',
        places: [MenuId.widget_library]
      },
      {
        name: 'admin.system-settings',
        places: [MenuId.general, MenuId.mail_server,
          MenuId.notification_settings, MenuId.security_settings, MenuId.oauth2, MenuId.domains, MenuId.mobile_apps,
          MenuId.clients, MenuId.two_fa, MenuId.resources_library, MenuId.queues]
      }
    ]
  ],
  [
    Authority.TENANT_ADMIN,
    [
      {
        name: 'rulechain.management',
        places: [MenuId.rule_chains]
      },
      {
        name: 'customer.management',
        places: [MenuId.customers]
      },
      {
        name: 'asset.management',
        places: [MenuId.assets, MenuId.asset_profiles]
      },
      {
        name: 'device.management',
        places: [MenuId.devices, MenuId.device_profiles, MenuId.otaUpdates]
      },
      {
        name: 'entity-view.management',
        places: [MenuId.entity_views]
      },
      {
        name: 'edge.management',
        places: [MenuId.edges, MenuId.rulechain_templates]
      },
      {
        name: 'dashboard.management',
        places: [MenuId.widget_library, MenuId.dashboards]
      },
      {
        name: 'version-control.management',
        places: [MenuId.version_control]
      },
      {
        name: 'audit-log.audit',
        places: [MenuId.audit_log, MenuId.api_usage]
      },
      {
        name: 'admin.system-settings',
        places: [MenuId.home_settings, MenuId.resources_library, MenuId.repository_settings, MenuId.auto_commit_settings]
      }
    ]
  ],
  [
    Authority.CUSTOMER_USER,
    [
      {
        name: 'asset.view-assets',
        places: [MenuId.assets]
      },
      {
        name: 'device.view-devices',
        places: [MenuId.devices]
      },
      {
        name: 'entity-view.management',
        places: [MenuId.entity_views]
      },
      {
        name: 'edge.management',
        places: [MenuId.edge_instances]
      },
      {
        name: 'dashboard.view-dashboards',
        places: [MenuId.dashboards]
      }
    ]
  ]
]);

export const buildUserMenu = (authState: AuthState): Array<MenuSection> => {
  const references = defaultUserMenuMap.get(authState.authUser.authority);
  console.log('buildUserMenu references', references);
  const result = (references || []).map(ref => referenceToMenuSection(authState, ref)).filter(section => !!section);
  console.log('buildUserMenu result', result);
  return (references || []).map(ref => referenceToMenuSection(authState, ref)).filter(section => !!section);
};

export const buildUserHome = (authState: AuthState, availableMenuSections: MenuSection[]): Array<HomeSection> => {
  const references = defaultHomeSectionMap.get(authState.authUser.authority);
  return (references || []).map(ref =>
    homeReferenceToHomeSection(availableMenuSections, ref)).filter(section => !!section);
};

const referenceToMenuSection = (authState: AuthState, reference: MenuReference): MenuSection | undefined => {
  console.log('Current reference', reference);
  console.log('Current reference condition checking', filterMenuReference(authState, reference));
  if (filterMenuReference(authState, reference)) {
    const section = menuSectionMap.get(reference.id);
    console.log('Section from menu section map', section);
    if (section) {
      const result = deepClone(section);
      if (reference.pages?.length) {
        result.pages = reference.pages.map(page =>
          referenceToMenuSection(authState, page)).filter(page => !!page);
      }
      return result;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
};

const filterMenuReference = (authState: AuthState, reference: MenuReference): boolean => {
  const filter = menuFilters.get(reference.id);
  if (filter) {
    if (filter(authState)) {
      if (reference.pages?.length) {
        if (reference.pages.every(page => !filterMenuReference(authState, page))) {
          return false;
        }
      }
      return true;
    }
    return false;
  } else {
    return true;
  }
};

const homeReferenceToHomeSection = (availableMenuSections: MenuSection[], reference: HomeSectionReference): HomeSection | undefined => {
  const places = reference.places.map(id => availableMenuSections.find(m => m.id === id)).filter(p => !!p);
  if (places.length) {
    return {
      name: reference.name,
      places
    };
  } else {
    return undefined;
  }
};
