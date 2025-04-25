
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ProductStatusBadge, { getStatusFromStock } from "./ProductStatusBadge";
import ProductRowActions from "./ProductRowActions";
import { Product } from "@/lib/database";

interface ProductListTableProps {
  products: Product[];
  isLoading: boolean;
  onDelete: (productId: string) => void;
  onEdit?: (product: Product) => void;
  onSort: (field: keyof Product) => void;
  sortField: keyof Product | null;
  sortDirection: "asc" | "desc";
}

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductListTable({
  products,
  isLoading,
  onDelete,
  onEdit,
  onSort,
  sortField,
  sortDirection,
}: ProductListTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onSort("barcode")}
                className="hover:bg-transparent p-0 font-semibold"
              >
                Barcode
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onSort("category")}
                className="hover:bg-transparent p-0 font-semibold"
              >
                Category
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                onClick={() => onSort("price")}
                className="hover:bg-transparent p-0 font-semibold"
              >
                Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                onClick={() => onSort("stock")}
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
          ) : products.length > 0 ? (
            products.map((product: Product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="font-mono text-sm">{product.barcode || 'N/A'}</TableCell>
                <TableCell>{product.category || 'Uncategorized'}</TableCell>
                <TableCell className="text-right">
                  ${product.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">{product.stock}</TableCell>
                <TableCell>
                  <ProductStatusBadge stock={product.stock} />
                </TableCell>                <TableCell>
                  <ProductRowActions 
                    onDelete={() => onDelete(product.id)} 
                    onEdit={onEdit ? () => onEdit(product) : undefined}
                  />
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
  );
}
