// src/config/menuConfig.ts


export type MenuItem = {
  label: string;
  path: string;
  roles: string[];
  icon?: string;
  description?: string;
};

export const menuConfig: MenuItem[] = [
  {
    label: 'Trial Cases',
    path: '/trial-cases',
    roles: ['field_coordinator','monitor','biostatistician'],
    icon: 'pi pi-briefcase',
    description: 'Manage trial cases and patient data'
  },
  {
    label: 'Radiologist Assessment',
    path: '/radiologist-assessment',
    roles: ['radiologist','monitor','biostatistician'],
    icon: 'pi pi-user-edit',
    description: 'Review radiologist assessments'
  },
  {
    label: 'AI Image Assessment',
    path: '/ai-assessment',
    roles: ['field_coordinator','monitor','biostatistician'],
    icon: 'pi pi-images',
    description: 'Assess and evaluate medical images'
  },
  {
    label: 'Pathology of Cases',
    path: '/pathology-results',
    roles: [ 'radiologist', 'monitor','patolog_coordinator','biostatistician'],
    icon: 'pi pi-file',
    description: 'View pathology results and reports'
  },
  {
    label: 'Approval of Cases',
    path: '/approval-cases',
    roles: ['monitor','radiologist'],
    icon: 'pi pi-check-circle',
    description: 'Approve and validate cases'
  },
  {
    label: 'Users',
    path: '/users',
    roles: ['monitor'],
    icon: 'pi pi-users',
    description: 'Manage system users'
  },
  {
    label: 'Roles',
    path: '/roles',
    roles: ['monitor'],
    icon: 'pi pi-id-card',
    description: 'Configure user roles and permissions'
  },
/*   {
    label: 'Monitor',
    path: '/monitor-home',
    roles: ['monitor'],
    icon: 'pi pi-desktop',
    description: 'Monitor system dashboard'
  }, */

  {
    label: 'Download Data',
    path: '/data-download',
    roles: ['monitor','biostatistician'],
    icon: 'pi pi-download',
    description: 'Download data in Excel format'
  },
  {
    label: 'Locked Data',
    path: '/locked-data',
    roles: ['monitor'],
    icon: 'pi pi-lock',
    description: 'protect and manage locked data'
  },    
];

// Helper function to filter menu items by user role
export const getMenuItemsByRole = (role: string): MenuItem[] => {
  return menuConfig.filter(item => item.roles.includes(role));
};

// Helper function to format items for PrimeReact Menubar
export const getMenubarItems = (role: string, navigate: (path: string) => void) => {
  return getMenuItemsByRole(role).map(item => ({
    label: item.label,
    icon: item.icon,
    command: () => navigate(item.path)
  }));
};



