import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CreateShare from "./pages/CreateShare";
import ViewShare from "./pages/ViewShare";

export default function App() {
  return (
    <>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<CreateShare />} />
          <Route path="/view/:id" element={<ViewShare />} />
        </Routes>
      </div>
    </>
  );
}
