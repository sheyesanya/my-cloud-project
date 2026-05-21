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

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', fontFamily: "'Manrope', sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: 'rgba(10,10,15,0.9)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 40px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'white' }}>
          <img src={LOGO} alt="BrandCasta" style={{ width: 28, height: 28, objectFit: 'contain' }}/>
          <span style={{ fontWeight: 800, fontSize: 16 }}>BrandCasta</span>
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/terms" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Terms & Conditions</Link>
          <Link to="/" style={{ fontSize: 13, color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
        </div>
      </nav>

      {/* Header */}
      <div style={{ background: 'rgba(20,184,166,0.05)', borderBottom: '1px solid rgba(20,184,166,0.12)', padding: '48px 40px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5eead4', marginBottom: 12 }}>Legal</div>
          <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            Last updated: May 2026. This policy explains how BrandCasta collects, uses and protects your personal information.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '56px 40px' }}>

        <Section title="1. Who We Are">
          <P>BrandCasta ("we", "us", "our") is a Nigerian media campaign operations platform operating at brandcasta.co and app.brandcasta.co. We connect brands ("Clients") with media organisations and content creators ("Service Providers") to facilitate the booking and management of advertising campaigns across Nigeria.</P>
          <P>We are committed to protecting your privacy and handling your personal data responsibly, in accordance with the Nigeria Data Protection Act 2023 (NDPA) and applicable data protection principles.</P>
          <P>For any privacy-related enquiries, contact us at: <a href="mailto:notifications@brandcasta.co" style={{ color: '#5eead4' }}>notifications@brandcasta.co</a></P>
        </Section>

        <Section title="2. What Data We Collect">
          <P><strong style={{ color: 'white' }}>2.1 Data you provide directly</strong></P>
          <Ul>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Account information:</strong> Name, email address, password (encrypted), phone number, and company/brand name when you register.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Client profile data:</strong> Brand name, industry, website, campaign briefs, promotional materials uploaded to the Platform.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Service Provider application data:</strong> Organisation name, contact details, media category, markets covered, audience demographics, monthly reach figures, and bank account details for payouts.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Payment information:</strong> Payment is processed via Paystack. We do not store card numbers or sensitive payment credentials — these are handled directly by Paystack.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Delivery proofs:</strong> Files, links and notes uploaded by Service Providers to confirm campaign delivery.</Li>
          </Ul>

          <P><strong style={{ color: 'white' }}>2.2 Data collected automatically</strong></P>
          <Ul>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Usage data:</strong> Pages visited, features used, time spent on the Platform, clicks and interactions.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Device and technical data:</strong> IP address, browser type, operating system, device identifiers.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Authentication data:</strong> Login timestamps and authentication tokens managed via Google Firebase Authentication.</Li>
          </Ul>

          <P><strong style={{ color: 'white' }}>2.3 Data from third parties</strong></P>
          <Ul>
            <Li>If you sign in with Google, we receive your name and email address from Google in accordance with Google's privacy policy.</Li>
            <Li>Payment status and transaction references from Paystack to confirm booking payments.</Li>
          </Ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <P>We use personal data for the following purposes:</P>
          <Ul>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Platform operations:</strong> To create and manage your account, process bookings, send booking notifications, confirm payments and manage campaign workflows.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Communications:</strong> To send transactional emails (booking requests, approvals, rejections, payment links, delivery confirmations) and platform updates. These are essential to the service and cannot be opted out of while you hold an active account.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Service Provider payouts:</strong> Bank account details provided by Service Providers are used solely to process campaign payouts. They are not shared with Clients or other third parties.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Platform improvement:</strong> To analyse usage patterns, identify bugs, improve features and develop new functionality.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Legal compliance:</strong> To comply with Nigerian law, respond to legal requests, enforce our Terms and Conditions, and protect our rights and users' rights.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Marketing (optional):</strong> With your consent, to send newsletters, product updates and promotional content. You may unsubscribe at any time.</Li>
          </Ul>
        </Section>

        <Section title="4. Legal Basis for Processing">
          <P>Under the Nigeria Data Protection Act 2023, we process your personal data on the following legal bases:</P>
          <Ul>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Contract performance:</strong> Processing necessary to operate your account and deliver the services you've requested (bookings, payments, campaign management).</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Legitimate interests:</strong> Platform security, fraud prevention, improving the Platform, and business analytics — where such interests are not overridden by your rights.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Legal obligation:</strong> Where we must retain or disclose data to comply with Nigerian law.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Consent:</strong> For optional marketing communications and cookies beyond those strictly necessary.</Li>
          </Ul>
        </Section>

        <Section title="5. Who We Share Your Data With">
          <P>We do not sell your personal data. We share data only as follows:</P>
          <Ul>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Between Clients and Service Providers:</strong> When a Client books a Service Provider's inventory, the booking details (brand name, campaign brief, contact email) are shared with the Service Provider. Service Provider contact details (email) are NOT shared with Clients — all communications are routed through BrandCasta.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Google Firebase:</strong> Authentication and session management. Google's privacy policy applies.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Paystack:</strong> Payment processing. Paystack's privacy policy applies to all payment transactions.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Amazon Web Services (AWS):</strong> Our backend infrastructure runs on AWS (DynamoDB, Lambda, S3) in the us-east-1 region. Uploaded files (briefs, delivery proofs) are stored in encrypted S3 buckets.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Resend:</strong> Email delivery service used to send transactional emails.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Law enforcement:</strong> Where required by valid legal process under Nigerian law.</Li>
          </Ul>
        </Section>

        <Section title="6. Data Retention">
          <P>We retain your personal data for as long as your account is active or as needed to provide services. Specifically:</P>
          <Ul>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Account data:</strong> Retained while your account is active. Deleted within 90 days of account closure upon request.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Booking and campaign records:</strong> Retained for 7 years for financial and legal compliance purposes.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Delivery proofs:</strong> Retained for 2 years after campaign completion.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Bank details (Service Providers):</strong> Retained while the Service Provider account is active and for 7 years thereafter for financial compliance.</Li>
          </Ul>
        </Section>

        <Section title="7. Your Rights">
          <P>Under the Nigeria Data Protection Act 2023, you have the following rights regarding your personal data:</P>
          <Ul>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Right of access:</strong> Request a copy of the personal data we hold about you.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Right to rectification:</strong> Request correction of inaccurate or incomplete data.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Right to erasure:</strong> Request deletion of your data, subject to legal retention requirements.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Right to data portability:</strong> Request your data in a structured, machine-readable format.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Right to object:</strong> Object to processing based on legitimate interests, including marketing.</Li>
            <Li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Right to withdraw consent:</strong> Withdraw consent at any time where processing is consent-based.</Li>
          </Ul>
          <P>To exercise any of these rights, email us at <a href="mailto:notifications@brandcasta.co" style={{ color: '#5eead4' }}>notifications@brandcasta.co</a>. We will respond within 30 days.</P>
        </Section>

        <Section title="8. Cookies and Tracking">
          <P>BrandCasta uses essential cookies and browser storage to maintain your login session and platform preferences. These are strictly necessary for the Platform to function and cannot be disabled.</P>
          <P>We do not currently use advertising cookies, third-party tracking pixels or cross-site tracking technologies. If this changes, we will update this Policy and seek your consent where required.</P>
        </Section>

        <Section title="9. Security">
          <P>We implement technical and organisational measures to protect your data including:</P>
          <Ul>
            <Li>HTTPS encryption for all data in transit.</Li>
            <Li>Encrypted storage for files uploaded to the Platform (AWS S3 server-side encryption).</Li>
            <Li>Firebase Authentication for secure login and session management.</Li>
            <Li>Role-based access controls limiting data access to authorised personnel only.</Li>
            <Li>AWS IAM policies restricting database and storage access.</Li>
          </Ul>
          <P>No security measure is 100% guaranteed. If you discover a security vulnerability, please report it responsibly to notifications@brandcasta.co.</P>
        </Section>

        <Section title="10. Children's Privacy">
          <P>BrandCasta is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.</P>
        </Section>

        <Section title="11. Cross-Border Data Transfers">
          <P>Your data is stored on Amazon Web Services infrastructure located in the United States (us-east-1 region). By using BrandCasta, you consent to this transfer. We ensure appropriate safeguards are in place in accordance with the NDPA and applicable data protection standards.</P>
        </Section>

        <Section title="12. Changes to This Policy">
          <P>We may update this Privacy Policy from time to time. We will notify you of material changes by email and by posting the updated Policy on this page with a revised date. Your continued use of the Platform after changes constitutes acceptance of the updated Policy.</P>
        </Section>

        <Section title="13. Contact and Complaints">
          <P>For any privacy concerns, data requests or complaints:</P>
          <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(20,184,166,0.07)', border: '1px solid rgba(20,184,166,0.18)', marginTop: 8 }}>
            <p style={{ fontWeight: 700, color: 'white', marginBottom: 4 }}>BrandCasta Data Privacy</p>
            <p>Email: <a href="mailto:notifications@brandcasta.co" style={{ color: '#5eead4' }}>notifications@brandcasta.co</a></p>
            <p>Website: <a href="https://brandcasta.co" style={{ color: '#5eead4' }}>brandcasta.co</a></p>
          </div>
          <P style={{ marginTop: 12 }}>You also have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) at ndpc.gov.ng if you believe your data rights have been violated.</P>
        </Section>

      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 780, margin: '0 auto' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© 2026 BrandCasta. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/terms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms & Conditions</Link>
          <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
        </div>
      </div>
    </div>
  );
}