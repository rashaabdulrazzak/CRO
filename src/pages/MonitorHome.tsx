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


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    

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
