import { FormEvent, useState } from "react";

const workflow = [
  { label: "Receive", title: "A host sends one clear request", text: "WhatsApp stays the front door for everyday operating instructions." },
  { label: "Plan", title: "VirtuHost builds a structured proposal", text: "The agent checks context, policy, and the affected booking before it recommends an action." },
  { label: "Approve", title: "The host keeps the final say", text: "Sensitive changes pause for review with the impact shown in plain language." },
  { label: "Confirm", title: "Completion needs evidence", text: "An accepted request is not marked complete until the connected system confirms it." },
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
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We could not save your place just now.");
      setStatus("success");
      setMessage("You are on the list. We will be in touch when pilot invitations open.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "We could not save your place just now.");
    }
  }

  return (
    <main className="marketing-shell">
      <header className="marketing-nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="VirtuHost home"><span className="brand-mark">V</span>VirtuHost</a>
        <nav className="nav-links" aria-label="Page sections"><a href="#agent">Agent model</a><a href="#platform">Platform</a><a href="#partners">Partnerships</a></nav>
        <button className="nav-cta" onClick={scrollToWaitlist}>Join waitlist</button>
      </header>

      <section id="top" className="hero-section">
        <div className="hero-copy">
          <p className="kicker">WhatsApp-first hosting operations</p>
          <h1>Your hosting agent.<br />Built for WhatsApp.</h1>
          <p className="hero-intro">Turn everyday host messages into reviewable plans, approvals, and coordinated work.</p>
          <div className="hero-actions"><button className="primary-cta" onClick={scrollToWaitlist}>Request an invite <span>→</span></button><a className="text-cta" href="#agent">See the agent model</a></div>
        </div>
        <div className="hero-visual" aria-label="Example VirtuHost workflow">
          <img src="/virtuhost-hero.png" alt="A refined short-stay apartment interior" />
          <div className="hero-command">
            <div className="command-source"><span>WhatsApp request</span><time>08:42</time></div>
            <p>“Offer tomorrow’s guest a 13:00 early check-in if housekeeping clears the apartment.”</p>
          </div>
          <div className="hero-agent-card">
            <div className="agent-card-head"><span className="agent-orb" aria-hidden="true" /> <strong>VirtuHost proposal</strong></div>
            <p>Check turnover status, then prepare the guest message.</p>
            <div className="approval-state"><span>Host approval required</span><strong>Ready to review</strong></div>
          </div>
        </div>
      </section>

      <section className="channel-strip" aria-label="Connection principles">
        <p>Designed for official services and authorised integrations</p>
        <div><span>WhatsApp Business</span><span>Airbnb hosts</span><span>Booking.com hosts</span><span>PMS partners</span></div>
      </section>

      <section id="agent" className="agent-section">
        <div className="agent-intro"><p className="kicker">One controlled loop</p><h2>Message in. Evidence out.</h2><p>VirtuHost turns natural-language instructions into bounded operational work, with the host in control at every important decision.</p></div>
        <div className="workflow-grid">
          {workflow.map((item, index) => <article className="workflow-step" key={item.label}><div className="workflow-index">{String(index + 1).padStart(2, "0")}</div><div><span>{item.label}</span><h3>{item.title}</h3><p>{item.text}</p></div></article>)}
        </div>
      </section>

      <section id="platform" className="platform-section">
        <div className="platform-intro"><p className="kicker">Built for the work between stays</p><h2>An agent that understands operating context.</h2><p>Guest communication is only useful when it stays connected to the booking, the property, and the team responsible for delivery.</p></div>
        <div className="capability-grid">
          <article className="capability capability-primary"><div className="capability-copy"><span>Guest communication</span><h3>Draft with the stay in view.</h3><p>VirtuHost brings booking details and property context into each proposed response before a host sends it.</p></div><div className="conversation-preview"><div className="message guest-message">Is an earlier check-in possible tomorrow?</div><div className="message agent-message"><b>Suggested reply</b> I can check the turnover schedule and confirm shortly.</div><div className="preview-state">Draft only. Nothing sent.</div></div></article>
          <article className="capability capability-guardrails"><span>Guardrails</span><h3>Clear approval boundaries.</h3><p>Changes involving guests, availability, or money can pause for host review before execution.</p><div className="guardrail-row"><b>Early check-in offer</b><span>Needs approval</span></div></article>
          <article className="capability capability-memory"><span>Operational memory</span><h3>One context across the stay.</h3><p>Bookings, conversations, tasks, and property details stay linked so the next action starts with the right facts.</p><div className="context-row"><span>Booking</span><span>Guest thread</span><span>Turnover task</span></div></article>
        </div>
      </section>

      <section className="control-section">
        <div className="control-copy"><h2>Useful enough to act. Careful enough to ask.</h2><p>The agent proposes. Deterministic policies decide what needs approval. Connected providers confirm what actually happened.</p></div>
        <div className="control-map" aria-label="VirtuHost responsibility model"><div><span>01</span><strong>Agent</strong><p>Understands the request and drafts the proposed work.</p></div><div><span>02</span><strong>Policy</strong><p>Checks permissions, risk, and whether approval is required.</p></div><div><span>03</span><strong>Provider</strong><p>Performs authorised work and returns a completion signal.</p></div></div>
      </section>

      <section id="partners" className="partner-section">
        <div className="partner-image"><img src="https://picsum.photos/seed/virtuhost-housekeeping/1100/850" alt="Prepared hospitality workspace ready for the operating team" /></div>
        <div className="partner-copy"><p className="kicker">Partner with VirtuHost</p><h2>Guest experience is an ecosystem effort.</h2><p>We are exploring relationships with channel, property-management, and distribution partners who want hosts to coordinate work with less friction.</p><a href="#waitlist" className="partner-link">Register your interest <span>→</span></a><p className="disclosure">VirtuHost is an independent product. References to WhatsApp and booking marketplaces describe the services and hosts we aim to support, not an existing partnership or endorsement.</p></div>
      </section>

      <section id="waitlist" className="waitlist-section">
        <div><p className="kicker">Early access</p><h2>Run the stay from one conversation.</h2><p>Join the VirtuHost waitlist for pilot access and product updates.</p></div>
        <form className="waitlist-form" onSubmit={joinWaitlist} noValidate>
          <label htmlFor="waitlist-email">Work email</label><input id="waitlist-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required />
          <label htmlFor="waitlist-role">I am a</label><select id="waitlist-role" value={role} onChange={(event) => setRole(event.target.value)}><option>Host or property manager</option><option>Channel or marketplace partner</option><option>Property management platform</option><option>Hospitality operator</option></select>
          <button className="primary-cta" type="submit" disabled={status === "loading"}>{status === "loading" ? "Saving your place" : "Join waitlist"} <span>→</span></button>
          <p className={`form-message ${status}`} aria-live="polite">{message || "We only use this to respond about VirtuHost early access."}</p>
        </form>
      </section>

      <footer className="marketing-footer"><a className="brand" href="#top"><span className="brand-mark">V</span>VirtuHost</a><p>WhatsApp-first operations for exceptional stays.</p><a href="mailto:hello@virtuhost.app">hello@virtuhost.app</a></footer>
    </main>
  );
}
