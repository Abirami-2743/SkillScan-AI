import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

interface SignupForm {
  name: string;
  email: string;
  password: string;
  company_name: string;
  company_location: string;
}

export default function Signup() {
  const [form, setForm] = useState<SignupForm>({
    name: "", email: "", password: "", company_name: "", company_location: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [sentEmail, setSentEmail] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("http://127.0.0.1:8000/auth/signup", form);
      setSentEmail(form.email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/auth/resend-verification?email=" + sentEmail);
      alert("Verification email resent!");
    } catch { alert("Failed to resend!"); }
  };

  if (sent) return (
    <div className="verify-page">
      <div className="verify-box">
        <div className="logo-mark" style={{ margin: "0 auto 1.5rem" }}>S</div>
        <div className="verify-icon email">✉</div>
        <h2>Check Your Email!</h2>
        <p>We sent a verification link to</p>
        <strong className="sent-email">{sentEmail}</strong>
        <p style={{ marginTop: "0.5rem", color: "var(--gray)", fontSize: "0.875rem" }}>
          Click the link in your email to activate your account.
        </p>
        <div className="verify-actions">
          <button className="btn-primary" onClick={() => navigate("/login")}>Go to Login</button>
          <button className="btn-text" onClick={resend}>Resend email</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="logo-mark">S</div>
          <span className="brand-name">SkillScan AI</span>
        </div>
        <div className="auth-hero">
          <h1>Hire Smarter,<br />Not Harder</h1>
          <p>Join HR teams using AI to screen hundreds of resumes in seconds and automate candidate communication.</p>
          <div className="feature-list">
            <div className="feature-item">✦ Bulk resume upload (PDF, DOCX, ZIP)</div>
            <div className="feature-item">✦ AI scoring against job description</div>
            <div className="feature-item">✦ Auto email to every candidate</div>
            <div className="feature-item">✦ Ranked candidate dashboard</div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-box">
          <h2>Create Account</h2>
          <p className="auth-sub">Set up your HR workspace</p>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" placeholder="Sarah Johnson" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Work Email</label>
                <input type="email" placeholder="sarah@company.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Company Name</label>
                <input type="text" placeholder="Google" value={form.company_name}
                  onChange={e => setForm({ ...form, company_name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" placeholder="Bangalore" value={form.company_location}
                  onChange={e => setForm({ ...form, company_location: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Create a strong password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating account..." : "Get Started →"}
            </button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
