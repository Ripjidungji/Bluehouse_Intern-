import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-content">

        <p className="hero-small-text">
          WELCOME TO RDTECH
        </p>

        <h1>Build Something Amazing</h1>

        <p className="hero-description">
          We create simple and reliable digital solutions
          for modern businesses and individuals.
        </p>

        <Link to="/contact" className="hero-button">
          Get Started
        </Link>

      </div>

    </section>
  );
}

export default Hero;