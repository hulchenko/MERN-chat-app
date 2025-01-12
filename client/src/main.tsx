import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import "./index.css";
import { App } from "./App.tsx";
import { NotFound } from "./pages/NotFound.tsx";
import { Room } from "./pages/Room.tsx";
import { Home } from "./pages/Home.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="/:room" element={<Room />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
