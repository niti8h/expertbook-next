import Link from "next/link";

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--surface-0)", color: "var(--text-primary)" }}>
      {/* Header */}
      <div style={{ backgroundColor: "var(--surface-1)", padding: "60px 24px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "16px", letterSpacing: "-0.03em" }}>Terms and Conditions</h1>
          <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)" }}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", fontSize: "1.063rem", lineHeight: 1.7, color: "var(--text-secondary)" }}>
          
          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>1. Introduction</h2>
            <p>
              Welcome to our platform. These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access our services.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>2. User Accounts</h2>
            <p style={{ marginBottom: "12px" }}>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our platform.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>3. Vendor Responsibilities</h2>
            <p>
              Vendors listing products or services on our platform are solely responsible for the accuracy of their listings, fulfillment of orders, and providing the required quality of service. The platform acts solely as an intermediary and takes no responsibility for disputes between buyers and sellers, though we may offer mediation services at our discretion.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>4. Payments and Fees</h2>
            <p>
              All payments processed through our platform are handled securely via third-party payment gateways (e.g., Razorpay). We reserve the right to charge commissions on transactions as agreed upon during vendor onboarding. Commission rates and fee structures are subject to change with prior notice.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>5. Prohibited Activities</h2>
            <p>
              You may not use our platform for any illegal or unauthorized purpose. You agree to comply with all laws, rules, and regulations applicable to your use of the service.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>6. Limitation of Liability</h2>
            <p>
              In no event shall the platform, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>7. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.
            </p>
          </section>

          <div style={{ marginTop: "40px", paddingTop: "40px", borderTop: "1px solid var(--border-light)", textAlign: "center" }}>
            <p style={{ marginBottom: "16px" }}>Have questions about our terms?</p>
            <Link href="/contact" className="btn-secondary" style={{ padding: "12px 24px", textDecoration: "none" }}>
              Contact Support
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
