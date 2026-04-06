import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logo} alt="Cryptoshare logo" className="navbar-logo" />
        <span>Cryptoshare</span>
      </div>
      <div className="navbar-links">
        <Link to="/">Create Secret</Link>
      </div>
    </nav>
  );
}
