import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Hammer, UserRound, LogOut, PlusCircle, Search, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import Avatar from "./Avatar";

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <Logo size={30} />
          aikilink<span className="accent">.</span>
        </Link>

        <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          {!isAuthenticated && (
            <>
              <Link to="/login" onClick={close}>Log in</Link>
              <Link to="/register" className="nav-cta" onClick={close}>Register</Link>
            </>
          )}
          {isAuthenticated && user?.role === "homeowner" && (
            <>
              <Link to="/homeowner" onClick={close}><Briefcase size={15} /> My jobs</Link>
              <Link to="/homeowner/post" className="nav-cta" onClick={close}><PlusCircle size={15} /> Post a job</Link>
            </>
          )}
          {isAuthenticated && user?.role === "provider" && (
            <>
              <Link to="/provider" onClick={close}><Search size={15} /> Job feed</Link>
              <Link to="/provider/work" onClick={close}><Hammer size={15} /> My work</Link>
              <Link to="/provider/profile" onClick={close}><UserRound size={15} /> My profile</Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <span className="nav-user">{user?.name}</span>
              <Avatar name={user?.name} size={32} online />
              <button onClick={handleLogout} className="nav-logout" aria-label="Log out">
                <LogOut size={15} />
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
