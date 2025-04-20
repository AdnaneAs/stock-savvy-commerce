import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getUserProducts, deleteProduct } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { Product } from "@/lib/database";

const getStatusFromStock = (stock: number): "In Stock" | "Low Stock" | "Out of Stock" => {
  if (stock === 0) return "Out of Stock";
  if (stock < 10) return "Low Stock";
  return "In Stock";
};

const getStatusColor = (status: "In Stock" | "Low Stock" | "Out of Stock") => {
  switch (status) {
    case "In Stock":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Low Stock":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "Out of Stock":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

const ProductTable = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const user = auth.currentUser;
      if (!user) return [];
      return getUserProducts(user.uid);
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
      await deleteProduct(productId);
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
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[300px]"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("barcode")}
                  className="hover:bg-transparent p-0 font-semibold"
                >
                  Barcode
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("category")}
                  className="hover:bg-transparent p-0 font-semibold"
                >
                  Category
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("price")}
                  className="hover:bg-transparent p-0 font-semibold"
                >
                  Price
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("stock")}
                  className="hover:bg-transparent p-0 font-semibold"
                >
                  Stock
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-mono text-sm">{product.barcode || 'N/A'}</TableCell>
                  <TableCell>{product.category || 'Uncategorized'}</TableCell>
                  <TableCell className="text-right">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(getStatusFromStock(product.stock))}
                    >
                      {getStatusFromStock(product.stock)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View history</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductTable;
