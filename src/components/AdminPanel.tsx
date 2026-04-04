import { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Image as ImageIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  price: string;
  rating: number;
  description: string;
  specs: {
    speed: string;
    power: string;
    weight: string;
    engine: string;
    torque: string;
  };
  variants: {
    name: string;
    hex: string;
    images: string[];
  }[];
  color: string;
}

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleSave = async () => {
    if (!editingVehicle) return;

    const method = editingVehicle.id ? "PUT" : "POST";
    const url = editingVehicle.id ? `/api/vehicles/${editingVehicle.id}` : "/api/vehicles";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingVehicle),
      });

      if (res.ok) {
        fetchVehicles();
        setEditingVehicle(null);
      }
    } catch (error) {
      console.error("Failed to save vehicle:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchVehicles();
      }
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
    }
  };

  const addNewVehicle = () => {
    setEditingVehicle({
      name: "",
      brand: "",
      model: "",
      category: "Superbike",
      price: "₹0",
      rating: 5.0,
      description: "",
      specs: { speed: "", power: "", weight: "", engine: "", torque: "" },
      variants: [{ name: "Default", hex: "#ffffff", images: [""] }],
      color: "from-yellow-500/20",
    });
  };

  if (isLoading) return <div className="fixed inset-0 z-[300] bg-black flex items-center justify-center text-white">Loading Admin Panel...</div>;

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex flex-col">
      {/* Header */}
      <div className="p-8 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
            <Save className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Admin Dashboard</h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Manage your vehicle collection</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={addNewVehicle}
            className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-white transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Vehicle
          </button>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Vehicle List */}
        <div className="w-1/3 border-r border-white/10 overflow-y-auto p-8 custom-scrollbar">
          <div className="space-y-4">
            {vehicles.map(v => (
              <div 
                key={v.id}
                onClick={() => setEditingVehicle(v)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer group ${
                  editingVehicle?.id === v.id ? "bg-yellow-500/10 border-yellow-500" : "bg-white/5 border-white/10 hover:border-white/30"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{v.name}</h3>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{v.brand} • {v.category}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(v.id); }}
                    className="p-2 text-white/20 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden bg-black/40">
                  <img src={v.variants[0].images[0] || undefined} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-white/[0.02]">
          <AnimatePresence mode="wait">
            {editingVehicle ? (
              <motion.div
                key={editingVehicle.id || "new"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto space-y-12"
              >
                <section className="space-y-6">
                  <h4 className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Vehicle Name</label>
                      <input 
                        value={editingVehicle.name} 
                        onChange={e => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Brand</label>
                      <input 
                        value={editingVehicle.brand} 
                        onChange={e => setEditingVehicle({ ...editingVehicle, brand: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Model Year/Version</label>
                      <input 
                        value={editingVehicle.model} 
                        onChange={e => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Price</label>
                      <input 
                        value={editingVehicle.price} 
                        onChange={e => setEditingVehicle({ ...editingVehicle, price: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Description</label>
                    <textarea 
                      value={editingVehicle.description} 
                      onChange={e => setEditingVehicle({ ...editingVehicle, description: e.target.value })}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-all resize-none"
                    />
                  </div>
                </section>

                <section className="space-y-6">
                  <h4 className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Specifications</h4>
                  <div className="grid grid-cols-3 gap-6">
                    {Object.keys(editingVehicle.specs || {}).map(key => (
                      <div key={key} className="space-y-2">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{key}</label>
                        <input 
                          value={(editingVehicle.specs as any)[key]} 
                          onChange={e => setEditingVehicle({ 
                            ...editingVehicle, 
                            specs: { ...editingVehicle.specs!, [key]: e.target.value } 
                          })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <h4 className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Media (Images)</h4>
                  <div className="space-y-4">
                    {editingVehicle.variants?.[0].images.map((img, idx) => (
                      <div key={idx} className="flex gap-6 items-start p-6 rounded-2xl bg-white/[0.03] border border-white/10 group/item">
                        <div className="relative w-56 h-36 rounded-xl bg-black border border-white/10 overflow-hidden flex-shrink-0 group/preview shadow-2xl">
                          {img ? (
                            <>
                              <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover/preview:scale-110" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button 
                                  onClick={() => {
                                    const newImages = editingVehicle.variants![0].images.filter((_, i) => i !== idx);
                                    const newVariants = [...editingVehicle.variants!];
                                    newVariants[0].images = newImages;
                                    setEditingVehicle({ ...editingVehicle, variants: newVariants });
                                  }}
                                  className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all hover:scale-110"
                                  title="Remove Image"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                              <ImageIcon className="w-8 h-8 text-white/10" />
                              <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">No Image</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-4 pt-2">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Image Source {idx + 1}</label>
                              <span className="text-[8px] font-bold text-yellow-500/40 uppercase tracking-widest">URL or Base64</span>
                            </div>
                            <textarea 
                              value={img} 
                              onChange={e => {
                                const newImages = [...editingVehicle.variants![0].images];
                                newImages[idx] = e.target.value;
                                const newVariants = [...editingVehicle.variants!];
                                newVariants[0].images = newImages;
                                setEditingVehicle({ ...editingVehicle, variants: newVariants });
                              }}
                              placeholder="Paste image URL or upload a file below..."
                              rows={2}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white/80 focus:border-yellow-500 outline-none transition-all resize-none custom-scrollbar"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => {
                          const newImages = [...(editingVehicle.variants?.[0].images || []), ""];
                          const newVariants = [...(editingVehicle.variants || [{ name: "Default", hex: "#ffffff", images: [] }])];
                          newVariants[0].images = newImages;
                          setEditingVehicle({ ...editingVehicle, variants: newVariants });
                        }}
                        className="flex-1 py-6 border border-dashed border-white/10 rounded-2xl text-[10px] font-bold text-white/40 uppercase tracking-widest hover:border-white/30 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-3 group"
                      >
                        <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" /> Add URL Field
                      </button>
                      
                      <label className="flex-1 py-6 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-3 cursor-pointer group">
                        <ImageIcon className="w-5 h-5 group-hover:scale-125 transition-transform text-yellow-500" /> Upload Local Photo
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64 = reader.result as string;
                                const newImages = [...(editingVehicle.variants?.[0].images || []), base64];
                                const newVariants = [...(editingVehicle.variants || [{ name: "Default", hex: "#ffffff", images: [] }])];
                                newVariants[0].images = newImages;
                                setEditingVehicle({ ...editingVehicle, variants: newVariants });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </section>

                <div className="pt-12 border-t border-white/10 flex justify-end gap-4">
                  <button 
                    onClick={() => setEditingVehicle(null)}
                    className="px-8 py-4 rounded-xl border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-12 py-4 bg-yellow-500 text-black rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-white transition-all shadow-2xl shadow-yellow-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-white/20" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Select a vehicle to edit</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Or create a new one to expand your collection</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
