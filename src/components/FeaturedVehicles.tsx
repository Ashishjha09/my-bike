import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Star, Fuel, Zap, Gauge, X, Check, ChevronRight, Scale, Plus, Minus, Share2, ZoomIn } from "lucide-react";

const renderComparisonRows = (compareIds: string[], vehicles: any[]) => {
  if (vehicles.length === 0) return null;
  const firstVehicle = vehicles[0];
  return Object.keys(firstVehicle.specs).map(specKey => {
    const specName = specKey as keyof typeof firstVehicle.specs;
    const values = compareIds.map(id => {
      const v = vehicles.find(v => v.id === id);
      return v ? v.specs[specName] : "";
    });
    
    const numericValues = values.map(v => parseFloat(v.replace(/[^0-9.]/g, '') || '0'));
    const maxVal = Math.max(...numericValues);
    const minVal = Math.min(...numericValues);
    
    return (
      <tr key={specKey} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
        <td className="p-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">{specKey}</td>
        {values.map((val, idx) => {
          const num = numericValues[idx];
          const isBetter = specKey === 'weight' 
            ? (num === minVal && minVal !== maxVal)
            : (num === maxVal && minVal !== maxVal);

          return (
            <td key={idx} className="p-6 text-center">
              <span className={`text-lg font-black uppercase italic tracking-tighter px-4 py-2 rounded-lg ${
                isBetter ? "text-yellow-500 bg-yellow-500/10 ring-1 ring-yellow-500/20" : "text-white"
              }`}>
                {val}
              </span>
            </td>
          );
        })}
      </tr>
    );
  });
};

