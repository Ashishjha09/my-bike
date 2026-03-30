import React, { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Camera, RotateCw, Maximize2, User, Info, AlertCircle, Scan, CheckCircle2, Sparkles } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// Public 3D model URL for a motorcycle
const BIKE_MODEL_URL = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/motorcycle/model.gltf";

function BikeModel({ color, rotation, onLoad }: { color: string; rotation: [number, number, number]; onLoad: () => void }) {
  const { scene } = useGLTF(BIKE_MODEL_URL);
  const groupRef = useRef<THREE.Group>(null);
  
  // Notify parent when loaded
  useEffect(() => {
    if (scene) onLoad();
  }, [scene, onLoad]);

  // Apply color to the model's materials
  useEffect(() => {
    if (!scene) return;
    try {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            if (child.name.toLowerCase().includes("body") || child.name.toLowerCase().includes("paint")) {
              if (mat && 'color' in mat && (mat as any).color) {
                (mat as any).color.set(color);
              }
            }
          });
        }
      });
    } catch (err) {
      console.error("Error applying color to model:", err);
    }
  }, [scene, color]);

  return (
    <group ref={groupRef} rotation={rotation}>
      <primitive object={scene} scale={1.8} position={[0, -0.8, 0]} />
    </group>
  );
}

function ScanLine() {
  return (
    <motion.div
      initial={{ top: "0%" }}
      animate={{ top: "100%" }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="absolute left-0 right-0 h-1 bg-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.5)] z-30 pointer-events-none"
    />
  );
}

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl">
      <div className="w-20 h-20 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-6" />
      <h4 className="text-white font-black uppercase italic tracking-tighter text-2xl animate-pulse">Assembling Your Ride...</h4>
      <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Preparing 3D AR Environment</p>
    </div>
  );
}

interface VirtualTryOnProps {
  isOpen: boolean;
  onClose: () => void;
  bikeName: string;
  bikeColor: string;
}

// Simple Error Boundary for Three.js
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("Three.js Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h4 className="text-white font-black uppercase italic tracking-tighter text-lg">3D Environment Error</h4>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Failed to initialize 3D scene</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function VirtualTryOn({ isOpen, onClose, bikeName, bikeColor }: VirtualTryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0.3, 0]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setIsModelLoaded(false);
    } else {
      stopCamera();
      setIsAnalyzing(false);
      setAnalysisResult(null);
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setError(null);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setHasPermission(false);
      setError("Camera access denied. Please enable camera permissions to use Virtual Try-On.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleAnalyze = () => {
    if (!isModelLoaded) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      const results = [
        "Perfect Match! This bike complements your style.",
        "Looking Great! The proportions are a perfect fit.",
        "Bold Choice! This model highlights your presence.",
        "Excellent Fit! Ergonomics look ideal for you."
      ];
      setAnalysisResult(results[Math.floor(Math.random() * results.length)]);
    }, 3000);
  };

  const setView = (view: 'front' | 'back' | 'side' | 'top' | 'reset') => {
    switch (view) {
      case 'front': setRotation([0, Math.PI, 0]); break;
      case 'back': setRotation([0, 0, 0]); break;
      case 'side': setRotation([0, Math.PI / 2, 0]); break;
      case 'top': setRotation([Math.PI / 2, 0, 0]); break;
      case 'reset': setRotation([0, 0.3, 0]); break;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black flex flex-col"
        >
        {/* Header */}
        <div className="absolute top-0 inset-x-0 z-50 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
              <Camera className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-white font-black uppercase italic tracking-tighter text-xl">Virtual Try-On</h3>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{bikeName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Camera Feed */}
        <div className="relative flex-1 overflow-hidden">
          {hasPermission === false ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#050505]">
              <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
              <h4 className="text-2xl font-black text-white uppercase italic mb-4">Camera Access Required</h4>
              <p className="text-white/40 max-w-md mb-8">{error}</p>
              <button 
                onClick={startCamera}
                className="bg-yellow-500 text-black px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-white transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {!isModelLoaded && <LoadingSpinner />}
              {isAnalyzing && <ScanLine />}

              {/* 3D Overlay */}
              <div className="absolute inset-0 z-10">
                <ErrorBoundary>
                  <Canvas 
                    shadows 
                    camera={{ position: [0, 0, 4], fov: 50 }} 
                    gl={{ alpha: true, antialias: true }}
                    onCreated={(state) => state.gl.setClearColor(0x000000, 0)}
                  >
                    <Suspense fallback={null}>
                      <Stage environment="city" intensity={0.5}>
                        <PresentationControls
                          global
                          rotation={rotation}
                          polar={[-Math.PI, Math.PI]}
                          azimuth={[-Math.PI, Math.PI]}
                        >
                          <BikeModel color={bikeColor} rotation={[0, 0, 0]} onLoad={() => setIsModelLoaded(true)} />
                        </PresentationControls>
                      </Stage>
                      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
                      <Environment preset="city" />
                    </Suspense>
                  </Canvas>
                </ErrorBoundary>
              </div>

              {/* Analysis Result Overlay */}
              <AnimatePresence>
                {analysisResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="absolute top-32 inset-x-8 z-40 bg-yellow-500 p-6 rounded-3xl flex items-center gap-4 shadow-2xl"
                  >
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="text-black font-black uppercase italic tracking-tighter text-lg">Analysis Complete</h4>
                      <p className="text-black/70 text-xs font-bold uppercase tracking-widest">{analysisResult}</p>
                    </div>
                    <button onClick={() => setAnalysisResult(null)} className="ml-auto text-black/40 hover:text-black">
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* View Presets */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3">
                {['front', 'back', 'side', 'top', 'reset'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setView(view as any)}
                    className={`w-12 h-12 rounded-xl backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-yellow-500 hover:text-black transition-all group ${
                      view === 'reset' ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-black/40'
                    }`}
                  >
                    <span className="text-[8px] font-black uppercase tracking-tighter group-hover:scale-110 transition-transform">{view}</span>
                  </button>
                ))}
              </div>

              {/* Instructions Overlay */}
              <div className="absolute bottom-32 inset-x-0 z-20 flex justify-center pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-3"
                >
                  <User className="w-4 h-4 text-yellow-500" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                    {isAnalyzing ? "Analyzing Person..." : "Stand 5-7 feet away to analyze fit"}
                  </span>
                </motion.div>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="p-8 bg-[#050505] border-t border-white/10 flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <button 
              className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all ${
                isAnalyzing ? 'bg-yellow-500 border-yellow-500 text-black' : 'border-white/10 text-white hover:border-yellow-500 hover:text-yellow-500'
              }`}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              <Scan className={`w-7 h-7 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            </button>
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Analyze Fit</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <button className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white hover:border-yellow-500 hover:text-yellow-500 transition-all">
              <Sparkles className="w-6 h-6" />
            </button>
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Enhance</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white hover:border-yellow-500 hover:text-yellow-500 transition-all">
              <Info className="w-6 h-6" />
            </button>
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Guide</span>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
}
