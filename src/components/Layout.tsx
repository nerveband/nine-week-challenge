import { Outlet } from "react-router-dom";
import { Navigation } from "@/components/Navigation";

export function Layout() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
} 