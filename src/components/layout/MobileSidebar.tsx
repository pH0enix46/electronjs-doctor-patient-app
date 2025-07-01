import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
}

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/', icon: 'chart-line' },
  { name: 'Appointments', href: '/appointments', icon: 'calendar-check' },
  { name: 'Patients', href: '/patients', icon: 'user-friends' },
  { name: 'Doctors', href: '/doctors', icon: 'user-md' },
  { name: 'Prescriptions', href: '/prescriptions', icon: 'pills' },
  { name: 'Settings', href: '/settings', icon: 'cog' },
];

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="fixed inset-0 flex z-40">
        <div className="fixed inset-0">
          <div 
            className="absolute inset-0 bg-gray-600 opacity-75"
            onClick={onClose}
          />
        </div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onClose}
            >
              <span className="sr-only">Close sidebar</span>
              <svg
                className="h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-600 rounded-lg p-2">
                  <i className="fas fa-hospital text-white text-xl"></i>
                </div>
                <h1 className="ml-3 text-xl font-bold text-indigo-600">DoctorApp</h1>
              </div>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-4 py-3 text-base font-medium rounded-md',
                    location.pathname === item.href
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={onClose}
                >
                  <i className={`fas fa-${item.icon} w-6 h-6 mr-4`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="flex-shrink-0 w-14">
          {/* Force sidebar to shrink to fit close icon */}
        </div>
      </div>
    </div>
  );
}
