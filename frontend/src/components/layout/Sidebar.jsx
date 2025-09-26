import { NavLink } from 'react-router-dom';

function Sidebar() {
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/owners', label: 'Owners' },
    { path: '/stations', label: 'Stations' },
    { path: '/bookings', label: 'Bookings' },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;


