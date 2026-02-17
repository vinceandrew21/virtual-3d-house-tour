import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer-grid">
          <div>
            <div className="landing-footer-brand">Virtual Tours Studio</div>
            <p className="landing-footer-desc">
              Professional real estate photography, photo editing, 360° photos, and immersive 3D virtual tours.
            </p>
          </div>
          <div>
            <div className="landing-footer-heading">Navigation</div>
            <ul className="landing-footer-links">
              <li><a href="#services">Services</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><Link href="/tour/demo">Demo Tour</Link></li>
            </ul>
          </div>
          <div>
            <div className="landing-footer-heading">Contact</div>
            <ul className="landing-footer-links">
              <li><a href="mailto:hello@virtualtoursstudio.com">hello@virtualtoursstudio.com</a></li>
            </ul>
          </div>
        </div>
        <div className="landing-footer-bottom">
          &copy; {new Date().getFullYear()} Virtual Tours Studio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