export default function FeaturedVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(-3) // Limit to 3 for comparison
    );
  };

  const openVehicle = (vehicle: typeof vehicles[0]) => {
    setSelectedVehicle(vehicle);
    setActiveVariantIndex(0);
    setActiveImageIndex(0);
    document.body.style.overflow = "hidden";
    // Push a state so back button closes the modal
    window.history.pushState({ modal: "details", vehicleId: vehicle.id }, "", `#vehicles?id=${vehicle.id}`);
  };

  const closeVehicle = () => {
    setSelectedVehicle(null);
    document.body.style.overflow = "auto";
    // If we are still in the modal state, go back
    if (window.history.state?.modal === "details") {
      window.history.back();
    } else {
      // Fallback if state is lost
      window.location.hash = "#vehicles";
    }
  };

  const closeCompare = () => {
    setIsCompareOpen(false);
    document.body.style.overflow = "auto";
    if (window.history.state?.modal === "compare") {
      window.history.back();
    }
  };

  const openZoom = (img: string) => {
    setZoomedImage(img);
    document.body.style.overflow = "hidden";
    window.history.pushState({ modal: "zoom" }, "", window.location.hash);
  };

  const closeZoom = () => {
    setZoomedImage(null);
    if (!selectedVehicle && !isCompareOpen) {
      document.body.style.overflow = "auto";
    }
    if (window.history.state?.modal === "zoom") {
      window.history.back();
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedVehicle) return;

    const shareData = {
      title: `${selectedVehicle.brand} ${selectedVehicle.name}`,
      text: `Check out the ${selectedVehicle.brand} ${selectedVehicle.name} on our collection!`,
      url: `${window.location.origin}${window.location.pathname}#vehicles?id=${selectedVehicle.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  // Handle back button to close modals
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (zoomedImage) {
        setZoomedImage(null);
        if (!selectedVehicle && !isCompareOpen) {
          document.body.style.overflow = "auto";
        }
      } else if (selectedVehicle || isCompareOpen) {
        setSelectedVehicle(null);
        setIsCompareOpen(false);
        document.body.style.overflow = "auto";
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedVehicle, isCompareOpen]);

  // Check for vehicle ID in URL on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const vehicleId = params.get('id');
    if (vehicleId) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        // Use a slight delay to ensure the component is fully ready
        const timer = setTimeout(() => openVehicle(vehicle), 100);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  if (isLoading) return (
    <section id="vehicles" className="py-32 bg-[#050505] flex items-center justify-center">
      <div className="text-white/20 font-black text-2xl uppercase italic tracking-tighter animate-pulse">Loading Collection...</div>
    </section>
  );

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
          {vehicles.length > 0 ? (
            vehicles.map((vehicle, index) => (
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
                      src={vehicle.variants[0].images[0] || undefined} 
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
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={(e) => toggleCompare(vehicle.id, e)}
                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                          compareIds.includes(vehicle.id) 
                            ? "bg-yellow-500 border-yellow-500 text-black" 
                            : "border-white/10 text-white/40 hover:border-white/30 hover:text-white"
                        }`}
                        title="Compare"
                      >
                        {compareIds.includes(vehicle.id) ? <Minus className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                      </button>
                      <button className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest hover:text-white transition-colors">
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center bg-[#050505]">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Scale className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Collection is Empty</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Add vehicles through the admin panel to see them here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Compare Bar */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] bg-black/80 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-2xl flex items-center gap-6"
          >
            <div className="flex items-center gap-3 px-4">
              <Scale className="w-5 h-5 text-yellow-500" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                {compareIds.length} {compareIds.length === 1 ? "Vehicle" : "Vehicles"} Selected
              </span>
            </div>
            
            <div className="flex gap-2">
              {compareIds.map(id => {
                const v = vehicles.find(v => v.id === id);
                return (
                  <div key={id} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative group">
                    <img src={v?.variants[0].images[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      onClick={(e) => toggleCompare(id, e)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="h-8 w-px bg-white/10 mx-2" />

            <button 
              onClick={() => {
                if (compareIds.length >= 2) {
                  setIsCompareOpen(true);
                  window.history.pushState({ modal: "compare" }, "");
                  document.body.style.overflow = "hidden";
                }
              }}
              disabled={compareIds.length < 2}
              className={`px-8 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${
                compareIds.length >= 2 
                  ? "bg-yellow-500 text-black hover:bg-white" 
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              Compare Now
            </button>

            <button 
              onClick={() => setCompareIds([])}
              className="p-3 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {isCompareOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-7xl max-h-[90vh] bg-[#0a0a0a] rounded-[40px] border border-white/10 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-yellow-500/10 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Scale className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Performance Comparison</h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Side-by-side specification analysis</p>
                  </div>
                </div>
                <button 
                  onClick={closeCompare}
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Comparison Content */}
              <div className="flex-1 overflow-x-auto custom-scrollbar">
                <div className="min-w-[800px] p-8">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-6 text-left w-1/4"></th>
                        {compareIds.map(id => {
                          const v = vehicles.find(v => v.id === id);
                          return (
                            <th key={id} className="p-6 text-center w-1/4">
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-48 aspect-video rounded-2xl bg-white/5 overflow-hidden">
                                  <img src={v?.variants[0].images[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{v?.name}</h3>
                                  <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">{v?.brand}</p>
                                </div>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="text-white">
                      {/* Price Row */}
                      <tr className="border-b border-white/5">
                        <td className="p-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">Price</td>
                        {compareIds.map(id => (
                          <td key={id} className="p-6 text-center text-2xl font-black italic tracking-tighter">
                            {vehicles.find(v => v.id === id)?.price}
                          </td>
                        ))}
                      </tr>
                      {/* Specs Rows */}
                      {renderComparisonRows(compareIds, vehicles)}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-white/10 bg-black/40 flex justify-center gap-4">
                {compareIds.map(id => (
                  <button 
                    key={id}
                    onClick={() => {
                      const v = vehicles.find(v => v.id === id);
                      if (v) {
                        closeCompare();
                        openVehicle(v);
                      }
                    }}
                    className="px-6 py-3 rounded-xl border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                  >
                    View {vehicles.find(v => v.id === id)?.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                {/* Share Button - Positioned on the left */}
                <button 
                  onClick={handleShare}
                  className="absolute top-8 left-8 z-50 w-[30px] h-[30px] rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-2xl"
                  title="Share Vehicle"
                >
                  <Share2 className="w-[15px] h-[15px]" />
                </button>

                {/* Close Button - Resized to 30x30px and moved to top-8 right-8 */}
                <button 
                  onClick={closeVehicle}
                  className="absolute top-8 right-8 z-50 w-[30px] h-[30px] rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-2xl"
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
                    src={selectedVehicle.variants[activeVariantIndex].images[activeImageIndex] || undefined}
                    alt={selectedVehicle.name}
                    className="w-full h-full object-contain relative z-10 cursor-zoom-in"
                    referrerPolicy="no-referrer"
                    onClick={() => openZoom(selectedVehicle.variants[activeVariantIndex].images[activeImageIndex])}
                  />
                </AnimatePresence>

                {/* Zoom Button */}
                <button 
                  onClick={() => openZoom(selectedVehicle.variants[activeVariantIndex].images[activeImageIndex])}
                  className="absolute bottom-8 left-8 z-50 w-[40px] h-[40px] rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-2xl group"
                  title="Zoom Photo"
                >
                  <ZoomIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>

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
                      <img src={img || undefined} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
                
                {/* Background Text - Reduced size for mobile */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[15vw] lg:text-[20vw] font-black text-white/[0.02] uppercase italic tracking-tighter leading-none">
                    {selectedVehicle.brand}
                  </span>
                </div>
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
                      <div className="text-lg font-black text-white uppercase italic tracking-tighter">{value as any}</div>
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
      {/* Zoom Lightbox */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
            onClick={closeZoom}
          >
            <button 
              onClick={closeZoom}
              className="absolute top-8 right-8 z-[610] w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-2xl"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={zoomedImage} 
                alt="Zoomed bike" 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
