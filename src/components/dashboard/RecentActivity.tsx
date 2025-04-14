
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "add" | "remove" | "update" | "alert";
  description: string;
  timestamp: string;
  user: string;
}

const activities: ActivityItem[] = [
  {
    id: "act1",
    type: "add",
    description: "Added 24 new USB Flash Drives to inventory",
    timestamp: "10 minutes ago",
    user: "John Smith",
  },
  {
    id: "act2",
    type: "alert",
    description: "Office Chair stock below threshold (14 remaining)",
    timestamp: "25 minutes ago",
    user: "System",
  },
  {
    id: "act3",
    type: "update",
    description: "Updated price for Wireless Mouse from $19.99 to $24.99",
    timestamp: "1 hour ago",
    user: "Sarah Johnson",
  },
  {
    id: "act4",
    type: "remove",
    description: "Removed 5 Document Folders from inventory",
    timestamp: "3 hours ago",
    user: "Mike Peterson",
  },
  {
    id: "act5",
    type: "add",
    description: "Added 12 new Standing Desks to inventory",
    timestamp: "5 hours ago",
    user: "John Smith",
  },
];

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "add":
      return (
        <div className="h-2 w-2 rounded-full bg-green-500 ring-4 ring-green-100" />
      );
    case "remove":
      return (
        <div className="h-2 w-2 rounded-full bg-red-500 ring-4 ring-red-100" />
      );
    case "update":
      return (
        <div className="h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-100" />
      );
    case "alert":
      return (
        <div className="h-2 w-2 rounded-full bg-yellow-500 ring-4 ring-yellow-100" />
      );
    default:
      return null;
  }
};

const getActivityTypeText = (type: ActivityItem["type"]) => {
  switch (type) {
    case "add":
      return "Added";
    case "remove":
      return "Removed";
    case "update":
      return "Updated";
    case "alert":
      return "Alert";
    default:
      return type;
  }
};

const getActivityTypeBadge = (type: ActivityItem["type"]) => {
  switch (type) {
    case "add":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "remove":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "update":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "alert":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-4">
              <div className="relative mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-xs", getActivityTypeBadge(activity.type))}>
                    {getActivityTypeText(activity.type)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    by {activity.user}
                  </span>
                </div>
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
