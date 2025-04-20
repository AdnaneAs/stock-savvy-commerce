
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface ProductTableToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function ProductTableToolbar({
  searchQuery,
  setSearchQuery,
}: ProductTableToolbarProps) {
  return (
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
        <Button variant="outline" size="icon" disabled>
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
