
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, RefreshCw, Search } from "lucide-react";

const InventoryPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">
              Monitor stock levels and product availability
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-10" />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableCaption>A list of your current inventory</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">In Stock</TableHead>
                <TableHead className="text-right">Min Stock</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">Product {i+1}</TableCell>
                  <TableCell>SKU-{100 + i}</TableCell>
                  <TableCell>Electronics</TableCell>
                  <TableCell className="text-right">{10 + i * 5}</TableCell>
                  <TableCell className="text-right">5</TableCell>
                  <TableCell className="text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${i % 3 === 0 ? "bg-red-100 text-red-800" : 
                        i % 3 === 1 ? "bg-yellow-100 text-yellow-800" : 
                        "bg-green-100 text-green-800"}`}>
                      {i % 3 === 0 ? "Low" : i % 3 === 1 ? "Medium" : "Good"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default InventoryPage;
