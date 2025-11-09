import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Vote, ShieldCheck, Users, BarChart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full bg-background backdrop-blur-lg border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center space-x-2">
                <div className="rounded-xl">
                  <img src="Logo Pemira Pmk.png" alt="Logo" className="h-14 w-auto object-contain" />
                </div>
              </a>
            </div>
            <div className="flex items-center space-x-8">
              <a
                href="#beranda"
                className="py-2 font-semibold text-foreground hover:text-primary transition-colors relative group"
              >
                Beranda
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </a>
              <a
                href="#kandidat"
                className="py-2 font-medium text-muted-foreground hover:text-primary transition-colors relative group"
              >
                Kandidat
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </a>
              <a
                href="#tentang"
                className="py-2 font-medium text-muted-foreground hover:text-primary transition-colors relative group"
              >
                Tentang
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="default"
                onClick={() => navigate("/voter")}
                className="font-medium px-3 py-2 flex rounded-md text-primary-foreground bg-[hsl(var(--accent))] hover:opacity-90 shadow-lg"
              >
                <Users className="w-4 h-4 mr-1" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Index;
