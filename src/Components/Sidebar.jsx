import { createElement } from "react";
import { Link, useLocation } from "react-router-dom";
import { Building2, FileSpreadsheet, LayoutDashboard, UsersRound } from "lucide-react";

export default function Sidebar() {
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "Overview", icon: LayoutDashboard },
    { to: "/clients", label: "Clients", icon: UsersRound },
    { to: "/families", label: "Families", icon: Building2 },
    { to: "/reports", label: "FCD reports", icon: FileSpreadsheet },
  ];

  return (
    <aside className="sidebar">
      <Link to="/" className="brand" aria-label="NeuroCRM overview">
        <span className="brand-mark">N</span>
        <span>Neuro<span>CRM</span></span>
      </Link>

      <nav className="navigation" aria-label="Main navigation">
        {links.map(({ to, label, icon }) => (
          <Link key={to} to={to} className={`nav-link ${pathname === to ? "active" : ""}`}>
            {createElement(icon, { size: 19, strokeWidth: 2.2 })}
            {label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">Care coordination workspace</div>
    </aside>
  );
}