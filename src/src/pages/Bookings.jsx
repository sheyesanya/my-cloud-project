import { useEffect, useState } from "react";

const BASE_URL = "https://59ehw8c042.execute-api.us-east-1.amazonaws.com/dev";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/bookings`)
      .then((res) => res.json())
      .then((data) => setBookings(data));
  }, []);

  const handlePay = async (bookingId) => {
    const res = await fetch(`${BASE_URL}/payments/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookingId }),
    });

    const data = await res.json();

    if (data.paymentUrl) {
      window.location.href = data.paymentUrl;
    } else {
      alert("Payment failed");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
    <h1 style={{ marginBottom: "30px" }}>Bookings</h1>

    {bookings.length === 0 ? (
      <p>No bookings yet</p>
    ) : (
      bookings.map((booking) => (
        <div
          key={booking.bookingId}
          style={{
            padding: "20px",
            border: "1px solid #eee",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h3>{booking.target}</h3>
          <p style={{ fontSize: "14px", color: "#888" }}>
            Media Organisation
          </p>
          <p>₦{booking.finalPrice}</p>
          <p>Status: {booking.status}</p>

          {booking.status === "PENDING" && (
            <button
              onClick={() => handlePay(booking.bookingId)}
              style={{
                marginTop: "10px",
                padding: "10px 15px",
                background: "black",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Pay Now
            </button>
          )}
        </div>
      ))
    )}
  </div>
);