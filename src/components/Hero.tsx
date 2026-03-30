import { motion } from "motion/react";
import { ArrowRight, Play, Instagram, Twitter, Facebook } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative h-screen flex items-center bg-[#0a0a0a] overflow-hidden">
      {/* Background Text - Watermark Style */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <motion.h2 
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 0.03, scale: 1 }}
          transition={{ duration: 2 }}
          className="text-[30vw] font-black text-white leading-none tracking-tighter italic"
        >
          NUTAN
        </motion.h2>
      </div>

      <div className="flex w-full h-full">
        {/* Left Pane: Content & Typography */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-8 md:px-20 relative z-20 border-r border-white/5">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-[1px] bg-yellow-500"></span>
              <span className="text-[10px] font-bold tracking-[0.5em] text-yellow-500 uppercase">Est. 1998 • Premium Dealer</span>
            </div>

            <h1 className="text-7xl md:text-[120px] font-black text-white leading-[0.85] tracking-tighter uppercase italic mb-8">
              RIDE<br />
              <span className="text-yellow-500">BEYOND.</span>
            </h1>

            <p className="text-white/40 text-sm md:text-base max-w-md mb-12 leading-relaxed font-medium">
              Discover the ultimate collection of high-performance motorcycles and scooters. Engineered for the bold, designed for the track, and built for the journey ahead.
            </p>

            <div className="flex flex-wrap gap-6 items-center">
              <button className="group relative bg-white text-black px-10 py-5 rounded-full font-black text-xs tracking-[0.2em] uppercase overflow-hidden transition-all hover:pr-14">
                <span className="relative z-10">Explore Models</span>
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all w-5 h-5" />
              </button>
              
              <button className="flex items-center gap-4 text-white/60 hover:text-white transition-colors group">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase">Watch Film</span>
              </button>
            </div>
          </motion.div>

          {/* Social Rail */}
          <div className="absolute bottom-12 left-8 md:left-20 flex items-center gap-8 text-white/20">
            <Instagram className="w-4 h-4 hover:text-yellow-500 cursor-pointer transition-colors" />
            <Twitter className="w-4 h-4 hover:text-yellow-500 cursor-pointer transition-colors" />
            <Facebook className="w-4 h-4 hover:text-yellow-500 cursor-pointer transition-colors" />
            <div className="w-12 h-[1px] bg-white/10"></div>
            <span className="text-[9px] font-bold tracking-[0.3em] uppercase">Follow the Spirit</span>
          </div>
        </div>

        {/* Right Pane: Visual Showcase */}
        <div className="hidden lg:flex w-1/2 h-full relative bg-[#0d0d0d] items-center justify-center overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.05),transparent_70%)]" />
            <motion.div 
              animate={{ 
                x: ["-100%", "100%"],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"
            />
          </div>

          {/* The Bike - Cinematic Presentation */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative z-10"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 1, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <img 
                src="https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=1200" 
                alt="Premium Motorcycle" 
                className="w-[800px] h-auto drop-shadow-[0_60px_60px_rgba(0,0,0,0.8)] grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Glowing Accents */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-yellow-500/10 blur-[80px] rounded-full" />
          </motion.div>

          {/* Stats Overlay */}
          <div className="absolute top-20 right-20 flex flex-col gap-8">
            {[
              { label: "Top Speed", value: "299", unit: "KM/H" },
              { label: "Acceleration", value: "2.8", unit: "SEC" },
              { label: "Engine", value: "998", unit: "CC" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="text-right"
              >
                <div className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-3xl font-black text-white italic tracking-tighter">
                  {stat.value}<span className="text-xs ml-1 opacity-40">{stat.unit}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 right-12 hidden md:flex flex-col items-center gap-4 z-30">
        <div className="w-[1px] h-20 bg-gradient-to-b from-white/20 to-transparent relative">
          <motion.div 
            animate={{ top: ["0%", "100%"], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full"
          />
        </div>
        <span className="text-[8px] font-bold tracking-[0.5em] text-white/20 uppercase vertical-text">Scroll</span>
      </div>
    </section>
  );
}
