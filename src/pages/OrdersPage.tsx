
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter } from "lucide-react";

const OrdersPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage incoming and outgoing orders
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-sm">All</Button>
            <Button variant="outline" size="sm" className="text-sm">Pending</Button>
            <Button variant="outline" size="sm" className="text-sm">Shipped</Button>
            <Button variant="outline" size="sm" className="text-sm">Delivered</Button>
            <Button variant="outline" size="sm" className="text-sm">Canceled</Button>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableCaption>A list of your recent orders</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">ORD-{1000 + i}</TableCell>
                  <TableCell>{new Date().toLocaleDateString()}</TableCell>
                  <TableCell>Customer {i+1}</TableCell>
                  <TableCell>{i + 2}</TableCell>
                  <TableCell className="text-right">${(50 + i * 25).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={i % 4 === 0 ? "default" : 
                                    i % 4 === 1 ? "outline" : 
                                    i % 4 === 2 ? "secondary" : 
                                    "destructive"}>
                      {i % 4 === 0 ? "Pending" : 
                       i % 4 === 1 ? "Shipped" : 
                       i % 4 === 2 ? "Delivered" : 
                       "Canceled"}
                    </Badge>
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

export default OrdersPage;
