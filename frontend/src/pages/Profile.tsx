import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AVATARS = ["🧑‍💼", "👩‍💼", "🧑‍💻", "👩‍💻", "🧑‍🔬", "👩‍🔬", "🧑‍🎓", "👩‍🎓", "🦸", "🦸‍♀️", "🧑‍✈️", "👩‍✈️"];

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string>(user.name || "");
  const [company, setCompany] = useState<string>(user.company_name || "");
  const [saved, setSaved] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<string>(user.avatar || "");
  const [showAvatars, setShowAvatars] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string>(user.photo || "");
  const [showPwdForm, setShowPwdForm] = useState<boolean>(false);
  const [pwdForm, setPwdForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwdError, setPwdError] = useState<string>("");
  const [pwdSuccess, setPwdSuccess] = useState<boolean>(false);

  const logout = () => { localStorage.clear(); navigate("/login"); };

  const handleSave = () => {
    const updated = { ...user, name, company_name: company, avatar, photo: photoPreview };
    localStorage.setItem("user", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    setAvatar("");
  };

  const selectAvatar = (a: string) => {
    setAvatar(a);
    setPhotoPreview("");
    setShowAvatars(false);
  };

  const handleChangePassword = async () => {
    setPwdError("");
    if (pwdForm.newPwd !== pwdForm.confirm) { setPwdError("Passwords don't match!"); return; }
    if (pwdForm.newPwd.length < 6) { setPwdError("Password must be at least 6 characters!"); return; }
    try {
      await axios.post("http://127.0.0.1:8000/auth/change-password", {
        email: user.email,
        current_password: pwdForm.current,
        new_password: pwdForm.newPwd,
      });
      setPwdSuccess(true);
      setPwdError("");
      setShowPwdForm(false);
      setPwdForm({ current: "", newPwd: "", confirm: "" });
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (err: any) {
      setPwdError(err.response?.data?.detail || "Failed to change password!");
    }
  };

  const renderAvatar = () => {
    if (photoPreview) return <img src={photoPreview} alt="profile" className="profile-photo" />;
    if (avatar) return <div className="profile-avatar emoji">{avatar}</div>;
    return <div className="profile-avatar">{user.name?.[0] || "H"}</div>;
  };

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
          <button className="nav-link active">Profile</button>
        </div>
        <div className="nav-right">
          <div className="nav-user" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
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
          <h1>HR Profile</h1>
          <p>Manage your account and preferences</p>
        </div>

        <div className="profile-layout">
          {/* LEFT — Avatar Card */}
          <div className="card profile-left-card">
            <div className="profile-avatar-big">
              {renderAvatar()}
              {user.is_verified && <div className="verified-badge" title="Verified HR">✓</div>}
            </div>
            <h2 className="profile-name">{name || user.name}</h2>
            <p className="profile-email">{user.email}</p>
            {user.is_verified
              ? <span className="badge-verified">✓ Verified HR Account</span>
              : <span className="badge-unverified">⚠ Not Verified</span>
            }
            <div className="avatar-actions">
              <button className="btn-avatar-action" onClick={() => fileRef.current?.click()}>
                📷 Upload Photo
              </button>
              <button className="btn-avatar-action" onClick={() => setShowAvatars(!showAvatars)}>
                😊 Choose Avatar
              </button>
              <input ref={fileRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handlePhoto} />
            </div>
            {showAvatars && (
              <div className="avatar-grid">
                {AVATARS.map((a, i) => (
                  <button key={i} className={`avatar-option ${avatar === a ? "selected" : ""}`}
                    onClick={() => selectAvatar(a)}>{a}</button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Edit + Security */}
          <div className="profile-right">
            <div className="card">
              <h3>Edit Profile</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={user.email} disabled
                    style={{ background: "#f3f4f6", color: "#6b7280" }} />
                </div>
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              {saved && <div className="success-msg">✓ Profile saved successfully!</div>}
              {pwdSuccess && <div className="success-msg">✓ Password changed successfully!</div>}
              <button className="btn-primary" onClick={handleSave}>Save Changes</button>
            </div>

            <div className="card" style={{ marginTop: "1.2rem" }}>
              <h3>Account Security</h3>
              <div className="security-row">
                <div>
                  <p className="security-label">Email Verification</p>
                  <p className="security-sub">
                    {user.is_verified ? "Your email is verified ✓" : "Please verify your email"}
                  </p>
                </div>
                <span className={user.is_verified ? "badge-verified" : "badge-unverified"}>
                  {user.is_verified ? "Verified" : "Pending"}
                </span>
              </div>

              <div className="security-row">
                <div>
                  <p className="security-label">Password</p>
                  <p className="security-sub">Click Change to update your password</p>
                </div>
                <button className="btn-change"
                  onClick={() => { setShowPwdForm(!showPwdForm); setPwdError(""); }}>
                  {showPwdForm ? "Cancel" : "Change"}
                </button>
              </div>

              {showPwdForm && (
                <div className="pwd-form">
                  {pwdError && <div className="error-msg">{pwdError}</div>}
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" placeholder="••••••••"
                      value={pwdForm.current}
                      onChange={e => setPwdForm({ ...pwdForm, current: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>New Password</label>
                      <input type="password" placeholder="••••••••"
                        value={pwdForm.newPwd}
                        onChange={e => setPwdForm({ ...pwdForm, newPwd: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input type="password" placeholder="••••••••"
                        value={pwdForm.confirm}
                        onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })} />
                    </div>
                  </div>
                  <button className="btn-primary" onClick={handleChangePassword}>
                    Update Password
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
