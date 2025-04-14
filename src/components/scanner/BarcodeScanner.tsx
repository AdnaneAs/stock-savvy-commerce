
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Barcode, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

const BarcodeScanner = ({ onScan }: BarcodeScannerProps) => {
  const [barcode, setBarcode] = useState("");
  const [isManual, setIsManual] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      setScanStatus("scanning");
      setTimeout(() => {
        onScan(barcode);
        setScanStatus("success");
        setTimeout(() => {
          setScanStatus("idle");
          setBarcode("");
        }, 1500);
      }, 800);
    }
  };

  const toggleScanMode = () => {
    setIsManual(!isManual);
    if (isManual) {
      // Will switch to camera mode
      setIsCameraActive(true);
    } else {
      // Will switch to manual mode
      setIsCameraActive(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Simulating camera initialization and cleanup
  useEffect(() => {
    let cameraTimeout: ReturnType<typeof setTimeout>;
    
    if (isCameraActive && videoRef.current) {
      // In a real app, we would initialize the barcode scanner library here
      cameraTimeout = setTimeout(() => {
        // Simulate finding a barcode after 3 seconds
        const demoBarcode = "7485963210584";
        setScanStatus("success");
        setBarcode(demoBarcode);
        onScan(demoBarcode);
        
        setTimeout(() => {
          setScanStatus("idle");
        }, 1500);
      }, 3000);
    }
    
    return () => {
      clearTimeout(cameraTimeout);
    };
  }, [isCameraActive, onScan]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 justify-between">
        <h3 className="text-lg font-medium">Barcode Scanner</h3>
        <Button 
          variant="outline" 
          onClick={toggleScanMode} 
          className="flex items-center gap-2"
        >
          {isManual ? (
            <>
              <Barcode className="h-4 w-4" />
              <span>Switch to Camera</span>
            </>
          ) : (
            <>
              <Barcode className="h-4 w-4" />
              <span>Switch to Manual</span>
            </>
          )}
        </Button>
      </div>

      {isManual ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barcode">Enter Barcode</Label>
                <div className="relative">
                  <Input
                    id="barcode"
                    ref={inputRef}
                    type="text"
                    placeholder="Scan or enter barcode..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="pr-10"
                    autoComplete="off"
                    disabled={scanStatus === "scanning"}
                  />
                  {scanStatus === "scanning" && (
                    <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                  {scanStatus === "success" && (
                    <Check className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={!barcode.trim() || scanStatus !== "idle"}
              >
                {scanStatus === "scanning" ? "Processing..." : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative bg-gray-100 aspect-video rounded-md overflow-hidden flex items-center justify-center">
                {scanStatus === "idle" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="sr-only">Initializing camera</span>
                  </div>
                )}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                {scanStatus === "success" && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Barcode detected!</span>
                    </div>
                  </div>
                )}
                
                {/* Scanning overlay with horizontal line */}
                {scanStatus === "idle" && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary opacity-75 animate-scanline"></div>
                )}
              </div>
              
              {barcode && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-mono">
                    Last scanned: {barcode}
                  </AlertDescription>
                </Alert>
              )}
              
              <p className="text-sm text-muted-foreground text-center">
                Position the barcode in front of the camera
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BarcodeScanner;
