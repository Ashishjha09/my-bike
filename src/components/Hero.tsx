import { motion } from "motion/react";
import { ArrowRight, Play, Instagram, Twitter, Facebook } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative h-screen flex items-center bg-[#0a0a0a] overflow-hidden">
      {/* Background Video - Watermark Style */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" /> {/* Overlay to keep text readable */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-20"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-motorcyclist-riding-on-a-highway-at-sunset-27514-large.mp4" 
            type="video/mp4" 
          />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-8 md:px-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-[1px] bg-yellow-500"></span>
            <span className="text-[10px] font-bold tracking-[0.5em] text-yellow-500 uppercase">Est. 1998 • Premium Dealer</span>
            <span className="w-8 h-[1px] bg-yellow-500"></span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-[140px] font-black text-white leading-[0.85] tracking-tighter uppercase italic mb-8 break-words">
            RIDE<br />
            <span className="text-yellow-500">BEYOND.</span>
          </h1>

          <p className="text-white/40 text-sm md:text-base max-w-xl mb-12 leading-relaxed font-medium">
            Discover the ultimate collection of high-performance motorcycles and scooters. Engineered for the bold, designed for the track, and built for the journey ahead.
          </p>

          <div className="flex flex-wrap gap-6 items-center justify-center">
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
