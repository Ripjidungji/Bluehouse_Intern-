import { Link } from "react-router-dom";

function AboutPreview() {
  return (
    <section className="about-preview">
      <div className="about-content">

        <p className="about-label">ABOUT RDTECH</p>

        <h2>We Make Technology Simple</h2>

        <p className="about-text">
          RdTECH helps businesses and individuals use technology
          without unnecessary complexity. We create simple, useful,
          and reliable digital solutions that make everyday work easier.
        </p>

        <Link to="/about" className="about-button">
          Learn More
        </Link>

      </div>

      <div className="about-box">
        <div className="about-box-content">
          <span>10+</span>
          <p>Years of Innovation</p>
        </div>

        <div className="about-box-content">
          <span>500+</span>
          <p>Happy Clients</p>
        </div>
      </div>
    </section>
  );
}

export default AboutPreview;