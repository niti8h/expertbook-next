import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--surface-0)", color: "var(--text-primary)" }}>
      {/* Header */}
      <div style={{ backgroundColor: "var(--surface-1)", padding: "60px 24px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "16px", letterSpacing: "-0.03em" }}>Privacy Policy</h1>
          <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)" }}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", fontSize: "1.063rem", lineHeight: 1.7, color: "var(--text-secondary)" }}>
          
          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>1. Information We Collect</h2>
            <p style={{ marginBottom: "12px" }}>
              We collect several different types of information for various purposes to provide and improve our service to you.
            </p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><strong>Personal Data:</strong> While using our service, we may ask you to provide us with certain personally identifiable information, such as email address, first name and last name, phone number, and physical address.</li>
              <li><strong>Usage Data:</strong> We may also collect information on how the service is accessed and used. This may include information such as your device's Internet Protocol address (e.g. IP address), browser type, and browser version.</li>
              <li><strong>Location Data:</strong> We may use and store information about your location if you give us permission to do so, to provide features like local service discovery.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>2. How We Use Your Data</h2>
            <p style={{ marginBottom: "12px" }}>
              We use the collected data for various purposes:
            </p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features when you choose to do so</li>
              <li>To provide customer support</li>
              <li>To process your transactions and manage your orders</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>3. Data Sharing and Disclosure</h2>
            <p>
              We do not sell, trade, or otherwise transfer your Personally Identifiable Information to outside parties except to trusted third parties who assist us in operating our website, conducting our business, or servicing you (such as payment processors like Razorpay), so long as those parties agree to keep this information confidential.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>4. Security of Data</h2>
            <p>
              The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>5. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, such as the right to access, update, or delete the information we have on you. If you wish to exercise these rights, please contact us.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>6. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this page.
            </p>
          </section>

          <div style={{ marginTop: "40px", paddingTop: "40px", borderTop: "1px solid var(--border-light)", textAlign: "center" }}>
            <p style={{ marginBottom: "16px" }}>Have concerns about your privacy?</p>
            <Link href="/contact" className="btn-secondary" style={{ padding: "12px 24px", textDecoration: "none" }}>
              Contact Our Privacy Team
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
