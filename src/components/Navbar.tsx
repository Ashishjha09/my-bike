import { useState, useEffect } from "react";
import { Menu, X, Instagram, Twitter, Facebook, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Collection", href: "#vehicles" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-black/90 backdrop-blur-xl py-4" : "bg-transparent py-8"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
        {/* Socials - Left */}
        <div className="hidden lg:flex items-center gap-6 text-white/40">
          <Instagram className="w-4 h-4 hover:text-yellow-500 cursor-pointer transition-colors" />
          <Twitter className="w-4 h-4 hover:text-yellow-500 cursor-pointer transition-colors" />
          <Facebook className="w-4 h-4 hover:text-yellow-500 cursor-pointer transition-colors" />
        </div>

        {/* Logo - Center */}
        <div className="flex flex-col items-center">
          <a href="#home" className="text-2xl font-black text-white tracking-[0.3em] uppercase italic">
            NUTAN<span className="text-yellow-500">.</span>
          </a>
          <span className="text-[7px] font-bold tracking-[0.5em] text-white/30 uppercase mt-1">Automobile</span>
        </div>

        {/* Actions - Right */}
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-[10px] font-bold text-white/60 hover:text-yellow-500 tracking-[0.2em] uppercase transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-white/60 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-black border-t border-white/5 p-8 lg:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xl font-black text-white uppercase italic tracking-tighter"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
