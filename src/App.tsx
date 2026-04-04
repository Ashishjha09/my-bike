/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedVehicles from "./components/FeaturedVehicles";
import Services from "./components/Services";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import NavigationHandler from "./components/NavigationHandler";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminOpen(window.location.hash === "#admin");
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Initial check
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="min-h-screen selection:bg-brand-primary selection:text-white overflow-x-hidden">
      <NavigationHandler />
      <Navbar />
      <main>
        <Hero />
        <FeaturedVehicles />
        <Services />
        <Contact />
      </main>
      <Footer />
      
      {isAdminOpen && (
        <AdminPanel onClose={() => {
          setIsAdminOpen(false);
          window.location.hash = "";
        }} />
      )}
    </div>
  );
}
