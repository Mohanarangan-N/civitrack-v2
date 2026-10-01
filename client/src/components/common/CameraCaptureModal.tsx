import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, CheckCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  locationName?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  locationName = 'Puducherry Ward',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access denied or device unavailable. You can upload a photo file instead.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw geotag watermark overlay
    const timestamp = new Date().toLocaleString();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    ctx.fillStyle = '#22A66A'; // Accent green
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`📍 CIVITRACK PROOF — ${locationName.toUpperCase()} | ${timestamp}`, 15, canvas.height - 15);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      toast.success('Live photo captured & geotagged!');
      onClose();
    }
  };

  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="card max-w-lg w-full p-6 shadow-2xl border-accent/40 bg-bg-elevated relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <Camera className="text-accent w-5 h-5" />
            <h3 className="font-extrabold text-base text-text-primary">Capture Live Proof Photo</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-primary/20">
            <X size={18} />
          </button>
        </div>

        {/* Camera Container */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-primary/30 shadow-inner">
          {cameraError ? (
            <div className="p-6 text-center text-text-muted space-y-2">
              <Camera className="w-10 h-10 mx-auto text-danger/80" />
              <p className="text-xs text-danger font-medium">{cameraError}</p>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured proof" className="w-full h-full object-cover" />
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              
              {/* Geotag Live Badge */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-accent/40 text-[11px] text-accent font-bold flex items-center gap-1.5 shadow-lg">
                <MapPin size={12} /> {locationName} • LIVE
              </div>

              {/* Viewfinder crosshairs */}
              <div className="absolute inset-8 border border-white/20 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="w-4 h-4 border-t-2 border-l-2 border-accent absolute top-0 left-0"></div>
                <div className="w-4 h-4 border-t-2 border-r-2 border-accent absolute top-0 right-0"></div>
                <div className="w-4 h-4 border-b-2 border-l-2 border-accent absolute bottom-0 left-0"></div>
                <div className="w-4 h-4 border-b-2 border-r-2 border-accent absolute bottom-0 right-0"></div>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between mt-5 gap-3">
          {!capturedImage ? (
            <>
              <Button variant="secondary" size="sm" onClick={handleToggleCamera} disabled={!!cameraError}>
                <RefreshCw size={14} /> Flip Camera
              </Button>

              <Button onClick={handleTakeSnapshot} disabled={!!cameraError} className="px-6 py-2.5 shadow-lg shadow-accent/20">
                <Camera size={16} /> Snap Photo
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setCapturedImage(null)}>
                <RefreshCw size={14} /> Retake
              </Button>

              <Button onClick={handleConfirm} className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/30">
                <CheckCircle size={16} /> Attach Proof
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
