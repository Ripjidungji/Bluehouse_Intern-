import { Link } from "react-router-dom";

function CTA() {
  return (
    <section className="cta">
      <div className="cta-content">
        <p className="cta-label">GET STARTED TODAY</p>

        <h2>Ready to Build Something Great?</h2>

        <p>
          Let's work together and turn your ideas into
          simple and powerful digital solutions.
        </p>

        <Link to="/contact" className="cta-button">
          Contact Us
        </Link>
        
      </div>
    </section>
  );
}

export default CTA;