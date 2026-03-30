import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) { setStatus("error"); setMessage("Invalid verification link!"); return; }
    verifyEmail(token);
  }, []);

  const verifyEmail = async (token: string) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/auth/verify?token=${token}`);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setStatus("success");
      setTimeout(() => navigate("/dashboard"), 2500);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.detail || "Verification failed!");
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-box">
        <div className="logo-mark" style={{ margin: "0 auto 1.5rem" }}>S</div>
        {status === "loading" && (
          <>
            <div className="scan-spinner" style={{ margin: "0 auto 1rem" }}></div>
            <h2>Verifying your email...</h2>
            <p>Just a moment!</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="verify-icon success">✓</div>
            <h2>Email Verified!</h2>
            <p>Your HR account is now active. Redirecting to dashboard...</p>
            <div className="verify-progress"></div>
          </>
        )}
        {status === "error" && (
          <>
            <div className="verify-icon error">✗</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <button className="btn-primary" onClick={() => navigate("/signup")}>
              Back to Signup
            </button>
          </>
        )}
      </div>
    </div>
  );
}
