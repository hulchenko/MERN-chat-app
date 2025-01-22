import { useNavigate } from "react-router-dom";

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full m-auto flex flex-col items-center pt-96 gap-4">
      <h3>Page not found</h3>
      <button className="border border-sky-300 p-2 rounded hover:bg-sky-200" onClick={() => navigate("/")}>
        Home
      </button>
    </div>
  );
};
