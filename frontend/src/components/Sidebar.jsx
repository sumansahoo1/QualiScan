import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <nav className="bg-secondary flex max-w-20 flex-shrink-0">
      <ul className="space-y-2 p-4">
        <li>
          <Link to="/" className="text-white block py-2 px-4 rounded hover:bg-highlight">Dashboard</Link>
        </li>
        <li>
          <Link to="/test" className="text-white block py-2 px-4 rounded hover:bg-highlight">Test</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;