import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav
      style={{
        padding: "15px 40px",
        background: "#111",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <h2>SkillScan AI 🤖</h2>
      <div>
        <Link to="/" style={{ color: "white", marginRight: "20px" }}>
          Home
        </Link>
        <Link to="/upload" style={{ color: "white" }}>
          Upload Resume
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;