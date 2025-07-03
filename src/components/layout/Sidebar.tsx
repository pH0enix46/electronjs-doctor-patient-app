import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
}

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/", icon: "chart-line" },
  { name: "Appointments", href: "/appointments", icon: "calendar-check" },
  { name: "Patients", href: "/patients", icon: "user-friends" },
  { name: "Doctors", href: "/doctors", icon: "user-md" },
  { name: "Prescriptions", href: "/prescriptions", icon: "pills" },
  { name: "Settings", href: "/settings", icon: "cog" },
];

export function Sidebar() {
  const location = useLocation();
  
  // Helper function to check if a path is active
  const isActive = (path: string) => {
    // Special handling for root path
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0 ">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-blue-950">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-600 rounded-lg p-2">
                <i className="fas fa-hospital text-white text-xl"></i>
              </div>
              <h1 className="ml-3 text-xl font-bold text-indigo-500 ">
                Doctor & Patient
              </h1>
            </div>
          </div>
          <div className="mt-5 flex-1 px-2 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-base font-medium rounded-md transition-colors",
                  isActive(item.href)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <i
                  className={`fas fa-${item.icon} w-6 h-6 mr-1 mt-2 text-gray-400`}
                />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
