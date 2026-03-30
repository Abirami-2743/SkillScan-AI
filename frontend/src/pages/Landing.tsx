import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <div className="logo-mark">S</div>
          <span className="brand-name">SkillScan AI</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <button className="btn-outline" onClick={() => navigate("/login")}>Sign In</button>
          <button className="btn-primary-sm" onClick={() => navigate("/signup")}>Get Started →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">✦ AI-Powered Resume Screening</div>
        <h1 className="hero-title">
          Screen 100 Resumes<br />
          <span className="hero-accent">In Under 60 Seconds</span>
        </h1>
        <p className="hero-desc">
          SkillScan AI reads every resume, scores candidates against your job description,
          ranks them from best to worst, and automatically emails each applicant — all without you lifting a finger.
        </p>
        <div className="hero-actions">
          <button className="btn-hero" onClick={() => navigate("/signup")}>Start Free Today →</button>
          <button className="btn-hero-outline" onClick={() => navigate("/login")}>Sign In</button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><span>100+</span><p>Resumes per scan</p></div>
          <div className="hero-stat-divider" />
          <div className="hero-stat"><span>10x</span><p>Faster than manual</p></div>
          <div className="hero-stat-divider" />
          <div className="hero-stat"><span>100%</span><p>Auto email sent</p></div>
          <div className="hero-stat-divider" />
          <div className="hero-stat"><span>AI</span><p>Groq Llama3 powered</p></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how">
        <div className="section-tag">How It Works</div>
        <h2>From Upload to Hired — Fully Automated</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3>Paste Job Description</h3>
            <p>Enter the job title and paste your job description. SkillScan uses this to evaluate every candidate.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h3>Upload Resumes</h3>
            <p>Upload PDFs, DOCX files, or a ZIP from LinkedIn/Naukri/Indeed — bulk upload supported.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h3>AI Scans & Ranks</h3>
            <p>Our AI reads every resume, scores it 0–100, and ranks candidates from best to worst automatically.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-num">04</div>
            <h3>Emails Auto-Sent</h3>
            <p>Shortlisted and rejected candidates each get a professional email — sent automatically, instantly.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-tag">Features</div>
        <h2>Everything HR Needs</h2>
        <div className="features-grid">
          {[
            { icon: "📄", title: "Any Resume Format", desc: "PDF, DOCX, DOC, or ZIP — our parser handles them all." },
            { icon: "🤖", title: "AI Scoring (0–100)", desc: "Groq Llama3 scores each resume against your exact job description." },
            { icon: "📊", title: "Ranked Dashboard", desc: "See all candidates ranked #1 to #N — best match always on top." },
            { icon: "✉️", title: "Auto Email Agent", desc: "Professional shortlist and rejection emails sent automatically." },
            { icon: "🗄️", title: "MongoDB Storage", desc: "All scan sessions and results saved — access history anytime." },
            { icon: "🔒", title: "Secure & Private", desc: "JWT authentication keeps your HR data safe and private." },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-box">
          <h2>Ready to Hire Smarter?</h2>
          <p>Join HR teams using AI to screen candidates in seconds.</p>
          <button className="btn-hero" onClick={() => navigate("/signup")}>Create Free Account →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <div className="logo-mark small">S</div>
          <span>SkillScan AI</span>
        </div>
        <p>Built with FastAPI · MongoDB · Groq AI · React</p>
      </footer>
    </div>
  );
}
