import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface ScanSession {
  _id: string;
  job_title: string;
  company_name: string;
  total_resumes: number;
  results: any[];
  created_at: string;
}

export default function History() {
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/resumes/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(res.data.sessions);
    } catch (err) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => { localStorage.clear(); navigate("/login"); };

  const getShortlisted = (results: any[]) =>
    results.filter(r => r.recommendation === "shortlist").length;

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="nav-brand">
          <div className="logo-mark small">S</div>
          <span>SkillScan AI</span>
        </div>
        <div className="nav-center">
          <button className="nav-link" onClick={() => navigate("/dashboard")}>New Scan</button>
          <button className="nav-link active">History</button>
          <button className="nav-link" onClick={() => navigate("/profile")}>Profile</button>
        </div>
        <div className="nav-right">
          <div className="nav-user">
            <div className="user-avatar">{user.name?.[0] || "H"}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-company">{user.company_name}</div>
            </div>
          </div>
          <button className="btn-outline" onClick={logout}>Logout</button>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Scan History</h1>
          <p>All your previous AI scan sessions</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="scan-spinner"></div>
            <p>Loading history...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No scan history yet</h3>
            <p>Start a new scan session to see results here</p>
            <button className="btn-primary" onClick={() => navigate("/dashboard")}>
              Start First Scan →
            </button>
          </div>
        ) : (
          <div className="history-grid">
            {sessions.map((s, i) => (
              <div key={i} className="history-card"
                onClick={() => navigate("/results", {
                  state: { results: s.results, job_title: s.job_title, company_name: s.company_name }
                })}>
                <div className="history-card-top">
                  <div className="history-icon">🎯</div>
                  <div className="history-meta">
                    <h3>{s.job_title}</h3>
                    <p>{s.company_name}</p>
                  </div>
                  <div className="history-date">
                    {new Date(s.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </div>
                </div>
                <div className="history-stats">
                  <div className="h-stat">
                    <span className="h-num">{s.total_resumes}</span>
                    <span className="h-label">Scanned</span>
                  </div>
                  <div className="h-stat">
                    <span className="h-num green">{getShortlisted(s.results)}</span>
                    <span className="h-label">Shortlisted</span>
                  </div>
                  <div className="h-stat">
                    <span className="h-num red">{s.total_resumes - getShortlisted(s.results)}</span>
                    <span className="h-label">Rejected</span>
                  </div>
                </div>
                <div className="history-view">View Results →</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
