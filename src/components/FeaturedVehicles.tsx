import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Star, Fuel, Zap, Gauge, X, Check, ChevronRight, Camera } from "lucide-react";
import VirtualTryOn from "./VirtualTryOn";

const vehicles = [
  {
    id: "01",
    name: "HyperSport V4",
    brand: "Ducati",
    model: "Panigale V4 2026",
    category: "Superbike",
    price: "₹18,50,000",
    rating: 4.9,
    description: "The Panigale V4 is the first mass-produced Ducati motorcycle to be equipped with a four-cylinder engine, derived directly from the Desmosedici of the MotoGP. It represents the pinnacle of Italian engineering.",
    specs: { speed: "299 km/h", power: "210 hp", weight: "190 kg", engine: "1103cc V4", torque: "124 Nm" },
    variants: [
      { 
        name: "Racing Red", 
        hex: "#ef4444", 
        images: [
          "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&q=80&w=1200"
        ]
      },
      { 
        name: "Dark Stealth", 
        hex: "#171717", 
        images: [
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&q=80&w=1200"
        ]
      },
      { 
        name: "Arctic White", 
        hex: "#f8fafc", 
        images: [
          "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&q=80&w=1200"
        ]
      }
    ],
    color: "from-yellow-500/20"
  },
  {
    id: "02",
    name: "Urban Stealth",
    brand: "Kawasaki",
    model: "Z900 SE",
    category: "Street Fighter",
    price: "₹8,20,000",
    rating: 4.8,
    description: "Dominate the city streets with the Z900 SE. Featuring a powerful inline-four engine and aggressive Sugomi styling, it's built for riders who demand performance and presence.",
    specs: { speed: "180 km/h", power: "95 hp", weight: "175 kg", engine: "948cc I4", torque: "98 Nm" },
    variants: [
      { 
        name: "Emerald Green", 
        hex: "#10b981", 
        images: [
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&q=80&w=1200"
        ]
      },
      { 
        name: "Metallic Black", 
        hex: "#171717", 
        images: [
          "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&q=80&w=1200"
        ]
      }
    ],
    color: "from-blue-500/20"
  },
  {
    id: "03",
    name: "Neo Cruiser",
    brand: "Triumph",
    model: "Rocket 3 R",
    category: "Cruiser",
    price: "₹12,40,000",
    rating: 4.7,
    description: "The ultimate muscle roadster. With the world's largest production motorcycle engine, the Rocket 3 R delivers incredible torque and an unparalleled riding experience.",
    specs: { speed: "160 km/h", power: "75 hp", weight: "220 kg", engine: "2458cc Triple", torque: "221 Nm" },
    variants: [
      { 
        name: "Korosi Red", 
        hex: "#b91c1c", 
        images: [
          "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&q=80&w=1200"
        ]
      },
      { 
        name: "Silver Ice", 
        hex: "#94a3b8", 
        images: [
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&q=80&w=1200"
        ]
      }
    ],
    color: "from-red-500/20"
  }
];

