function About() {
  return (
    <main className="about-page">

      {/* About Hero */}

      <section className="about-page-hero">

        <p>ABOUT RDTECH</p>

        <h1>We Make Technology Simple</h1>

        <p>
          We believe technology should make life easier,
          not more complicated.
        </p>

      </section>


      {/* Who We Are */}

      <section className="about-page-content">

        <div className="about-page-text">

          <p className="about-label">
            WHO WE ARE
          </p>

          <h2>Technology That Works For You</h2>

          <p>
            RdTECH is a technology company focused on
            creating simple, useful, and reliable digital
            solutions.
          </p>

          <p>
            Our goal is to help businesses and individuals
            use technology to solve everyday problems and
            achieve better results.
          </p>

        </div>


        <div className="about-page-box">

          <h2>Our Mission</h2>

          <p>
            To make technology accessible, simple, and
            useful for everyone.
          </p>

        </div>

      </section>


      {/* Our Values */}

      <section className="values-section">

        <div className="values-heading">

          <p>WHAT WE BELIEVE</p>

          <h2>Our Core Values</h2>

          <span>
            The principles that guide everything we do.
          </span>

        </div>


        <div className="values-container">

          <div className="value-card">

            <div className="value-icon">
              💡
            </div>

            <h3>Innovation</h3>

            <p>
              We constantly look for better and smarter
              ways to solve problems.
            </p>

          </div>


          <div className="value-card">

            <div className="value-icon">
              🤝
            </div>

            <h3>Trust</h3>

            <p>
              We build strong relationships by being
              honest, reliable, and dependable.
            </p>

          </div>


          <div className="value-card">

            <div className="value-icon">
              🎯
            </div>

            <h3>Excellence</h3>

            <p>
              We aim to deliver quality solutions that
              create real value for our users.
            </p>

          </div>

        </div>

      </section>


      {/* Statistics */}

      <section className="about-stats">

        <div>
          <span>10+</span>
          <p>Years of Innovation</p>
        </div>

        <div>
          <span>500+</span>
          <p>Happy Clients</p>
        </div>

        <div>
          <span>50+</span>
          <p>Digital Projects</p>
        </div>

        <div>
          <span>24/7</span>
          <p>Support</p>
        </div>

      </section>

    </main>
  );
}

export default About;