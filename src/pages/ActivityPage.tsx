
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Calendar, Clock } from "lucide-react";

const activities = [
  {
    id: 1,
    action: "Product added",
    description: "New product 'Wireless Headphones' added to inventory",
    timestamp: "10:30 AM",
    user: "John Smith",
    type: "product"
  },
  {
    id: 2,
    action: "Order shipped",
    description: "Order #1002 was marked as shipped",
    timestamp: "9:45 AM",
    user: "Emma Johnson",
    type: "order"
  },
  {
    id: 3,
    action: "Low stock alert",
    description: "Product 'USB-C Cable' is below minimum stock level",
    timestamp: "9:15 AM",
    user: "System",
    type: "alert"
  },
  {
    id: 4,
    action: "Inventory updated",
    description: "Received 50 units of 'Wireless Mouse'",
    timestamp: "Yesterday",
    user: "Michael Brown",
    type: "inventory"
  },
  {
    id: 5,
    action: "User login",
    description: "User Sarah Davis logged in",
    timestamp: "Yesterday",
    user: "System",
    type: "user"
  }
];

const ActivityCard = ({ activity }: { activity: typeof activities[0] }) => {
  const getIcon = () => {
    switch(activity.type) {
      case "product": return <BarChart className="h-5 w-5 text-blue-500" />;
      case "order": return <Clock className="h-5 w-5 text-green-500" />;
      case "alert": return <Clock className="h-5 w-5 text-red-500" />;
      case "inventory": return <BarChart className="h-5 w-5 text-purple-500" />;
      default: return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex gap-4 p-4 border-b">
      <div className="flex-shrink-0 mt-1">{getIcon()}</div>
      <div className="flex-1">
        <p className="font-medium">{activity.action}</p>
        <p className="text-sm text-muted-foreground">{activity.description}</p>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{activity.user}</span>
          <span>{activity.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

const ActivityPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
          <p className="text-muted-foreground">
            Track all activity in your inventory system
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Track all system events and user actions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {activities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ActivityPage;
