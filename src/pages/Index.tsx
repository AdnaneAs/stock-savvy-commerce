
import { Boxes, Package, ArrowUpRight, ShoppingCart, AlertTriangle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import StatsCard from "@/components/dashboard/StatsCard";
import ProductTable from "@/components/products/ProductTable";
import RecentActivity from "@/components/dashboard/RecentActivity";
import InventoryChart from "@/components/dashboard/InventoryChart";

const DashboardPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your inventory and recent activity
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Products"
            value="1,257"
            icon={<Boxes className="h-4 w-4 text-muted-foreground" />}
            trend={{ value: 12, positive: true }}
          />
          <StatsCard
            title="Low Stock Items"
            value="28"
            icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
            trend={{ value: 5, positive: false }}
          />
          <StatsCard
            title="Recent Orders"
            value="324"
            icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
            trend={{ value: 8, positive: true }}
          />
          <StatsCard
            title="Monthly Sales"
            value="$48,574"
            icon={<ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
            trend={{ value: 14, positive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InventoryChart />
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Products Overview</h2>
          </div>
          <ProductTable />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
