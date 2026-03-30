import { useLocation, useNavigate } from "react-router-dom";

interface Candidate {
  candidate_name: string;
  candidate_email: string;
  score: number;
  skills_matched: string[];
  skills_missing: string[];
  experience_match: string;
  recommendation: "shortlist" | "maybe" | "reject";
  reason: string;
  email_sent: boolean;
}

interface LocationState {
  results: Candidate[];
  job_title: string;
  company_name: string;
}

export default function Results() {
  const { state } = useLocation() as { state: LocationState };
  const navigate = useNavigate();

  const results: Candidate[] = state?.results || [];
  const jobTitle: string = state?.job_title || "Job";
  const companyName: string = state?.company_name || "";

  const getScoreColor = (score: number): string => {
    if (score >= 70) return "score-green";
    if (score >= 40) return "score-amber";
    return "score-red";
  };

  const getBadge = (rec: string) => {
    if (rec === "shortlist") return <span className="badge badge-green">Shortlisted ✓</span>;
    if (rec === "maybe") return <span className="badge badge-amber">Maybe</span>;
    return <span className="badge badge-red">Rejected</span>;
  };

  const shortlisted = results.filter(r => r.recommendation === "shortlist").length;
  const maybe = results.filter(r => r.recommendation === "maybe").length;
  const rejected = results.filter(r => r.recommendation === "reject").length;

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="nav-brand">
          <div className="logo-mark small">S</div>
          <span>SkillScan AI</span>
        </div>
        <div className="nav-center">
          <button className="nav-link" onClick={() => navigate("/dashboard")}>New Scan</button>
          <button className="nav-link" onClick={() => navigate("/history")}>History</button>
          <button className="nav-link" onClick={() => navigate("/profile")}>Profile</button>
        </div>
        <div className="nav-right">
          <button className="btn-outline" onClick={() => navigate("/dashboard")}>
            ← New Scan
          </button>
        </div>
      </nav>

      <main className="results-main">
        <div className="results-header">
          <div>
            <h1>Scan Results</h1>
            <p>{jobTitle} · {companyName} · {results.length} candidates scanned</p>
          </div>
          <div className="results-summary">
            <div className="summary-pill green">{shortlisted} Shortlisted</div>
            <div className="summary-pill amber">{maybe} Maybe</div>
            <div className="summary-pill red">{rejected} Rejected</div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{results.length}</div>
            <div className="stat-label">Total Scanned</div>
          </div>
          <div className="stat-card green">
            <div className="stat-num">{shortlisted}</div>
            <div className="stat-label">Shortlisted</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-num">{maybe}</div>
            <div className="stat-label">Under Review</div>
          </div>
          <div className="stat-card red">
            <div className="stat-num">{rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="empty-state">
            <p>No results found. Go back and scan some resumes!</p>
            <button className="btn-primary" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="candidates-list">
            {results.map((r, i) => (
              <div key={i} className={`candidate-card ${r.recommendation}`}>
                <div className="candidate-rank">#{i + 1}</div>
                <div className="candidate-info">
                  <div className="candidate-top">
                    <div className="candidate-avatar">{r.candidate_name?.[0] || "?"}</div>
                    <div>
                      <h3>{r.candidate_name || "Unknown"}</h3>
                      <p className="candidate-email">{r.candidate_email || "No email found"}</p>
                    </div>
                    {getBadge(r.recommendation)}
                  </div>

                  <p className="candidate-reason">{r.reason}</p>

                  <div className="candidate-details">
                    <div className="skills-section">
                      <div className="skills-group">
                        <span className="skills-label matched">✓ Matched Skills</span>
                        <div className="skills-tags">
                          {(r.skills_matched || []).slice(0, 5).map((s, j) => (
                            <span key={j} className="skill-tag matched">{s}</span>
                          ))}
                        </div>
                      </div>
                      {(r.skills_missing || []).length > 0 && (
                        <div className="skills-group">
                          <span className="skills-label missing">✗ Missing Skills</span>
                          <div className="skills-tags">
                            {(r.skills_missing || []).slice(0, 4).map((s, j) => (
                              <span key={j} className="skill-tag missing">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="candidate-score-section">
                      <div className={`score-circle ${getScoreColor(r.score)}`}>
                        <span className="score-num">{r.score}</span>
                        <span className="score-label">/ 100</span>
                      </div>
                      <div className="exp-badge">
                        Experience: <strong>{r.experience_match}</strong>
                      </div>
                      {r.email_sent && (
                        <div className="email-sent-badge">✉ Email Sent</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
