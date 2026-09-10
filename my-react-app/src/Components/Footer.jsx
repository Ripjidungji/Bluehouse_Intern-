import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-content">

        <div className="footer-brand">
          <h2>NovaTech</h2>

          <p>
            Simple and reliable digital solutions
            for modern businesses.
          </p>
        </div>


        <div className="footer-links">

          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/products">Products</Link>
          <Link to="/contact">Contact</Link>

        </div>


        <div className="footer-contact">

          <h3>Contact</h3>

          <p>Email: hello@novatech.com</p>

          <p>Phone: +234 800 000 0000</p>

        </div>

      </div>


      <div className="footer-bottom">

        <p>
          © 2026 NovaTech. All rights reserved.
        </p>

      </div>

    </footer>
  );
}

export default Footer;