import { useNavigate } from 'react-router-dom';

// PrimeReact
import { Card } from 'primereact/card';
import { useAuth } from '../components/AuthContext';

// Optional: if you use PrimeFlex utilities
// import 'primeflex/primeflex.css';



export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();


  type MenuItem = {
    title: string;
    description: string;
    icon: string; // PrimeIcons class name (e.g., "pi pi-users")
    path: string;
    roles: string[];
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Patient Data Entry',
      description: 'Add new patient information and upload USG images',
      icon: 'pi pi-user-plus',
      path: '/patient-entry',
      roles: ['field_coordinator']
    },
    {
      title: 'Image Evaluation',
      description: 'Evaluate USG images and make biopsy decisions',
      icon: 'pi pi-images',
      path: '/image-evaluation',
      roles: ['radiologist']
    },
    {
      title: 'Pathology Results',
      description: 'View and manage pathology results',
      icon: 'pi pi-file',
      path: '/pathology-results',
      roles: ['field_coordinator', 'radiologist', 'monitor']
    },
    {
      title: 'User Management',
      description: 'Manage system users and permissions',
      icon: 'pi pi-users',
      path: '/users',
      roles: ['monitor']
    },
    {
      title: 'Data Download',
      description: 'Export data to Excel format',
      icon: 'pi pi-download',
      path: '/data-download',
      roles: ['monitor']
    },
    {
      title: 'Locked Data',
      description: 'View and manage locked patient data',
      icon: 'pi pi-lock',
      path: '/locked-data',
      roles: ['monitor']
    }
    ,
    {
      title: 'Roles Management',
      description: 'View and manage roles and permissions',
      icon: 'pi pi-lock',
      path: '/roles',
      roles: ['monitor']
    }
  ];

  const availableItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

/*   const getRoleSeverity = (role: string): 'success' | 'info' | 'warning' | 'danger' | undefined => {
    switch (role) {
      case 'field_coordinator':
        return 'success';
      case 'radiologist':
        return 'info';
      case 'monitor':
        return 'warning';
      default:
        return undefined;
    }
  };
 */
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'field_coordinator':
        return 'Field Coordinator';
      case 'radiologist':
        return 'Radiologist';
      case 'monitor':
        return 'Monitor';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
 {/*      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <i className="pi pi-heart text-blue-600 text-2xl mr-3" aria-hidden />
              <h1 className="text-xl font-semibold text-gray-900">Clinical Research System</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.username}</span>
              </div>
              <Tag
                value={getRoleDisplayName(user?.role || '')}
                severity={getRoleSeverity(user?.role || '')}
                className="text-sm"
              />
              <Button
                label="Logout"
                icon="pi pi-sign-out"
                outlined
                size="small"
                onClick={handleLogout}
              />
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       {/*  <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Access your available modules based on your role permissions</p>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableItems.map((item) => (
            <Card
              key={item.path}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(item.path)}
              title={
                <div className="flex items-center">
                  <span className="p-2 bg-blue-100 rounded-lg mr-3 inline-flex items-center justify-center">
                    <i className={`${item.icon} text-blue-600 text-xl`} aria-hidden />
                  </span>
                  <span className="text-lg">{item.title}</span>
                </div>
              }
            >
              <p className="text-sm text-gray-600">{item.description}</p>
            </Card>
          ))}
        </div>

        {availableItems.length === 0 && (
          <Card className="mt-2">
            <p className="text-center text-gray-500 py-8">No modules available for your current role.</p>
          </Card>
        )}

        {/* Session Info */}
        <Card className="mt-8" title={<span className="text-lg">Session Information</span>}>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Login Time:</strong>{' '}
              {user?.loginTime ? new Date(user.loginTime).toLocaleString() : '—'}
            </p>
            <p>
              <strong>Role:</strong> {getRoleDisplayName(user?.role || '')}
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
