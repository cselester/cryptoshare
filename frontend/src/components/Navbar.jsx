import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Cryptoshare</div>
      <div className="navbar-links">
        <Link to="/">Create Secret</Link>
      </div>
    </nav>
  );
}
