import React, { useState, useRef, useEffect, Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Camera, RotateCw, Maximize2, User, Info, AlertCircle, Scan, CheckCircle2, Sparkles } from "lucide-react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls, Environment, ContactShadows, Grid, Float } from "@react-three/drei";
import { XR, createXRStore, useXR, useXRHitTest, Interactive } from "@react-three/xr";
import * as THREE from "three";

const store = createXRStore({
  hitTest: true,
});

// Public 3D model URL for a motorcycle
const BIKE_MODEL_URL = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/motorcycle/model.gltf";

// Preload the model
useGLTF.preload(BIKE_MODEL_URL);

function ARPlacement({ 
  onPlace, 
  placedPosition, 
  bikeColor, 
  isModelLoaded, 
  useGhostMode 
}: { 
  onPlace: (pos: THREE.Vector3) => void;
  placedPosition: THREE.Vector3 | null;
  bikeColor: string;
  isModelLoaded: boolean;
  useGhostMode: boolean;
}) {
  const [reticlePosition, setReticlePosition] = useState<THREE.Vector3 | null>(null);
  const [reticleRotation, setReticleRotation] = useState<THREE.Euler | null>(null);
  const xr = useXR();

  useXRHitTest((results) => {
    if (results.length > 0 && xr.originReferenceSpace) {
      const hit = results[0];
      const pose = hit.getPose(xr.originReferenceSpace);
      if (pose) {
        const matrix = new THREE.Matrix4().fromArray(pose.transform.matrix as any);
        const position = new THREE.Vector3().setFromMatrixPosition(matrix);
        const rotation = new THREE.Euler().setFromRotationMatrix(matrix);
        setReticlePosition(position);
        setReticleRotation(rotation);
      }
    }
  }, xr.originReferenceSpace);

  // If already placed, show the model at the placed position
  if (placedPosition && xr.session) {
    return (
      <group position={placedPosition}>
        {!useGhostMode && isModelLoaded ? (
          <BikeModel color={bikeColor} onLoad={() => {}} isInAR={true} />
        ) : (
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2, 1, 0.8]} />
            <meshStandardMaterial color="#EAB308" transparent opacity={0.5} wireframe />
          </mesh>
        )}
      </group>
    );
  }

  // If in AR but not placed, show reticle and ghost model
  if (xr.session && reticlePosition) {
    return (
      <Interactive onSelect={() => onPlace(reticlePosition)}>
        <group position={reticlePosition}>
          {/* Reticle / Placement Indicator */}
          <mesh rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.15, 0.2, 32]} />
            <meshStandardMaterial color="#EAB308" />
          </mesh>
          <mesh rotation-x={-Math.PI / 2}>
            <circleGeometry args={[0.05, 32]} />
            <meshStandardMaterial color="#EAB308" />
          </mesh>
          
          {/* Ghost Preview */}
          <group>
             <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[2, 1, 0.8]} />
                <meshStandardMaterial color="#EAB308" transparent opacity={0.2} wireframe />
             </mesh>
          </group>
        </group>
      </Interactive>
    );
  }

  return null;
}

