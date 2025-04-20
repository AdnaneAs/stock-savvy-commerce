
import { Badge } from "@/components/ui/badge";

export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock";

export function getStatusFromStock(stock: number): ProductStatus {
  if (stock === 0) return "Out of Stock";
  if (stock < 10) return "Low Stock";
  return "In Stock";
}

export function getStatusColor(status: ProductStatus) {
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
}

export default function ProductStatusBadge({ stock }: { stock: number }) {
  const status = getStatusFromStock(stock);
  return (
    <Badge
      variant="outline"
      className={getStatusColor(status)}
    >
      {status}
    </Badge>
  );
}
