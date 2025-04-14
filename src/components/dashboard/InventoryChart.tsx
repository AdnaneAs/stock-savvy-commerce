
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const weeklyData = [
  { name: "Mon", value: 150 },
  { name: "Tue", value: 230 },
  { name: "Wed", value: 224 },
  { name: "Thu", value: 218 },
  { name: "Fri", value: 135 },
  { name: "Sat", value: 147 },
  { name: "Sun", value: 260 },
];

const monthlyData = [
  { name: "Jan", value: 1200 },
  { name: "Feb", value: 940 },
  { name: "Mar", value: 1340 },
  { name: "Apr", value: 1560 },
  { name: "May", value: 1240 },
  { name: "Jun", value: 1570 },
  { name: "Jul", value: 1000 },
  { name: "Aug", value: 1450 },
  { name: "Sep", value: 1350 },
  { name: "Oct", value: 1720 },
  { name: "Nov", value: 1590 },
  { name: "Dec", value: 1890 },
];

type TimeRange = "weekly" | "monthly";

const InventoryChart = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");

  const data = timeRange === "weekly" ? weeklyData : monthlyData;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-8">
        <CardTitle>Inventory Overview</CardTitle>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as TimeRange)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pl-0 pr-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#fff", 
                  borderRadius: "8px", 
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                  border: "none"
                }}
                itemStyle={{ color: "#334155" }}
                labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
              />
              <Bar 
                dataKey="value" 
                fill="hsla(199, 89%, 48%, 1)" 
                radius={[4, 4, 0, 0]}
                barSize={timeRange === "weekly" ? 30 : 20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryChart;
