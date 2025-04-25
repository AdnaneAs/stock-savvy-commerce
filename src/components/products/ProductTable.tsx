
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { productsApi } from "@/services/api";

import ProductTableToolbar from "./product-table/ProductTableToolbar";
import ProductListTable from "./product-table/ProductListTable";
import EditProductModal from "./EditProductModal";

const ProductTable = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const user = auth.currentUser;
      if (!user) return [];
      return productsApi.getUserProducts(user.uid);
    }
  });

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const handleDelete = async (productId: string) => {
    try {
      await productsApi.deleteProduct(productId);
      await refetch();
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the product.",
      });
    }
  };
  
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const filteredProducts = products
    .filter((product: Product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.includes(searchQuery)
    )
    .sort((a: Product, b: Product) => {
      if (!sortField) return 0;
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  return (
    <div className="space-y-4">
      <ProductTableToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <ProductListTable
        products={filteredProducts}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
      />
      
      {/* Edit Product Modal */}
      <EditProductModal
        product={selectedProduct}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={refetch}
      />
    </div>
  );
};

export default ProductTable;
