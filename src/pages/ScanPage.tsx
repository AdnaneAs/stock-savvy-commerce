
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import BarcodeScanner from "@/components/scanner/BarcodeScanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package } from "lucide-react";
import AddProductForm from "@/components/products/AddProductForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ScanPage = () => {
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [scanResult, setScanResult] = useState<"new" | "existing" | null>(null);
  const [activeTab, setActiveTab] = useState("scan");

  const handleScan = (barcode: string) => {
    setScannedBarcode(barcode);
    
    // Simulate checking if product exists
    // In a real app, this would be an API call
    if (barcode === "7485963210584") {
      // This is the barcode for the Wireless Mouse in our demo data
      setScanResult("existing");
    } else {
      setScanResult("new");
    }
  };

  const handleAddNew = () => {
    setActiveTab("add");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scan Products</h1>
          <p className="text-muted-foreground">
            Scan barcodes to find or add products
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="scan">Scan Barcode</TabsTrigger>
            <TabsTrigger value="add">Add Product</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scan" className="space-y-6">
            <BarcodeScanner onScan={handleScan} />
            
            {scanResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Scan Result</CardTitle>
                  <CardDescription>
                    Barcode: <span className="font-mono">{scannedBarcode}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {scanResult === "existing" ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                          <Package />
                        </div>
                        <div>
                          <h3 className="font-medium">Wireless Mouse</h3>
                          <p className="text-sm text-muted-foreground">Electronics • $24.99</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t pt-4">
                        <p className="text-sm">Current stock: <span className="font-medium">78</span></p>
                        <div className="flex gap-2">
                          <Button variant="outline">Update Stock</Button>
                          <Button variant="outline">Edit Details</Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p>No product found with this barcode.</p>
                      <Button onClick={handleAddNew} className="flex items-center gap-2">
                        Add New Product
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
                {scannedBarcode && (
                  <CardDescription>
                    Using scanned barcode: <span className="font-mono">{scannedBarcode}</span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <AddProductForm 
                  initialBarcode={scannedBarcode} 
                  onSubmit={(data) => {
                    console.log("Product data:", data);
                    setActiveTab("scan");
                    setScanResult(null);
                  }} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ScanPage;