export default function FeaturedVehicles() {
  const [selectedVehicle, setSelectedVehicle] = useState<typeof vehicles[0] | null>(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);

  const openVehicle = (vehicle: typeof vehicles[0]) => {
    setSelectedVehicle(vehicle);
    setActiveVariantIndex(0);
    setActiveImageIndex(0);
    document.body.style.overflow = "hidden";
  };

  const closeVehicle = () => {
    setSelectedVehicle(null);
    document.body.style.overflow = "auto";
  };

  return (
    <section id="vehicles" className="py-32 bg-[#050505] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-yellow-500"></span>
              <span className="text-[10px] font-bold tracking-[0.5em] text-yellow-500 uppercase">The 2026 Collection</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase italic">
              ENGINEERED<br />
              FOR <span className="text-white/20">DOMINANCE.</span>
            </h2>
          </div>
          <button className="flex items-center gap-4 text-white hover:text-yellow-500 transition-colors group">
            <span className="text-[10px] font-bold tracking-widest uppercase">View All Models</span>
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-yellow-500 transition-all">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/5 border-y border-white/5">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative bg-[#050505] p-12 hover:bg-[#0a0a0a] transition-all duration-500 cursor-pointer"
              onClick={() => openVehicle(vehicle)}
            >
              {/* Number Background */}
              <div className="absolute top-8 right-8 text-8xl font-black text-white/5 italic pointer-events-none group-hover:text-yellow-500/10 transition-colors">
                {vehicle.id}
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{vehicle.rating} Rating</span>
                </div>

                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2 group-hover:text-yellow-500 transition-colors">
                  {vehicle.name}
                </h3>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-8">{vehicle.category}</p>

                <div className="relative aspect-[4/3] mb-12 overflow-hidden rounded-2xl bg-white/5">
                  <div className={`absolute inset-0 bg-gradient-to-br ${vehicle.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  <img 
                    src={vehicle.variants[0].images[0]} 
                    alt={vehicle.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                  <div className="flex flex-col gap-1">
                    <Gauge className="w-4 h-4 text-white/20" />
                    <span className="text-[10px] font-bold text-white uppercase">{vehicle.specs.speed}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Zap className="w-4 h-4 text-white/20" />
                    <span className="text-[10px] font-bold text-white uppercase">{vehicle.specs.power}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Fuel className="w-4 h-4 text-white/20" />
                    <span className="text-[10px] font-bold text-white uppercase">{vehicle.specs.weight}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                  <div className="text-2xl font-black text-white italic tracking-tighter">{vehicle.price}</div>
                  <button className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest hover:text-white transition-colors">
                    Configure
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl max-h-[90vh] bg-[#0a0a0a] rounded-[40px] border border-white/10 overflow-hidden flex flex-col lg:flex-row"
            >
              {/* Left: Image Showcase */}
              <div className="lg:w-3/5 relative bg-white/5 p-8 flex items-center justify-center overflow-hidden">
                {/* Close Button - Resized to 30x30px and moved to top-0 right-8 */}
                <button 
                  onClick={closeVehicle}
                  className="absolute top-0 right-8 z-50 w-[30px] h-[30px] rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-2xl"
                >
                  <X className="w-[15px] h-[15px]" />
                </button>

                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${activeVariantIndex}-${activeImageIndex}`}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    src={selectedVehicle.variants[activeVariantIndex].images[activeImageIndex]}
                    alt={selectedVehicle.name}
                    className="w-full h-full object-contain relative z-10"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>

                {/* Thumbnail Gallery - Responsive layout */}
                <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-20 flex flex-row lg:flex-col gap-2 md:gap-3">
                  {selectedVehicle.variants[activeVariantIndex].images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx ? "border-yellow-500 scale-110 shadow-lg" : "border-white/10 opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
                
                {/* Background Text - Reduced size for mobile */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[15vw] lg:text-[20vw] font-black text-white/[0.02] uppercase italic tracking-tighter leading-none">
                    {selectedVehicle.brand}
                  </span>
                </div>

                {/* Virtual Try-On Trigger - Moved to bottom-0 */}
                <button 
                  onClick={() => setIsTryOnOpen(true)}
                  className="absolute bottom-0 left-8 z-20 bg-white text-black px-2.5 py-1.5 rounded-full font-black text-[9px] uppercase hover:bg-yellow-500 transition-all flex items-center gap-1 shadow-xl"
                >
                  <Camera className="w-3 h-3" /> Virtual Try-On
                </button>
              </div>

              {/* Right: Info */}
              <div className="lg:w-2/5 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                {/* Color Selection - Moved to top of info section */}
                <div className="mb-12">
                  <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-6">Available Colors</h4>
                  <div className="flex flex-wrap gap-4">
                    {selectedVehicle.variants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setActiveVariantIndex(index);
                          setActiveImageIndex(0);
                        }}
                        className={`group relative flex items-center gap-3 p-2 pr-6 rounded-full border transition-all ${
                          activeVariantIndex === index 
                            ? "border-yellow-500 bg-yellow-500/10" 
                            : "border-white/10 bg-white/5 hover:border-white/30"
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center"
                          style={{ backgroundColor: variant.hex }}
                        >
                          {activeVariantIndex === index && <Check className="w-4 h-4 text-white mix-blend-difference" />}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          activeVariantIndex === index ? "text-yellow-500" : "text-white/40"
                        }`}>
                          {variant.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[10px] font-bold tracking-[0.5em] text-yellow-500 uppercase">{selectedVehicle.brand}</span>
                  <span className="w-4 h-[1px] bg-white/20"></span>
                  <span className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase">{selectedVehicle.category}</span>
                </div>

                <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-4">
                  {selectedVehicle.name}
                </h2>
                <p className="text-xl font-bold text-white/40 uppercase italic tracking-tighter mb-8">
                  {selectedVehicle.model}
                </p>

                <p className="text-white/60 text-sm leading-relaxed mb-12">
                  {selectedVehicle.description}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                  {Object.entries(selectedVehicle.specs).map(([key, value]) => (
                    <div key={key} className="border-b border-white/5 pb-4">
                      <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">{key}</div>
                      <div className="text-lg font-black text-white uppercase italic tracking-tighter">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 border-t border-white/10">
                  <div>
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Starting Price</div>
                    <div className="text-4xl font-black text-white italic tracking-tighter">{selectedVehicle.price}</div>
                  </div>
                  <button className="w-full sm:w-auto bg-yellow-500 text-black px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-white transition-all flex items-center justify-center gap-2">
                    Book Now <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Virtual Try-On Modal */}
      {selectedVehicle && (
        <VirtualTryOn 
          isOpen={isTryOnOpen}
          onClose={() => setIsTryOnOpen(false)}
          bikeName={selectedVehicle.name}
          bikeColor={selectedVehicle.variants[activeVariantIndex].hex}
        />
      )}
    </section>
  );
}
