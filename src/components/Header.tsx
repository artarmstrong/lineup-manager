import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from './UserAvatar';

interface NavItem {
  label: string;
  path: string;
}

interface HeaderProps {
  /**
   * Array of navigation items to display in the header.
   * If not provided, defaults to Dashboard, Lineups, and Profile.
   */
  navItems?: NavItem[];
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Lineups', path: '/lineups' },
  { label: 'Profile', path: '/profile' },
];

export default function Header({ navItems = DEFAULT_NAV_ITEMS }: HeaderProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-gray-900">Lineup Manager</h1>
          <nav className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors ${
                  isActivePath(item.path)
                    ? 'text-indigo-600 hover:text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/profile">
            <UserAvatar size="md" />
          </Link>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
