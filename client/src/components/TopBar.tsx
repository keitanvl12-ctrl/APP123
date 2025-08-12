import { useState } from "react";
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SimpleTicketModal from "./SimpleTicketModal";

interface TopBarProps {
  title: string;
  description?: string;
}

export default function TopBar({ title, description }: TopBarProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <header className="bg-card border-b border-border px-6 py-4 shadow-enterprise">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm placeholder:text-muted-foreground"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            </div>
            
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative text-muted-foreground hover:text-foreground hover:bg-muted transition-enterprise"
            >
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                3
              </span>
            </Button>

            {/* Create Ticket Button */}
            <Button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('TopBar button clicked, opening modal');
                setIsCreateModalOpen(true);
              }}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium transition-enterprise"
            >
              <Plus size={16} className="mr-2" />
              Criar Ticket
            </Button>
          </div>
        </div>
      </header>

      <SimpleTicketModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </>
  );
}
