import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CreateShare from "./pages/CreateShare";
import ViewShare from "./pages/ViewShare";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<CreateShare />} />
        <Route path="/s/:id" element={<ViewShare />} />
      </Routes>
    </>
  );
}

export default App;
