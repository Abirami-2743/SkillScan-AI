import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface ScanForm {
  job_title: string;
  job_description: string;
  company_name: string;
}

interface User {
  name: string;
  email: string;
  company_name: string;
}

export default function Dashboard() {
  const user: User = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ScanForm>({
    job_title: "",
    job_description: "",
    company_name: user.company_name || "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>("");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleFiles = (fileList: FileList) => {
    setFiles(Array.from(fileList));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleScan = async () => {
    if (!form.job_title || !form.job_description || files.length === 0) {
      alert("Please fill all fields and upload at least one resume!");
      return;
    }
    setLoading(true);
    setProgress("Uploading resumes...");
    try {
      const formData = new FormData();
      formData.append("job_title", form.job_title);
      formData.append("job_description", form.job_description);
      formData.append("company_name", form.company_name);
      files.forEach(f => formData.append("files", f));

      setProgress("AI is scanning resumes...");
      const token = localStorage.getItem("token");
      const res = await axios.post("http://127.0.0.1:8000/resumes/scan", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setProgress("Sending emails to candidates...");
      setTimeout(() => {
        navigate("/results", {
          state: {
            results: res.data.results,
            job_title: form.job_title,
            company_name: form.company_name,
          },
        });
      }, 1000);
    } catch (err: any) {
      alert("Scan failed: " + (err.response?.data?.detail || err.message));
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="nav-brand">
          <div className="logo-mark small">S</div>
          <span>SkillScan AI</span>
        </div>
        <div className="nav-center">
          <button className="nav-link active" onClick={() => navigate("/dashboard")}>New Scan</button>
          <button className="nav-link" onClick={() => navigate("/history")}>History</button>
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
          <h1>New Scan Session</h1>
          <p>Upload resumes and let AI rank your candidates automatically</p>
        </div>

        <div className="dashboard-grid">
          <div className="card scan-card">
            <h3>Job Details</h3>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                placeholder="e.g. Software Engineer"
                value={form.job_title}
                onChange={e => setForm({ ...form, job_title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                placeholder="Your company"
                value={form.company_name}
                onChange={e => setForm({ ...form, company_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Job Description</label>
              <textarea
                placeholder="Paste the full job description here. The AI will score each resume against this..."
                value={form.job_description}
                onChange={e => setForm({ ...form, job_description: e.target.value })}
                rows={8}
              />
            </div>
          </div>

          <div className="card upload-card">
            <h3>Upload Resumes</h3>
            <div
              className={`dropzone ${dragOver ? "drag-active" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
            >
              <div className="dropzone-icon">📄</div>
              <p className="dropzone-title">Drop resumes here or click to upload</p>
              <p className="dropzone-sub">Supports PDF, DOCX, and ZIP files</p>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.zip"
                style={{ display: "none" }}
                onChange={e => e.target.files && handleFiles(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <div className="file-list">
                <div className="file-list-header">
                  <span>{files.length} file{files.length > 1 ? "s" : ""} selected</span>
                  <button className="btn-text" onClick={() => setFiles([])}>Clear all</button>
                </div>
                {files.map((f, i) => (
                  <div key={i} className="file-item">
                    <span className="file-icon">{f.name.endsWith(".zip") ? "🗜️" : "📄"}</span>
                    <span className="file-name">{f.name}</span>
                    <span className="file-size">{(f.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>
            )}

            <div className="scan-info">
              <div className="info-item">
                <span className="info-dot green"></span>
                <span>AI scores each resume 0–100</span>
              </div>
              <div className="info-item">
                <span className="info-dot green"></span>
                <span>Emails auto-sent to candidates</span>
              </div>
              <div className="info-item">
                <span className="info-dot green"></span>
                <span>Results saved to database</span>
              </div>
            </div>

            {loading ? (
              <div className="scanning-state">
                <div className="scan-spinner"></div>
                <p>{progress}</p>
              </div>
            ) : (
              <button className="btn-primary full-width" onClick={handleScan}>
                Start AI Scan →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
