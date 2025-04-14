
import { useState } from "react";
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

interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  stock: number;
  price: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

const products: Product[] = [
  {
    id: "PRD001",
    name: "USB Flash Drive 32GB",
    barcode: "8574635284163",
    category: "Electronics",
    stock: 142,
    price: 12.99,
    status: "In Stock",
  },
  {
    id: "PRD002",
    name: "Wireless Mouse",
    barcode: "7485963210584",
    category: "Electronics",
    stock: 78,
    price: 24.99,
    status: "In Stock",
  },
  {
    id: "PRD003",
    name: "Office Chair",
    barcode: "9685741023695",
    category: "Furniture",
    stock: 14,
    price: 149.99,
    status: "Low Stock",
  },
  {
    id: "PRD004",
    name: "Printer Ink Cartridge",
    barcode: "6574839201758",
    category: "Office Supplies",
    stock: 0,
    price: 34.99,
    status: "Out of Stock",
  },
  {
    id: "PRD005",
    name: "Document Folder Pack",
    barcode: "3214587960325",
    category: "Office Supplies",
    stock: 57,
    price: 8.99,
    status: "In Stock",
  },
  {
    id: "PRD006",
    name: "24\" Monitor",
    barcode: "1478523690587",
    category: "Electronics",
    stock: 3,
    price: 199.99,
    status: "Low Stock",
  },
  {
    id: "PRD007",
    name: "Standing Desk",
    barcode: "9517538462058",
    category: "Furniture",
    stock: 8,
    price: 299.99,
    status: "Low Stock",
  },
];

const getStatusColor = (status: Product["status"]) => {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedProducts = [...products]
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      
      if (sortDirection === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
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
        <div className="flex items-center gap-2">
          <Button variant="default">
            Add Product
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
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(product.status)}
                    >
                      {product.status}
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
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
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
