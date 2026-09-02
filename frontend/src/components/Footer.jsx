import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";
import Logo from "./Logo";
import { FacebookIcon, InstagramIcon, XIcon, LinkedInIcon, WhatsAppIcon } from "./SocialIcons";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand" style={{ marginBottom: 10 }}>
              <Logo size={28} />
              aikilink<span className="accent">.</span>
            </Link>
            <p>
              Connecting homeowners and offices with trusted local electricians, plumbers,
              mechanics and more — across Nigeria.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook"><FacebookIcon /></a>
              <a href="#" aria-label="Instagram"><InstagramIcon /></a>
              <a href="#" aria-label="X (Twitter)"><XIcon /></a>
              <a href="#" aria-label="LinkedIn"><LinkedInIcon /></a>
              <a href="#" aria-label="WhatsApp"><WhatsAppIcon /></a>
            </div>
          </div>

          <div className="footer-col">
            <h5>Platform</h5>
            <Link to="/register">Get started</Link>
            <Link to="/login">Log in</Link>
            <Link to="/homeowner/post">Post a job</Link>
            <Link to="/provider">Find work</Link>
          </div>

          <div className="footer-col">
            <h5>Categories</h5>
            <span>Electrician</span>
            <span>Plumber</span>
            <span>Mechanic</span>
            <span>Generator Repair</span>
          </div>

          <div className="footer-col">
            <h5>Contact</h5>
            <span className="row" style={{ gap: 8 }}><Mail size={14} /> support@aikilink.ng</span>
            <span className="row" style={{ gap: 8 }}><MapPin size={14} /> Ibadan, Oyo State</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} aikilink. All rights reserved.</span>
          <span className="muted">Built as a final-year project — Gombe State University.</span>
        </div>
      </div>
    </footer>
  );
}
