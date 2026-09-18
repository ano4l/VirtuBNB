import { FormEvent, useState } from "react";

const benefits = [
  ["Guest conversations", "Keep every stay moving with clear, reviewable guest communication."],
  ["Operations in context", "Bring turnover, maintenance, and arrival details into one calm operating view."],
  ["Approval before action", "Give hosts a clear say before actions that affect a guest or a listing."],
];

function scrollToWaitlist() {
  document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export default function App() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Host or property manager");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading"); setMessage("");
    try {
      const response = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We could not save your place just now.");
      setStatus("success"); setMessage("You are on the list. We will be in touch when pilot invitations open."); setEmail("");
    } catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "We could not save your place just now."); }
  }

  return <main className="marketing-shell">
    <header className="marketing-nav" aria-label="Primary navigation"><a className="brand" href="#top" aria-label="VirtuHost home"><span className="brand-mark">V</span>VirtuHost</a><nav className="nav-links" aria-label="Page sections"><a href="#platform">Platform</a><a href="#partners">Partnerships</a><a href="#waitlist">Waitlist</a></nav><button className="nav-cta" onClick={scrollToWaitlist}>Join waitlist</button></header>
    <section id="top" className="hero-section"><div className="hero-copy"><p className="kicker">Hospitality operations, held together</p><h1>More attentive stays.<br />Less operational drift.</h1><p className="hero-intro">VirtuHost gives short-stay teams one deliberate place to run guest communication and daily operations.</p><div className="hero-actions"><button className="primary-cta" onClick={scrollToWaitlist}>Request an invite <span>→</span></button><a className="text-cta" href="#platform">See the platform</a></div></div><div className="hero-media"><img src="/virtuhost-hero.png" alt="A refined short-stay apartment interior" /><div className="hero-caption">Built around the rhythm of a real stay</div></div></section>
    <section className="channel-strip" aria-label="Channel ecosystem"><p>For professional hosts across their channel ecosystem</p><div><span>Airbnb</span><span>Booking.com</span><span>Direct bookings</span><span>Property teams</span></div></section>
    <section id="platform" className="platform-section"><div className="platform-intro"><p className="kicker">One operating layer</p><h2>The detail behind a five-star stay.</h2><p>VirtuHost is being built for the parts of hospitality that happen between a booking and a great review.</p></div><div className="benefit-grid">{benefits.map(([title, description], index) => <article className={`benefit benefit-${index + 1}`} key={title}><span className="benefit-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section id="partners" className="partner-section"><div className="partner-image"><img src="https://picsum.photos/seed/virtuhost-housekeeping/1100/850" alt="Prepared hospitality suite awaiting a guest" /></div><div className="partner-copy"><p className="kicker">Partner with VirtuHost</p><h2>A better operating experience is an ecosystem effort.</h2><p>We are exploring relationships with channel, property-management, and distribution partners who want hosts to deliver a more responsive guest experience.</p><a href="#waitlist" className="partner-link">Register your interest <span>→</span></a><p className="disclosure">VirtuHost is an independent product. References to marketplaces describe the hosts we aim to support, not an existing partnership or endorsement.</p></div></section>
    <section id="waitlist" className="waitlist-section"><div><p className="kicker">Early access</p><h2>Bring calm to every handover.</h2><p>Join the VirtuHost waitlist for pilot access and product updates.</p></div><form className="waitlist-form" onSubmit={joinWaitlist} noValidate><label htmlFor="waitlist-email">Work email</label><input id="waitlist-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required /><label htmlFor="waitlist-role">I am a</label><select id="waitlist-role" value={role} onChange={(event) => setRole(event.target.value)}><option>Host or property manager</option><option>Channel or marketplace partner</option><option>Property management platform</option><option>Hospitality operator</option></select><button className="primary-cta" type="submit" disabled={status === "loading"}>{status === "loading" ? "Saving your place" : "Join waitlist"} <span>→</span></button><p className={`form-message ${status}`} aria-live="polite">{message || "We only use this to respond about VirtuHost early access."}</p></form></section>
    <footer className="marketing-footer"><a className="brand" href="#top"><span className="brand-mark">V</span>VirtuHost</a><p>Thoughtful operations for exceptional stays.</p><a href="mailto:hello@virtuhost.app">hello@virtuhost.app</a></footer>
  </main>;
}
