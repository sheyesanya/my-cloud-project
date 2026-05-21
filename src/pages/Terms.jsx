import { Link } from 'react-router-dom';

const LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1779215588/Brandcasta_White_Logo_ekjvew.png';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 12, letterSpacing: '-0.3px' }}>{title}</h2>
    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>{children}</div>
  </div>
);

const P = ({ children }) => <p style={{ marginBottom: 12 }}>{children}</p>;
const Li = ({ children }) => <li style={{ marginBottom: 8, paddingLeft: 4 }}>{children}</li>;
const Ul = ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 12, listStyleType: 'disc' }}>{children}</ul>;

export default function Terms() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', fontFamily: "'Manrope', sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: 'rgba(10,10,15,0.9)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 40px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'white' }}>
          <img src={LOGO} alt="BrandCasta" style={{ width: 28, height: 28, objectFit: 'contain' }}/>
          <span style={{ fontWeight: 800, fontSize: 16 }}>BrandCasta</span>
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/privacy" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/" style={{ fontSize: 13, color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
        </div>
      </nav>

      {/* Header */}
      <div style={{ background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(99,102,241,0.12)', padding: '48px 40px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a5b4fc', marginBottom: 12 }}>Legal</div>
          <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>Terms & Conditions</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            Last updated: May 2026. Please read these terms carefully before using BrandCasta.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '56px 40px' }}>

        <Section title="1. Introduction and Acceptance">
          <P>Welcome to BrandCasta ("Platform", "we", "us", "our"). BrandCasta is a Nigerian media campaign operations platform that connects brands ("Clients") with media organisations and content creators ("Service Providers") to facilitate the booking and management of advertising campaigns across television, radio, podcasts, out-of-home (OOH), print media and influencer marketing.</P>
          <P>By accessing or using BrandCasta at app.brandcasta.co or brandcasta.co, you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you must not use the Platform. These Terms apply to all users including Clients, Service Providers and administrators.</P>
        </Section>

        <Section title="2. Definitions">
          <Ul>
            <Li><strong style={{ color: 'white' }}>Client:</strong> A brand, agency or individual who registers on BrandCasta to book media campaigns.</Li>
            <Li><strong style={{ color: 'white' }}>Service Provider:</strong> A media organisation, broadcaster, publisher, content creator or influencer who registers to list and sell advertising inventory on the Platform.</Li>
            <Li><strong style={{ color: 'white' }}>Booking:</strong> A confirmed reservation of advertising inventory made by a Client through the Platform.</Li>
            <Li><strong style={{ color: 'white' }}>Campaign:</strong> One or more bookings grouped together under a shared brand brief and objective.</Li>
            <Li><strong style={{ color: 'white' }}>Inventory:</strong> Advertising slots, placements or opportunities listed by a Service Provider on the Platform.</Li>
            <Li><strong style={{ color: 'white' }}>Payout:</strong> The payment made to a Service Provider after delivery of a confirmed booking is approved.</Li>
          </Ul>
        </Section>

        <Section title="3. Account Registration">
          <P>To use BrandCasta, you must register for an account. You may register as a Client or apply to register as a Service Provider. By registering, you confirm that:</P>
          <Ul>
            <Li>You are at least 18 years of age or represent an organisation with legal capacity to enter into contracts.</Li>
            <Li>All information you provide during registration is accurate, current and complete.</Li>
            <Li>You will maintain the accuracy of your account information and update it as necessary.</Li>
            <Li>You are responsible for maintaining the confidentiality of your login credentials.</Li>
            <Li>You will notify BrandCasta immediately of any unauthorised use of your account.</Li>
          </Ul>
          <P>Service Provider accounts are subject to review and approval by BrandCasta before access to the Platform is granted. BrandCasta reserves the right to decline any application without providing reasons.</P>
        </Section>

        <Section title="4. How the Platform Works">
          <P><strong style={{ color: 'white' }}>For Clients:</strong> Clients create campaigns by selecting media organisations and specifying inventory options (e.g. a 30-second prime-time TV spot, a billboard on a specific route, a podcast mid-roll). The selected Service Provider receives an email notification and must approve or reject the booking within 24 hours. Upon approval, the Client receives a payment link. Once payment is confirmed, the campaign is live.</P>
          <P><strong style={{ color: 'white' }}>For Service Providers:</strong> Service Providers list their advertising inventory on the Platform, including pricing, available markets and inventory options. When a Client books their inventory, the Service Provider is notified by email and may approve or reject via a one-click link. Service Providers upload delivery proof upon campaign completion, after which BrandCasta reviews and releases payout.</P>
          <P><strong style={{ color: 'white' }}>BrandCasta's role:</strong> BrandCasta acts as an intermediary facilitating the connection between Clients and Service Providers. BrandCasta is not a party to the advertising agreement between a Client and a Service Provider and does not guarantee campaign outcomes or audience delivery metrics.</P>
        </Section>

        <Section title="5. Booking and Cancellation Policy">
          <P><strong style={{ color: 'white' }}>Booking confirmation:</strong> A booking is confirmed only when the Service Provider approves the request and the Client completes payment. Unapproved bookings or unpaid bookings are not confirmed.</P>
          <P><strong style={{ color: 'white' }}>24-hour approval window:</strong> Service Providers must respond to booking requests within 24 hours. Failure to respond within this window will result in automatic cancellation of the booking request. BrandCasta is not liable for any losses arising from a Service Provider's failure to respond.</P>
          <P><strong style={{ color: 'white' }}>Client cancellations:</strong> Once a booking is confirmed and payment has been made, cancellations are subject to the individual Service Provider's cancellation policy, which may result in partial or no refund. Clients should review Service Provider terms before booking.</P>
          <P><strong style={{ color: 'white' }}>Service Provider cancellations:</strong> If a Service Provider cancels a confirmed booking after payment, BrandCasta will facilitate a full refund to the Client. Repeated cancellations by a Service Provider may result in suspension from the Platform.</P>
        </Section>

        <Section title="6. Pricing, Fees and Payments">
          <P><strong style={{ color: 'white' }}>Inventory pricing:</strong> Prices listed on BrandCasta are indicative estimates based on available rate card data. Final pricing is confirmed at the time of booking approval. All prices are quoted in Nigerian Naira (₦) unless stated otherwise.</P>
          <P><strong style={{ color: 'white' }}>Platform commission:</strong> BrandCasta charges a commission on each confirmed booking. This commission is deducted from the total booking value before payout to the Service Provider. Commission rates are communicated to Service Providers during onboarding and may be updated with 30 days' notice.</P>
          <P><strong style={{ color: 'white' }}>Payment processing:</strong> Payments are processed securely via Paystack. BrandCasta does not store Client payment card details. Paystack's terms and conditions apply to all payment transactions.</P>
          <P><strong style={{ color: 'white' }}>Payouts to Service Providers:</strong> Payouts are processed after BrandCasta approves the delivery proof submitted by the Service Provider. Payouts are made to the bank account registered by the Service Provider during onboarding. BrandCasta is not responsible for delays caused by incorrect bank details.</P>
        </Section>

        <Section title="7. Delivery and Proof of Performance">
          <P>Service Providers are required to upload evidence of campaign delivery ("Delivery Proof") upon completion of a booking. Acceptable proof includes screenshots, recordings, broadcast logs, reports, or any other documentation that demonstrates the campaign ran as agreed.</P>
          <P>BrandCasta reviews all delivery proofs before releasing payouts. BrandCasta's review is administrative and does not constitute a guarantee of campaign performance or audience reach. Clients may raise disputes regarding delivery within 7 days of the proof being submitted.</P>
        </Section>

        <Section title="8. Prohibited Conduct">
          <P>Users must not use BrandCasta to:</P>
          <Ul>
            <Li>Promote illegal products, services or content under Nigerian law or applicable international standards.</Li>
            <Li>Book inventory for campaigns promoting gambling, tobacco, alcohol directed at minors, or any content prohibited by the Nigerian Broadcasting Commission (NBC) or Advertising Regulatory Council of Nigeria (ARCON).</Li>
            <Li>Misrepresent their identity, brand or media organisation.</Li>
            <Li>Attempt to circumvent BrandCasta's platform by conducting transactions directly with Service Providers discovered through the Platform.</Li>
            <Li>Upload fraudulent delivery proofs or make false claims about campaign delivery.</Li>
            <Li>Engage in any conduct that disrupts or interferes with the Platform's operation.</Li>
          </Ul>
        </Section>

        <Section title="9. Intellectual Property">
          <P>BrandCasta owns all intellectual property rights in the Platform, including its design, software, trademarks, and content created by BrandCasta. You may not copy, reproduce, distribute or create derivative works from BrandCasta's intellectual property without written permission.</P>
          <P>By uploading campaign briefs, creative assets or delivery proofs to the Platform, you grant BrandCasta a non-exclusive, royalty-free licence to use such content solely for the purpose of operating and improving the Platform.</P>
        </Section>

        <Section title="10. Privacy and Data">
          <P>BrandCasta collects and processes personal data in accordance with our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to BrandCasta's data practices as described in the Privacy Policy.</P>
          <P>BrandCasta takes reasonable technical and organisational measures to protect user data but cannot guarantee absolute security. Users are encouraged to use strong passwords and to report any suspected security breaches promptly.</P>
        </Section>

        <Section title="11. Disclaimers and Limitation of Liability">
          <P>BrandCasta provides the Platform on an "as is" basis. To the fullest extent permitted by Nigerian law, BrandCasta disclaims all warranties, express or implied, regarding the Platform's availability, accuracy or fitness for a particular purpose.</P>
          <P>BrandCasta shall not be liable for any indirect, incidental, consequential or punitive damages arising from your use of the Platform, including but not limited to loss of revenue, loss of campaign effectiveness, or damage to brand reputation.</P>
          <P>BrandCasta's total liability in any matter arising from these Terms shall not exceed the total fees paid by you to BrandCasta in the three months preceding the relevant claim.</P>
        </Section>

        <Section title="12. Termination">
          <P>BrandCasta may suspend or terminate your account at any time if you breach these Terms, engage in fraudulent activity, or for any other reason BrandCasta deems appropriate, with or without prior notice.</P>
          <P>You may terminate your account at any time by contacting notifications@brandcasta.co. Termination does not affect any rights or obligations that arose before termination, including outstanding payments or pending bookings.</P>
        </Section>

        <Section title="13. Governing Law and Disputes">
          <P>These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms shall first be subject to good-faith negotiation between the parties. If unresolved within 30 days, disputes shall be submitted to arbitration in Lagos, Nigeria, in accordance with the Arbitration and Conciliation Act (Cap A18, LFN 2004).</P>
        </Section>

        <Section title="14. Changes to These Terms">
          <P>BrandCasta reserves the right to update these Terms at any time. Updated Terms will be posted on this page with a revised date. Continued use of the Platform after changes constitutes acceptance of the updated Terms. Users will be notified of material changes by email.</P>
        </Section>

        <Section title="15. Contact">
          <P>For questions about these Terms, please contact us at:</P>
          <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', marginTop: 8 }}>
            <p style={{ fontWeight: 700, color: 'white', marginBottom: 4 }}>BrandCasta</p>
            <p>Email: <a href="mailto:notifications@brandcasta.co" style={{ color: '#a5b4fc' }}>notifications@brandcasta.co</a></p>
            <p>Website: <a href="https://brandcasta.co" style={{ color: '#a5b4fc' }}>brandcasta.co</a></p>
          </div>
        </Section>

      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 780, margin: '0 auto' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© 2026 BrandCasta. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
        </div>
      </div>
    </div>
  );
}