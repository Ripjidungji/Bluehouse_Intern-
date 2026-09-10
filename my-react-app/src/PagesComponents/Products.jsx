import { useState } from "react";

function Products() {

  const [selectedProduct, setSelectedProduct] = useState(null);


  const products = [
    {
      name: "RdDesk",
      icon: "💻",
      description:
        "A simple workspace platform that helps businesses organize their everyday tasks.",
      details:
        "RdDesk helps businesses organize tasks, manage their workspace, and keep everyday work simple."
    },

    {
      name: "RdAnalytics",
      icon: "📊",
      description:
        "Understand your business data with simple and easy-to-read reports and insights.",
      details:
        "RdAnalytics helps you understand your business data through simple reports and useful insights."
    },

    {
      name: "RdSecure",
      icon: "🔒",
      description:
        "Reliable tools designed to help protect your important business information.",
      details:
        "RdSecure provides tools that help businesses protect important information and keep their data safer."
    }
  ];


  return (
    <main className="products-page">

      {/* Products Hero */}

      <section className="products-hero">

        <p>OUR PRODUCTS</p>

        <h1>Simple Tools for Modern Businesses</h1>

        <p>
          Discover our digital products designed to make
          your work easier, faster, and more efficient.
        </p>

      </section>


      {/* Products Section */}

      <section className="products-section">

        <div className="products-heading">

          <p>WHAT WE OFFER</p>

          <h2>Our Products</h2>

          <span>
            Explore our collection of simple and reliable
            digital solutions.
          </span>

        </div>


        <div className="products-container">

          {products.map((product) => (

            <div
              className="product-card"
              key={product.name}
            >

              <div className="product-icon">
                {product.icon}
              </div>

              <h3>
                {product.name}
              </h3>

              <p>
                {product.description}
              </p>

              <button
                onClick={() =>
                  setSelectedProduct(product)
                }
              >
                Learn More
              </button>

            </div>

          ))}

        </div>

      </section>


      {/* Product Modal */}

      {selectedProduct && (

        <div className="product-modal">

          <div className="product-modal-content">

            <button
              className="modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              ×
            </button>


            <div className="modal-icon">
              {selectedProduct.icon}
            </div>


            <h2>
              {selectedProduct.name}
            </h2>


            <p>
              {selectedProduct.details}
            </p>


            <button
              className="modal-button"
              onClick={() => setSelectedProduct(null)}
            >
              Close
            </button>

          </div>

        </div>

      )}

    </main>
  );
}

export default Products;