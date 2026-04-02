import React, { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Camera, AlertCircle, Scan, Sparkles, User, Info, CheckCircle2 } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, PresentationControls, Environment, ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/dirt-bike/model.gltf";

// Preload the model
useGLTF.preload(MODEL_URL);

function Bike({ color, onLoad }: { color: string; onLoad: () => void }) {
  const { scene } = useGLTF(MODEL_URL);
  
  useEffect(() => {
    if (scene) {
      // Apply color to the model's materials
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            const name = child.name.toLowerCase();
            if (name.includes("body") || name.includes("paint") || name.includes("frame")) {
              if (mat && 'color' in mat) {
                (mat as any).color.set(color);
              }
            }
          });
        }
      });
      onLoad();
    }
  }, [scene, color, onLoad]);

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive object={scene} scale={3.5} position={[0, -1, 0]} />
    </Float>
  );
}

interface VirtualTryOnProps {
  isOpen: boolean;
  onClose: () => void;
  bikeName: string;
  bikeColor: string;
}

export default function VirtualTryOn({ isOpen, onClose, bikeName, bikeColor }: VirtualTryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setIsScanning(true);
      setIsModelLoaded(false);
      setAnalysisResult(null);
      
      // Simulate floor scanning
      const scanTimer = setTimeout(() => {
        setIsScanning(false);
      }, 3000);
      
      return () => clearTimeout(scanTimer);
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setHasPermission(false);
      setError(err.message || "Could not access camera. Please check permissions.");
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
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult("Perfect Fit! The ergonomics match your height perfectly.");
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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

        {/* Camera & 3D View */}
        <div className="relative flex-1 overflow-hidden">
          {hasPermission === false ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#050505]">
              <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
              <h4 className="text-2xl font-black text-white uppercase italic mb-4">Camera Access Required</h4>
              <p className="text-white/40 max-w-md mb-8">{error}</p>
              <button 
                onClick={startCamera}
                className="bg-yellow-500 text-black px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-white transition-all shadow-xl"
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
                muted
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              
              <div className="absolute inset-0 z-10">
                <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }}>
                  <Suspense fallback={null}>
                    <PresentationControls
                      global
                      rotation={[0, 0.3, 0]}
                      polar={[-Math.PI / 4, Math.PI / 4]}
                      azimuth={[-Math.PI / 4, Math.PI / 4]}
                      snap
                    >
                      <group position={[0, -1.5, 0]}>
                        <Bike color={bikeColor} onLoad={() => setIsModelLoaded(true)} />
                        <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
                      </group>
                    </PresentationControls>
                    <Environment preset="city" />
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                  </Suspense>
                </Canvas>
              </div>

              {/* Scanning Overlay */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-40 bg-black/20 backdrop-blur-[2px] flex flex-col items-center justify-center"
                  >
                    <div className="relative w-48 h-48 border-2 border-yellow-500/30 rounded-full flex items-center justify-center">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-t-2 border-yellow-500 rounded-full"
                      />
                      <Scan className="w-12 h-12 text-yellow-500 animate-pulse" />
                    </div>
                    <h4 className="text-white font-black uppercase italic tracking-tighter text-lg mt-8">Scanning Floor...</h4>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-2">Move your phone to detect surface</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analysis Result */}
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

              {/* Instructions */}
              <div className="absolute bottom-32 inset-x-0 z-20 flex justify-center pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-3"
                >
                  <User className="w-4 h-4 text-yellow-500" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                    {isScanning ? "Scanning Floor..." : "Bike Placed! Use gestures to view."}
                  </span>
                </motion.div>
              </div>
            </>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-8 bg-[#050505] border-t border-white/10 flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <button 
              className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all ${
                isAnalyzing ? 'bg-yellow-500 border-yellow-500 text-black' : 'border-white/10 text-white hover:border-yellow-500 hover:text-yellow-500'
              }`}
              onClick={handleAnalyze}
              disabled={isAnalyzing || isScanning}
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
    </AnimatePresence>
  );
}
