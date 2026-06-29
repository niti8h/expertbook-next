import Link from "next/link";
import styles from "./page.module.css";
import { fetchGlobalSettings } from "@/lib/settings";

export default async function Home() {
  const settings = await fetchGlobalSettings();
  const siteName = settings.site_name || "MarketSphere";

  return (
    <main style={{ overflow: "hidden" }}>
      {/* ======== HERO SECTION ======== */}
      <section className={styles.hero}>
        <div className={styles.heroGlowBackdrop} />
        
        <div className={`badge badge-brand ${styles.heroBadge}`}>
          ✦ A completely new way to shop and book
        </div>

        <h1 className={styles.heroTitle}>
          Discover products and services,{" "}
          <span className={styles.heroTitleAccent}>beautifully integrated.</span>
        </h1>

        <p className={styles.heroDesc}>
          Whether you're looking for unique handcrafted products or need a skilled professional in your area, {siteName} connects you effortlessly.
        </p>

        <div className={styles.heroActions}>
          <Link href="/products" className="btn-primary" style={{ padding: "16px 36px", fontSize: "1.125rem", borderRadius: "100px", textDecoration: "none" }}>
            Start Shopping
          </Link>
          <Link href="/services" className="btn-secondary" style={{ padding: "16px 36px", fontSize: "1.125rem", borderRadius: "100px", textDecoration: "none", background: "white" }}>
            Book a Service
          </Link>
        </div>

        {/* Floating Glass UI Elements (No Brands) */}
        <div className={styles.heroGlassGrid}>
          <div className={styles.glassCard}>
            <div className={styles.glassIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div className={styles.glassInfo}>
              <h4>New Order Placed</h4>
              <p>Just now • Secure Checkout</p>
            </div>
          </div>
          
          <div className={styles.glassCard}>
            <div className={styles.glassIcon} style={{ color: "var(--brand-600)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <div className={styles.glassInfo}>
              <h4>Service Confirmed</h4>
              <p>AC Repair • Arriving today</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======== BENTO BOX FEATURES ======== */}
      <section className={styles.bentoSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>Why {siteName}</p>
          <h2 className={styles.sectionTitle}>Everything you need, built right in.</h2>
        </div>

        <div className={styles.bentoGrid}>
          <div className={`${styles.bentoCard} ${styles.bentoCardLarge}`}>
            <div className={styles.bentoIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <h3>Unified Storefronts</h3>
            <p>Sellers and service providers get their own dedicated portfolios with ratings, reviews, and a smooth catalog experience.</p>
            <div className={styles.bentoBlob} />
          </div>

          <div className={styles.bentoCard}>
            <div className={styles.bentoIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 21c-4-4-8-7.5-8-11a8 8 0 1 1 16 0c0 3.5-4 7-8 11z"/></svg>
            </div>
            <h3>Hyper-local</h3>
            <p>Smart pincode detection means you only see providers who can actually reach you.</p>
          </div>

          <div className={styles.bentoCard}>
            <div className={styles.bentoIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <h3>Secure Payments</h3>
            <p>Lightning-fast online checkout powered by Razorpay, or simply choose Cash on Delivery.</p>
            <div className={styles.bentoBlob} />
          </div>

          <div className={`${styles.bentoCard} ${styles.bentoCardLarge}`}>
            <div className={styles.bentoIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <h3>Instant Payouts & Wallets</h3>
            <p>Vendors can track their real-time earnings, commission splits, and easily request direct bank withdrawals from a premium dashboard.</p>
            <div className={styles.bentoBlob} />
          </div>
        </div>
      </section>

      {/* ======== INTERACTIVE CATEGORIES ======== */}
      <section className={styles.categoriesSection}>
        <div className={styles.categoriesInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>Explore</p>
            <h2 className={styles.sectionTitle}>Find exactly what you're looking for.</h2>
          </div>

          <div className={styles.categoriesGrid}>
            {[
              { name: "Home Services", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
              { name: "Electronics", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg> },
              { name: "Repairs", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg> },
              { name: "Health & Beauty", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
              { name: "Education", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg> },
              { name: "Food & Prep", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> },
              { name: "Creative Arts", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg> },
              { name: "Apparel", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.38 3.46L16 2a8 8 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/></svg> },
            ].map((cat) => (
              <Link href="/products" key={cat.name} className={styles.catCard}>
                <div className={styles.catIcon}>
                  <div style={{ width: "28px", height: "28px" }}>
                    {cat.icon}
                  </div>
                </div>
                <h3>{cat.name}</h3>
                <p>Explore →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======== DARK MODE CTA ======== */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBanner}>
          <div className={styles.ctaGlow} />
          <div className={styles.ctaContent}>
            <h2>Start selling today.</h2>
            <p>
              Join the platform and launch your storefront in minutes. No upfront costs, just incredible tools to help you grow.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/register" className={styles.ctaBtnPrimary} style={{ textDecoration: "none" }}>
                Create Account
              </Link>
              <Link href="/services" className={styles.ctaBtnOutline} style={{ textDecoration: "none" }}>
                Browse Platform
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
