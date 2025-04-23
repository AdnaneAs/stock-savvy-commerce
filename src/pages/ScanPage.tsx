
import { useState, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import BarcodeScanner from "@/components/scanner/BarcodeScanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Edit, Minus } from "lucide-react";
import AddProductForm from "@/components/products/AddProductForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const ScanPage = () => {
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [scanResult, setScanResult] = useState<"new" | "existing" | null>(null);
  const [foundProduct, setFoundProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("scan");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get products once, since we need to find by barcode
  const { data: allProducts = [], refetch: refetchProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      return productsApi.getUserProducts("");
    }
  });

  // Helper to search for a product by barcode in fetched list
  const findProductByBarcode = useCallback(
    (barcode: string) => {
      return allProducts.find((product: any) => product.barcode === barcode);
    },
    [allProducts]
  );

  // Decrement stock API mutation
  const decrementStockMutation = useMutation({
    mutationFn: async (product: any) => {
      // Update backend
      const newStock = Math.max(0, (product.quantity || product.stock) - 1);
      // Use updateProduct API - use proper ID
      return productsApi.updateProduct(product.id, {
        ...product,
        quantity: newStock,
        stock: newStock,
      });
    },
    onSuccess: async () => {
      toast({ title: "Stock updated", description: "Stock reduced by 1." });
      await refetchProducts();
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Could not update stock." });
    }
  });

  const handleScan = (barcode: string) => {
    setScannedBarcode(barcode);

    const product = findProductByBarcode(barcode);
    if (product) {
      setScanResult("existing");
      setFoundProduct(product);
    } else {
      setScanResult("new");
      setFoundProduct(null);
    }
  };

  const handleAddNew = () => {
    setActiveTab("add");
  };

  // Optionally editing product details/stock - for brevity, just inline prompt for now
  const handleUpdateStock = async (product: any) => {
    if (!product) return;
    if (
      window.confirm(
        `Decrement stock for ${product.name} (Current stock: ${product.stock ?? product.quantity}) by 1?`
      )
    ) {
      decrementStockMutation.mutate(product);
    }
  };

  // TODO: "Edit Details" could open a dialog/form for now just a prompt for name
  const handleEditDetails = async (product: any) => {
    if (!product) return;
    const name = window.prompt("Edit product name:", product.name);
    if (!name || name === product.name) return;
    try {
      await productsApi.updateProduct(product.id, { ...product, name });
      toast({ title: "Product updated", description: "Product name updated." });
      await refetchProducts();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not update the product." });
    }
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
                  {scanResult === "existing" && foundProduct ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                          <Package />
                        </div>
                        <div>
                          <h3 className="font-medium">{foundProduct.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {foundProduct.category ?? "Uncategorized"} • ${parseFloat(foundProduct.price ?? 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t pt-4">
                        <p className="text-sm">
                          Current stock:{" "}
                          <span className="font-medium">{foundProduct.stock ?? foundProduct.quantity}</span>
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleUpdateStock(foundProduct)}
                            className="flex items-center gap-2"
                          >
                            <Minus className="h-4 w-4" /> Update Stock
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleEditDetails(foundProduct)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" /> Edit Details
                          </Button>
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
                  onSubmit={async (data) => {
                    await refetchProducts();
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
