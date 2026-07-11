"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";
import { useSettings } from "@/components/ui/SettingsContext";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const itemId = searchParams.get("item_id");
  const itemType = searchParams.get("item_type") || searchParams.get("type");
  const quantity = searchParams.get("quantity") || "1";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [pincodeValid, setPincodeValid] = useState<boolean | null>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "new">("new");

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [billingDetails, setBillingDetails] = useState({
    address: "",
    city: "",
    district: "",
    state: "",
    pincode: ""
  });

  const settings = useSettings();

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      toast.error("Please login to continue to checkout");
      router.push("/login");
      return;
    }
    fetchAddresses(token);

    // Load Razorpay Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const fetchAddresses = async (token: string) => {
    try {
      const res = await api("/user/addresses", { token });
      if (res.status === 200 && res.data.data.length > 0) {
        setSavedAddresses(res.data.data);
        
        // Find default address
        const defaultAddr = res.data.data.find((a: any) => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setBillingDetails({
            address: defaultAddr.address,
            city: defaultAddr.city,
            district: defaultAddr.district || "",
            state: defaultAddr.state,
            pincode: defaultAddr.pincode
          });
        } else {
          setSelectedAddressId(res.data.data[0].id);
          setBillingDetails({
            address: res.data.data[0].address,
            city: res.data.data[0].city,
            district: res.data.data[0].district || "",
            state: res.data.data[0].state,
            pincode: res.data.data[0].pincode
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddressSelect = (id: number | "new") => {
    setSelectedAddressId(id);
    if (id !== "new") {
      const addr = savedAddresses.find(a => a.id === id);
      if (addr) {
        setBillingDetails({
          address: addr.address,
          city: addr.city,
          district: addr.district || "",
          state: addr.state,
          pincode: addr.pincode
        });
      }
    } else {
      setBillingDetails({ address: "", city: "", district: "", state: "", pincode: "" });
    }
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setBillingDetails(prev => ({ ...prev, pincode: val }));
    setPincodeValid(null);
    
    if (val.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const result = await res.json();
        if (result && result.length > 0 && result[0].Status === "Success" && result[0].PostOffice && result[0].PostOffice.length > 0) {
          const post = result[0].PostOffice[0];
          setBillingDetails(prev => ({
            ...prev,
            district: post.District,
            state: post.State
          }));
          setPincodeValid(true);
        } else {
          setPincodeValid(false);
        }
      } catch (err) {
        console.error("Pincode lookup failed", err);
        setPincodeValid(false);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth-token");
      if (!token) throw new Error("Authentication required");
      
      let razorpayPaymentId = null;
      let razorpayOrderId = null;
      let razorpaySignature = null;

      if (paymentMethod === "razorpay") {
        if (!settings?.razorpay_key_id) {
          throw new Error("Razorpay is not configured on this site.");
        }

        // 1. Create Order on Backend
        const orderRes = await api("/checkout/razorpay/order", {
          method: "POST",
          token,
          body: {
            item_id: parseInt(itemId || "0"),
            item_type: itemType || "product",
            quantity: parseInt(quantity)
          }
        });

        if (orderRes.status !== 200 || !orderRes.data?.data) {
          throw new Error(orderRes.data?.message || "Failed to initialize payment");
        }

        const rzpOrderId = orderRes.data.data.order_id;
        const amount = orderRes.data.data.amount;

        // 2. Open Razorpay Checkout Modal
        await new Promise((resolve, reject) => {
          const options = {
            key: settings.razorpay_key_id,
            amount: amount,
            currency: "INR",
            name: settings.site_name || "Store",
            description: "Purchase Order",
            order_id: rzpOrderId,
            handler: function (response: any) {
              razorpayPaymentId = response.razorpay_payment_id;
              razorpayOrderId = response.razorpay_order_id;
              razorpaySignature = response.razorpay_signature;
              resolve(true);
            },
            prefill: {
              name: "Customer",
              email: "customer@example.com",
            },
            theme: {
              color: "#4f46e5",
            },
            modal: {
              ondismiss: function () {
                reject(new Error("Payment cancelled by user"));
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on("payment.failed", function (response: any) {
            reject(new Error(response.error.description));
          });
          rzp.open();
        });
      }

      // 3. Confirm Order with Backend (for both COD and Razorpay)
      const res = await api("/checkout", {
        method: "POST",
        token,
        body: {
          item_id: parseInt(itemId || "0"),
          item_type: itemType || "product",
          quantity: parseInt(quantity),
          payment_method: paymentMethod,
          billing_details: billingDetails,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_order_id: razorpayOrderId,
          razorpay_signature: razorpaySignature
        }
      });

      if (res.status === 201) {
        if (selectedAddressId === "new" && billingDetails.address && billingDetails.pincode) {
          try {
            await api("/user/addresses", {
              method: "POST", token,
              body: { ...billingDetails, is_default: false }
            });
            toast.success("Address saved to your account for future orders!");
          } catch (_) {}
        }
        setSuccess(true);
      } else {
        setError(res.data?.message || res.data?.error || "Checkout failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ width: "80px", height: "80px", background: "var(--success)", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h1 style={{ fontSize: "2rem", marginBottom: "16px", color: "var(--text-primary)" }}>Order Confirmed!</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "1.125rem" }}>Your order has been placed successfully. Thank you for shopping with us.</p>
        <button onClick={() => router.push("/user/orders")} className="btn-primary" style={{ padding: "12px 32px", fontSize: "1.125rem", marginRight: "16px" }}>
          View My Orders
        </button>
        <button onClick={() => router.push("/")} className="btn-secondary" style={{ padding: "12px 32px", fontSize: "1.125rem" }}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "32px", color: "var(--text-primary)" }}>Secure Checkout</h1>
      
      {error && (
        <div style={{ background: "#fef2f2", color: "var(--danger)", padding: "16px", borderRadius: "var(--radius-sm)", marginBottom: "24px", border: "1px solid #fca5a5" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleCheckout} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Billing Details */}
        <div style={{ background: "var(--surface-0)", padding: "32px", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid var(--border-light)" }}>1. Billing & Shipping Details</h2>
          
          {savedAddresses.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "12px", fontSize: "0.875rem", fontWeight: 600 }}>Select Saved Address</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {savedAddresses.map(addr => (
                  <label key={addr.id} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "16px", border: selectedAddressId === addr.id ? "2px solid var(--brand-600)" : "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", cursor: "pointer", background: selectedAddressId === addr.id ? "var(--brand-50)" : "white" }}>
                    <input 
                      type="radio" 
                      name="address_select" 
                      checked={selectedAddressId === addr.id}
                      onChange={() => handleAddressSelect(addr.id)}
                      style={{ marginTop: "4px" }}
                    />
                    <div>
                      <p style={{ margin: "0 0 4px 0", fontWeight: 500, color: "var(--text-primary)" }}>{addr.address}</p>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)" }}>{addr.city}, {addr.state} {addr.pincode}</p>
                    </div>
                  </label>
                ))}
                <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", border: selectedAddressId === "new" ? "2px solid var(--brand-600)" : "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", cursor: "pointer", background: selectedAddressId === "new" ? "var(--brand-50)" : "white" }}>
                  <input 
                    type="radio" 
                    name="address_select" 
                    checked={selectedAddressId === "new"}
                    onChange={() => handleAddressSelect("new")}
                  />
                  <span style={{ fontWeight: 500 }}>Enter a new address</span>
                </label>
              </div>
            </div>
          )}

          {selectedAddressId === "new" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>
                  Pincode / ZIP Code
                </label>
                <div style={{ position: "relative" }}>
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    placeholder="Enter 6-digit pincode"
                    style={{ 
                      width: "100%", 
                      padding: "12px 44px 12px 12px", 
                      border: pincodeValid === true 
                        ? "1px solid rgb(34, 197, 94)" 
                        : pincodeValid === false 
                          ? "1px solid var(--danger)" 
                          : "1px solid var(--border-light)", 
                      borderRadius: "var(--radius-sm)",
                      transition: "border-color 0.2s"
                    }}
                    value={billingDetails.pincode}
                    onChange={handlePincodeChange}
                  />
                  <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                    {pincodeLoading && (
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid var(--brand-300)", borderTopColor: "var(--brand-600)", animation: "spin 0.7s linear infinite" }} />
                    )}
                    {!pincodeLoading && pincodeValid === true && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="9 12 11 14 15 10"/>
                      </svg>
                    )}
                    {!pincodeLoading && pincodeValid === false && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    )}
                  </div>
                </div>
                {pincodeValid === false && (
                  <p style={{ margin: "6px 0 0", fontSize: "0.813rem", color: "var(--danger)" }}>
                    Invalid pincode. Please check and try again.
                  </p>
                )}
                {pincodeValid === true && (
                  <p style={{ margin: "6px 0 0", fontSize: "0.813rem", color: "rgb(34, 197, 94)" }}>
                    Location detected automatically ✓
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Full Address</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Street address, apartment, floor, etc."
                  style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}
                  value={billingDetails.address}
                  onChange={(e) => setBillingDetails({...billingDetails, address: e.target.value})}
                />
              </div>
              
              <div className="grid-two-cols">
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>City</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Your city"
                    style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}
                    value={billingDetails.city}
                    onChange={(e) => setBillingDetails({...billingDetails, city: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>
                    <span>District</span>
                    {billingDetails.district && pincodeValid === true && <span style={{ fontSize: "0.75rem", color: "rgb(34,197,94)", fontWeight: 400 }}>Auto-filled</span>}
                  </label>
                  <input 
                    type="text" 
                    style={{ 
                      width: "100%", padding: "12px", 
                      border: "1px solid var(--border-light)", 
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: billingDetails.district && pincodeValid === true ? "rgba(34,197,94,0.04)" : "white"
                    }}
                    value={billingDetails.district}
                    onChange={(e) => setBillingDetails({...billingDetails, district: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>
                  <span>State</span>
                  {billingDetails.state && pincodeValid === true && <span style={{ fontSize: "0.75rem", color: "rgb(34,197,94)", fontWeight: 400 }}>Auto-filled</span>}
                </label>
                <input 
                  type="text" 
                  required 
                  style={{ 
                    width: "100%", padding: "12px", 
                    border: "1px solid var(--border-light)", 
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: billingDetails.state && pincodeValid === true ? "rgba(34,197,94,0.04)" : "white"
                  }}
                  value={billingDetails.state}
                  onChange={(e) => setBillingDetails({...billingDetails, state: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div style={{ background: "var(--surface-0)", padding: "32px", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid var(--border-light)" }}>2. Payment Method</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label style={{ 
              display: "flex", alignItems: "center", gap: "16px", padding: "16px", 
              border: paymentMethod === "razorpay" ? "2px solid var(--brand-600)" : "1px solid var(--border-light)", 
              borderRadius: "var(--radius-md)", cursor: "pointer", background: paymentMethod === "razorpay" ? "var(--brand-50)" : "white" 
            }}>
              <input 
                type="radio" 
                name="payment_method" 
                value="razorpay" 
                checked={paymentMethod === "razorpay"} 
                onChange={() => setPaymentMethod("razorpay")} 
                style={{ width: "20px", height: "20px", accentColor: "var(--brand-600)" }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: "1.063rem", fontWeight: 600, color: "var(--text-primary)" }}>Pay Online (Razorpay)</h4>
                <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--text-secondary)" }}>Securely pay via Credit/Debit Card, UPI, or Netbanking.</p>
              </div>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand-600)" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </label>

            <label style={{ 
              display: "flex", alignItems: "center", gap: "16px", padding: "16px", 
              border: paymentMethod === "cod" ? "2px solid var(--brand-600)" : "1px solid var(--border-light)", 
              borderRadius: "var(--radius-md)", cursor: "pointer", background: paymentMethod === "cod" ? "var(--brand-50)" : "white" 
            }}>
              <input 
                type="radio" 
                name="payment_method" 
                value="cod" 
                checked={paymentMethod === "cod"} 
                onChange={() => setPaymentMethod("cod")} 
                style={{ width: "20px", height: "20px", accentColor: "var(--brand-600)" }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: "1.063rem", fontWeight: 600, color: "var(--text-primary)" }}>Cash on Delivery (COD)</h4>
                <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--text-secondary)" }}>Pay with cash when your order arrives.</p>
              </div>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand-600)" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary" 
          style={{ padding: "16px", fontSize: "1.125rem", marginTop: "16px", display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          {loading ? (
            <>
              <span className="btn-spinner"></span>
              {paymentMethod === "razorpay" ? "Processing Payment..." : "Confirming Order..."}
            </>
          ) : (
            `Place Order`
          )}
        </button>

      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--background)" }}>
      <Suspense fallback={<div style={{ padding: "80px", textAlign: "center" }}>Loading Checkout...</div>}>
        <CheckoutForm />
      </Suspense>
    </main>
  );
}
