import { motion } from "motion/react";
import { Facebook, Instagram, Twitter, Youtube, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] pt-24 pb-12 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-8">
              NUTAN<span className="text-yellow-500">.</span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-12">
              Redefining the riding experience with premium performance and unmatched style. Your journey starts here.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-yellow-500 hover:border-yellow-500 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            {[
              {
                title: "Showroom",
                links: ["Superbikes", "Street", "Cruisers", "Electric", "Accessories"]
              },
              {
                title: "Services",
                links: ["Maintenance", "Customization", "Financing", "Insurance", "Test Ride"]
              },
              {
                title: "Company",
                links: ["About Us", "Our Story", "Careers", "News", "Contact"]
              }
            ].map((section, i) => (
              <div key={i}>
                <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-8">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm font-medium text-white/60 hover:text-yellow-500 transition-colors flex items-center group">
                        {link}
                        <ArrowUpRight className="w-3 h-3 ml-2 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
            © {currentYear} Nutan Automobile. All Rights Reserved.
          </div>
          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link, i) => (
              <a key={i} href="#" className="text-[10px] font-bold text-white/20 uppercase tracking-widest hover:text-white transition-colors">
                {link}
              </a>
            ))}
            <a href="#admin" className="text-[10px] font-bold text-white/20 uppercase tracking-widest hover:text-yellow-500 transition-colors border-l border-white/5 pl-8">
              Admin
            </a>
          </div>
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
            Designed with <span className="text-yellow-500">Passion</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
