import React, { useState, useRef, useEffect, Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Camera, RotateCw, Maximize2, User, Info, AlertCircle, Scan, CheckCircle2, Sparkles } from "lucide-react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls, Environment, ContactShadows, Grid, Float } from "@react-three/drei";
import { XR, createXRStore, XRButton, useXR } from "@react-three/xr";
import * as THREE from "three";

const store = createXRStore({
  depthSensing: true,
  hand: false,
  controller: false,
  hitTest: true,
});

function ARManager({ isModelLoaded }: { isModelLoaded: boolean }) {
  const xr = useXR();
  
  // If we are in AR, we might want to hide the standard grid
  // and show a placement indicator
  return null;
}

// Public 3D model URL for a motorcycle
const BIKE_MODEL_URL = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/motorcycle/model.gltf";

// Preload the model
useGLTF.preload(BIKE_MODEL_URL);

function BikeModel({ color, onLoad }: { color: string; onLoad: () => void }) {
  console.log("BikeModel: Starting to load GLTF model from", BIKE_MODEL_URL);
  const { scene } = useGLTF(BIKE_MODEL_URL);
  const groupRef = useRef<THREE.Group>(null);
  
  // Clone scene for safety in React
  const clonedScene = useMemo(() => {
    if (scene) {
      const clone = scene.clone();
      return clone;
    }
    return null;
  }, [scene]);

  // Notify parent when loaded
  useEffect(() => {
    if (scene) {
      console.log("BikeModel: GLTF model loaded successfully");
      onLoad();
    }
  }, [scene, onLoad]);

  // Apply color to the model's materials
  useEffect(() => {
    if (!clonedScene) return;
    try {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            const name = child.name.toLowerCase();
            if (name.includes("body") || name.includes("paint") || name.includes("frame")) {
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
  }, [clonedScene, color]);

  if (!clonedScene) return null;

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive 
        object={clonedScene} 
        scale={4.5} 
        position={[0, -1.5, 0]} 
      />
    </Float>
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

function LoadingSpinner({ onRetry, onSkip, showRetry }: { onRetry?: () => void; onSkip?: () => void; showRetry?: boolean }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-8 text-center pointer-events-none">
      <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-4" />
      <h4 className="text-white font-black uppercase italic tracking-tighter text-lg animate-pulse">Optimizing 3D View...</h4>
      
      {showRetry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mt-4 pointer-events-auto"
        >
          <div className="flex gap-2">
            <button 
              onClick={onRetry}
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-black text-[8px] tracking-widest uppercase hover:bg-white transition-all"
            >
              Retry
            </button>
            <button 
              onClick={onSkip}
              className="bg-white/10 text-white px-4 py-2 rounded-lg font-black text-[8px] tracking-widest uppercase hover:bg-white hover:text-black transition-all"
            >
              Skip 3D
            </button>
          </div>
        </motion.div>
      )}
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
  const [showLoadingRetry, setShowLoadingRetry] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setIsModelLoaded(false);
      setShowLoadingRetry(false);
      
      // Set a timeout for loading
      loadingTimeoutRef.current = setTimeout(() => {
        if (!isModelLoaded) {
          setShowLoadingRetry(true);
        }
      }, 5000); // 5 seconds
    } else {
      stopCamera();
      setIsAnalyzing(false);
      setAnalysisResult(null);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    }
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (isModelLoaded && loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      setShowLoadingRetry(false);
    }
  }, [isModelLoaded]);

  const handleRetryLoading = () => {
    setIsModelLoaded(false);
    setShowLoadingRetry(false);
    // Trigger a re-render or reload if possible
    window.location.reload(); // Simplest way to clear cache and retry
  };

  const handleSkipLoading = () => {
    setIsModelLoaded(true); // This will hide the spinner
    setShowLoadingRetry(false);
  };

  const startCamera = async () => {
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser does not support camera access or the connection is not secure.");
      setHasPermission(false);
      return;
    }
    try {
      // Try with ideal constraints first
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
      } catch (firstErr) {
        console.warn("Initial camera request failed, trying fallback:", firstErr);
        // Fallback to any video source
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setError(null);
      }
    } catch (err: any) {
      console.error("Camera error details:", err);
      setHasPermission(false);
      
      const errorName = err.name || "";
      
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        setError("Camera access was denied. To fix this:\n1. Click the lock/camera icon in your browser's address bar.\n2. Change 'Camera' permission to 'Allow'.\n3. Click the 'Refresh Page' button below.");
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setError("No camera was found on this device. Please ensure your camera is connected.");
      } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        setError("Camera is already in use by another application. Please close other apps and try again.");
      } else {
        setError(`Camera error: ${err.message || "An unexpected error occurred while accessing the camera."}`);
      }
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
              <p className="text-white/40 max-w-md mb-8 whitespace-pre-line">{error}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={startCamera}
                  className="bg-yellow-500 text-black px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-white transition-all"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all"
                >
                  Refresh Page
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("App link copied! Open it in a new browser tab to grant permissions.");
                  }}
                  className="bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all"
                >
                  Copy App Link
                </button>
              </div>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedData={() => console.log("Video stream loaded")}
                onPlay={() => console.log("Video playing")}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              
              {/* 3D Overlay - Moved up in Z-index to be above spinner if needed, but usually below controls */}
              <div className="absolute inset-0 z-20 pointer-events-none overflow-visible">
                <ErrorBoundary>
                  <Canvas 
                    shadows 
                    camera={{ position: [0, 0, 5], fov: 45 }} 
                    gl={{ 
                      alpha: true, 
                      antialias: true, 
                      preserveDrawingBuffer: true
                    }}
                    onCreated={(state) => {
                      state.gl.setClearColor(0x000000, 0);
                      console.log("Canvas created and transparent");
                    }}
                    style={{ background: 'transparent', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                    className="pointer-events-auto"
                  >
                    <XR store={store}>
                      <ARManager isModelLoaded={isModelLoaded} />
                      <ambientLight intensity={2} />
                      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={3} castShadow />
                      <pointLight position={[-10, -10, -10]} intensity={2} />
                      <directionalLight position={[0, 5, 5]} intensity={2} />
                      
                      <PresentationControls
                        global
                        rotation={rotation}
                        snap
                      >
                        {/* Test Sphere - Always visible to verify Canvas is working */}
                        <mesh position={[2, 2, 0]}>
                          <sphereGeometry args={[0.2]} />
                          <meshStandardMaterial color="red" />
                        </mesh>

                        {/* High Quality Model - Suspended with a visible fallback */}
                        <Suspense fallback={
                          <mesh position={[0, 0, 0]}>
                            <sphereGeometry args={[0.5]} />
                            <meshStandardMaterial color="yellow" wireframe />
                          </mesh>
                        }>
                          <BikeModel color={bikeColor} onLoad={() => {
                            console.log("VirtualTryOn: Model onLoad triggered");
                            setIsModelLoaded(true);
                          }} />
                        </Suspense>
                        
                        {/* Instant Placeholder Model (Ghost) - Always Visible until loaded */}
                        {!isModelLoaded && (
                          <mesh position={[0, -0.5, 0]} rotation={[0, 0.3, 0]}>
                            <boxGeometry args={[2.5, 1.2, 0.8]} />
                            <meshStandardMaterial 
                              color="#EAB308" 
                              transparent 
                              opacity={0.6} 
                              wireframe 
                            />
                          </mesh>
                        )}
                      </PresentationControls>
                      
                      {/* Floor Grid for debugging visibility */}
                      <Grid 
                        infiniteGrid 
                        fadeDistance={50} 
                        fadeStrength={5} 
                        sectionSize={1} 
                        sectionThickness={1} 
                        sectionColor="#EAB308"
                        cellColor="#333"
                        position={[0, -1.5, 0]}
                      />
                      
                      <ContactShadows 
                        position={[0, -1.2, 0]} 
                        opacity={0.6} 
                        scale={10} 
                        blur={2} 
                        far={4.5} 
                      />
                      <Environment preset="city" />
                    </XR>
                  </Canvas>
                </ErrorBoundary>
              </div>

              {!isModelLoaded && (
                <LoadingSpinner 
                  showRetry={showLoadingRetry} 
                  onRetry={handleRetryLoading} 
                  onSkip={handleSkipLoading}
                />
              )}
              {isAnalyzing && <ScanLine />}

              {/* Debug Status Overlay */}
              <div className="absolute bottom-24 left-6 z-[100] bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-[8px] text-white font-mono flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isModelLoaded ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                  <span>MODEL: {isModelLoaded ? 'READY' : 'LOADING...'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${hasPermission ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>CAMERA: {hasPermission ? 'ACTIVE' : 'INACTIVE'}</span>
                </div>
              </div>

              {/* AR Controls */}
              <div className="absolute bottom-32 right-6 z-[100] flex flex-col gap-4 pointer-events-auto">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !isModelLoaded}
                  className={`w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-95 border-4 border-black/20 ${
                    isAnalyzing ? 'bg-white/20 text-white/40' : 'bg-white text-black hover:bg-yellow-500'
                  }`}
                >
                  <Scan className="w-6 h-6" />
                  <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Scan</span>
                </button>
                
                <button
                  onClick={() => store.enterAR()}
                  className="w-16 h-16 rounded-full bg-yellow-500 text-black flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95 border-4 border-black/20"
                >
                  <Sparkles className="w-6 h-6" />
                  <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Start AR</span>
                </button>
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
