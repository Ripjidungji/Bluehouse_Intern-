import { useState } from "react";

function Contact() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [submitted, setSubmitted] = useState(false);


  function handleSubmit(event) {

    event.preventDefault();

    setSubmitted(true);

    setName("");
    setEmail("");
    setMessage("");
  }


  return (
    <main className="contact-page">

      {/* Contact Hero */}

      <section className="contact-hero">

        <p>CONTACT US</p>

        <h1>Let's Talk About Your Idea</h1>

        <p>
          Have a question or a project in mind?
          We'd love to hear from you.
        </p>

      </section>


      {/* Contact Section */}

      <section className="contact-section">

        <div className="contact-info">

          <p className="contact-label">
            GET IN TOUCH
          </p>

          <h2>
            We'd Love to Hear From You
          </h2>

          <p>
            Whether you have a question, need help,
            or want to work with us, send us a message.
          </p>


          <div className="contact-details">

            <div>
              <strong>Email</strong>
              <p>hello@Rdtech.com</p>
            </div>

            <div>
              <strong>Phone</strong>
              <p>+234 800 000 0000</p>
            </div>

            <div>
              <strong>Address</strong>
              <p>Lagos, Nigeria</p>
            </div>

          </div>

        </div>


        {/* Contact Form */}

        <form
          className="contact-form"
          onSubmit={handleSubmit}
        >

          <label>
            Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />


          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />


          <label>
            Message
          </label>

          <textarea
            placeholder="Write your message..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows="6"
            required
          ></textarea>


          <button type="submit">
            Send Message
          </button>


          {/* Success Message */}

          {submitted && (
            <p className="success-message">
              Thank you! Your message has been received.
            </p>
          )}

        </form>

      </section>

    </main>
  );
}

export default Contact;