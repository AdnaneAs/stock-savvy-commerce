
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AddProductForm from "@/components/products/AddProductForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AddProductPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
            <p className="text-muted-foreground">
              Enter product details to add to inventory
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <AddProductForm onSubmit={(data) => {
            // Here we would handle the form submission
            console.log("Product data:", data);
            // Navigate back to products after a successful add
            navigate("/products");
          }} />
        </div>
      </div>
    </Layout>
  );
};

export default AddProductPage;
