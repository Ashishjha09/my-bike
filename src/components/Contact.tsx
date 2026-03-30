import { motion } from "motion/react";
import { Phone, Mail, MapPin, Clock, ArrowRight, Send } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-32 bg-[#050505] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-24">
          {/* Left: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-yellow-500"></span>
              <span className="text-[10px] font-bold tracking-[0.5em] text-yellow-500 uppercase">Get in Touch</span>
            </div>
            
            <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase italic mb-12">
              START YOUR<br />
              <span className="text-white/20">JOURNEY.</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-12">
              {[
                { icon: <Phone className="w-5 h-5" />, label: "Call Us", value: "+91 98765 43210" },
                { icon: <Mail className="w-5 h-5" />, label: "Email", value: "hello@nutanauto.com" },
                { icon: <MapPin className="w-5 h-5" />, label: "Visit", value: "Main Road, Sector 5, City" },
                { icon: <Clock className="w-5 h-5" />, label: "Hours", value: "Mon - Sat: 9AM - 8PM" }
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="flex items-center gap-4 mb-4 text-yellow-500">
                    {item.icon}
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">{item.label}</span>
                  </div>
                  <div className="text-lg font-black text-white uppercase italic tracking-tighter group-hover:text-yellow-500 transition-colors">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 p-8 bg-white/5 rounded-3xl border border-white/5">
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                Looking for a specific model or have questions about our financing options? Our experts are here to help you find your perfect ride.
              </p>
              <button className="flex items-center gap-3 text-[10px] font-bold text-yellow-500 uppercase tracking-widest hover:text-white transition-colors">
                Download Brochure <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-[#0a0a0a] p-12 rounded-[40px] border border-white/5 relative z-10">
              <form className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-4">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-4">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+91 00000 00000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-4">Interested In</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-yellow-500 transition-colors appearance-none">
                    <option className="bg-[#0a0a0a]">Select Vehicle Type</option>
                    <option className="bg-[#0a0a0a]">Superbike</option>
                    <option className="bg-[#0a0a0a]">Street Fighter</option>
                    <option className="bg-[#0a0a0a]">Cruiser</option>
                    <option className="bg-[#0a0a0a]">Electric Scooter</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-4">Message</label>
                  <textarea 
                    rows={4}
                    placeholder="Tell us about your requirements..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                  ></textarea>
                </div>

                <button className="w-full bg-yellow-500 text-black py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-white transition-all flex items-center justify-center gap-3">
                  Send Inquiry <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 blur-[80px] -z-10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-500/10 blur-[80px] -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
