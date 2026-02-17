import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user && user.id) {
          navigate("/chat", { replace: true });
          return;
        }
      } catch {
        localStorage.removeItem("user");
      }
    }
    navigate("/login", { replace: true });
  }, [navigate]);

  return null;
};

export default Index;
