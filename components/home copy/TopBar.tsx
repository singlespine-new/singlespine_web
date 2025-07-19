'use client'

import { Button } from "@/components/ui/Button"
import { SearchBar } from "@/components/ui/SearchBar"
import { MapPin } from "lucide-react"

const TopBar = () => {
  return (
    <header className="flex w-full items-stretch justify-between gap-4 p-4">
      {/* Location Button */}
      <Button
        variant="ghost"
        size="lg"
        className="max-w-xs flex-none items-center justify-start bg-secondary/50 text-left hover:bg-secondary/70"
      >
        <MapPin className="text-muted-foreground" />
        <span className="truncate font-normal text-foreground">
          Nii Boi Street, Adenta Accra
        </span>
      </Button>

      {/* Search Bar */}
      <div className="flex-2">
        <SearchBar
          placeholder="Restaurants or stores or products"
          variant="ghost"
          size="sm"
          containerClassName="h-full bg-secondary/50"
        />
      </div>
    </header>
  );
};

export default TopBar;