function BikeModel({ color, onLoad, isInAR = false }: { color: string; onLoad: () => void; isInAR?: boolean }) {
  console.log("BikeModel: Starting to load GLTF model from", BIKE_MODEL_URL);
  const { scene } = useGLTF(BIKE_MODEL_URL);
  
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

  if (!clonedScene) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 0.5, 2]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
    );
  }

  return (
    <group>
      {/* Reference Box to ensure something is visible even if model fails */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={1} />
      </mesh>

      {!isInAR ? (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <primitive 
            object={clonedScene} 
            scale={4.5} 
            position={[0, -1.5, 0]} 
          />
        </Float>
      ) : (
        <primitive 
          object={clonedScene} 
          scale={3} 
          position={[0, 0, 0]} 
        />
      )}
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

function LoadingIndicator({ isLoaded, showRetry, onRetry, onSkip }: { isLoaded: boolean; showRetry: boolean; onRetry: () => void; onSkip: () => void }) {
  if (isLoaded) return null;
  
  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl">
            <div className={`w-4 h-4 border-2 ${showRetry ? 'border-red-500' : 'border-yellow-500/20 border-t-yellow-500'} rounded-full animate-spin`} />
            <div className="flex flex-col">
              <span className="text-white font-black uppercase italic tracking-tighter text-xs">
                {showRetry ? "Loading is taking longer than expected..." : "Assembling 3D Model..."}
              </span>
              <span className="text-white/40 text-[8px] font-bold uppercase tracking-widest">
                {showRetry ? "Check your internet connection or try Ghost Mode" : "Optimizing high-quality assets"}
              </span>
            </div>
          </div>
      
      {showRetry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex gap-2"
        >
          <button 
            onClick={onRetry}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-black text-[8px] tracking-widest uppercase hover:bg-white transition-all shadow-xl"
          >
            Retry
          </button>
          <button 
            onClick={onSkip}
            className="bg-white/10 text-white px-4 py-2 rounded-lg font-black text-[8px] tracking-widest uppercase hover:bg-white hover:text-black transition-all shadow-xl"
          >
            Use Ghost Mode
          </button>
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [useGhostMode, setUseGhostMode] = useState(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [placedPosition, setPlacedPosition] = useState<THREE.Vector3 | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [showDebugCube, setShowDebugCube] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log("VirtualTryOn: Modal opened, starting camera and loading model...");
      startCamera();
      setIsModelLoaded(false);
      setShowLoadingRetry(false);
      setUseGhostMode(true);
      setLoadError(null);
      setPlacedPosition(null);
      setIsARActive(false);
      
      // Set a timeout to show retry if it takes too long
      loadingTimeoutRef.current = setTimeout(() => {
        if (!isModelLoaded) {
          setShowLoadingRetry(true);
        }
      }, 10000);
    } else {
      stopCamera();
      setIsAnalyzing(false);
      setAnalysisResult(null);
      setIsARActive(false);
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
        setError("Camera access was denied. This often happens if:\n1. You clicked 'Block' when asked for permission.\n2. Your browser is blocking camera access within this frame.\n\nTo fix this:\n- Click the lock/camera icon in your browser's address bar and set 'Camera' to 'Allow'.\n- Or click 'Open in New Tab' below to use the app directly.");
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
        <div className="relative flex-1 overflow-hidden bg-black">
          {hasPermission === false ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#050505]">
              <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
              <h4 className="text-2xl font-black text-white uppercase italic mb-4">Camera Access Required</h4>
              <p className="text-white/40 max-w-md mb-8 whitespace-pre-line">{error}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="bg-yellow-500 text-black px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-white transition-all shadow-xl"
                >
                  Open in New Tab
                </button>
                <button 
                  onClick={startCamera}
                  className="bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all"
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
                className="absolute inset-0 w-full h-full object-cover z-[-1]"
              />
              
          {/* 3D Overlay - Increased z-index and ensured visibility */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-visible">
            <ErrorBoundary>
              <Canvas 
                shadows 
                camera={{ position: [0, 0, 8], fov: 45 }} 
                gl={{ 
                  alpha: true, 
                  antialias: true, 
                  preserveDrawingBuffer: true,
                  powerPreference: "high-performance"
                }}
                onCreated={(state) => {
                  state.gl.setClearColor(0x000000, 0);
                  console.log("Canvas created and transparent");
                }}
                style={{ background: 'transparent', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                className="pointer-events-auto"
              >
                {/* Global Test Cube - OUTSIDE XR to verify Canvas rendering */}
                <mesh position={[-2, 2, 0]}>
                  <boxGeometry args={[0.2, 0.2, 0.2]} />
                  <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={5} />
                </mesh>

                <XR store={store}>
                  {/* Debug Cube - Toggleable for verification */}
                  {showDebugCube && (
                    <mesh position={[0, 0, 0]}>
                      <boxGeometry args={[2, 2, 2]} />
                      <meshStandardMaterial color="purple" emissive="purple" emissiveIntensity={0.5} />
                    </mesh>
                  )}

                  <ARPlacement 
                    placedPosition={placedPosition}
                    onPlace={(pos) => setPlacedPosition(pos)}
                    bikeColor={bikeColor}
                    isModelLoaded={isModelLoaded}
                    useGhostMode={useGhostMode}
                  />
                  
                  <ambientLight intensity={3} />
                  <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={5} castShadow />
                  <pointLight position={[-10, -10, -10]} intensity={3} />
                  <directionalLight position={[0, 5, 5]} intensity={3} />
                  <Environment preset="city" />
                  
                  {/* Only show standard scene if NOT in AR session */}
                  {!placedPosition && (
                    <group position={[0, 0, 0]}>
                      <PresentationControls
                        global
                        rotation={rotation}
                        polar={[-Math.PI / 4, Math.PI / 4]}
                        azimuth={[-Math.PI / 4, Math.PI / 4]}
                        snap
                      >
                        {/* Diagnostic Test Sphere - Made larger and brighter */}
                        <mesh position={[0, 2, 0]}>
                          <sphereGeometry args={[0.2]} />
                          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={5} />
                        </mesh>

                        {/* High Quality Model */}
                        <Suspense fallback={null}>
                          <group visible={!useGhostMode}>
                            <BikeModel color={bikeColor} onLoad={() => {
                              console.log("VirtualTryOn: Model onLoad triggered");
                              setIsModelLoaded(true);
                              setUseGhostMode(false);
                            }} />
                          </group>
                        </Suspense>
                        
                        {/* Instant Placeholder Model (Ghost) */}
                        {useGhostMode && (
                          <mesh position={[0, -0.5, 0]} rotation={[0, 0.3, 0]}>
                            <boxGeometry args={[3.5, 1.8, 1.2]} />
                            <meshStandardMaterial 
                              color="#EAB308" 
                              transparent 
                              opacity={0.5} 
                              wireframe 
                              wireframeLinewidth={3}
                            />
                          </mesh>
                        )}
                      </PresentationControls>
                      
                      {/* Floor Grid */}
                      <Grid 
                        infiniteGrid 
                        fadeDistance={50} 
                        fadeStrength={5} 
                        sectionSize={1} 
                        sectionThickness={1} 
                        sectionColor="#EAB308"
                        cellColor="#333"
                        position={[0, -2, 0]}
                      />
                      
                      <ContactShadows 
                        position={[0, -1.9, 0]} 
                        opacity={0.6} 
                        scale={10} 
                        blur={2} 
                        far={4.5} 
                      />
                    </group>
                  )}
                </XR>
              </Canvas>
            </ErrorBoundary>
          </div>

              <LoadingIndicator 
                isLoaded={isModelLoaded}
                showRetry={showLoadingRetry}
                onRetry={handleRetryLoading}
                onSkip={handleSkipLoading}
              />

              {isAnalyzing && <ScanLine />}

              {/* Debug Status Overlay */}
              <div className="absolute bottom-24 left-6 z-[100] bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-[8px] text-white font-mono flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isModelLoaded ? 'bg-green-500' : (showLoadingRetry ? 'bg-red-500' : 'bg-yellow-500 animate-pulse')}`} />
                  <span>MODEL: {isModelLoaded ? (useGhostMode ? 'GHOST MODE' : 'READY') : (showLoadingRetry ? 'FAILED / SLOW' : 'LOADING...')}</span>
                  {!isModelLoaded && (
                    <button 
                      onClick={() => {
                        setIsModelLoaded(true);
                        setUseGhostMode(true);
                        setShowLoadingRetry(false);
                      }}
                      className="ml-2 text-yellow-500 underline hover:text-white transition-all font-black"
                    >
                      FORCE READY
                    </button>
                  )}
                  {isModelLoaded && (
                    <button 
                      onClick={() => {
                        setIsModelLoaded(false);
                        setUseGhostMode(false);
                        setShowLoadingRetry(false);
                        // Force a re-render
                        window.location.reload();
                      }}
                      className="ml-2 text-white/40 underline hover:text-white transition-all"
                    >
                      REFRESH
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${hasPermission ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>CAMERA: {hasPermission ? 'ACTIVE' : 'INACTIVE'}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-white/5">
                  <button 
                    onClick={() => setShowDebugCube(!showDebugCube)}
                    className="bg-purple-500 text-white px-2 py-1 rounded text-[6px] font-black uppercase tracking-widest"
                  >
                    Toggle Debug Cube
                  </button>
                </div>
                <div className="mt-1 pt-1 border-t border-white/5 opacity-40">
                  <span>DEBUG: {JSON.stringify({ isModelLoaded, showLoadingRetry, useGhostMode, hasPermission })}</span>
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
                  onClick={() => {
                    store.enterAR();
                    setIsARActive(true);
                  }}
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
                    {isARActive 
                      ? (placedPosition ? "Bike Placed! Use gestures to view." : "Scan floor and tap to place bike")
                      : (isAnalyzing ? "Analyzing Person..." : "Stand 5-7 feet away to analyze fit")}
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
