import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  // Automatically redirect to home page
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-900">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-6">StoryTeller</h1>
        <p className="text-zinc-400 mb-8">
          Loading your stories...
        </p>
      </div>
    </div>
  );
}
