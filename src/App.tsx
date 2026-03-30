/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedVehicles from "./components/FeaturedVehicles";
import Services from "./components/Services";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen selection:bg-brand-primary selection:text-white overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <FeaturedVehicles />
        <Services />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
