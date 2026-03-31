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
import NavigationHandler from "./components/NavigationHandler";

export default function App() {
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
    </div>
  );
}
