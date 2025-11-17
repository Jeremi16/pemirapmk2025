import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
export default function Navbar() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const readAuth = () => {
      const id = localStorage.getItem("voter_id");
      const name =
        localStorage.getItem("voter_name") ||
        localStorage.getItem("voter_nama") ||
        localStorage.getItem("voter_fullname") ||
        localStorage.getItem("voter_nim");
      setIsLoggedIn(!!id);
      setDisplayName(id ? name || "Pengguna" : null);
    };
    readAuth();
    window.addEventListener("storage", readAuth);
    return () => window.removeEventListener("storage", readAuth);
  }, []);
  return (
    <nav className="fixed top-0 w-full bg-background backdrop-blur-lg border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <a href="/" className="flex items-center space-x-2">
              <div className="rounded-xl">
                <img
                  src="https://res.cloudinary.com/dm3zixaz4/image/upload/v1763313569/Logo_Utama_dxucb5.png"
                  alt="Logo"
                  className="h-14 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col leading-none">
                <div className="text-2xl text-primary leading-none font-semibold tracking-tight">PEMIRA</div>
                <span className="text-base font-semibold text-[hsl(var(--brand-orange))] -mt-1 tracking-wide">
                  PMK ITERA 2025
                </span>
              </div>
            </a>
          </div>
          <div className="flex items-center space-x-8">
            <Button
              onClick={() => {
                document
                  .getElementById("beranda")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-1 font-semibold text-lg bg-transparent text-foreground hover:text-primary transition-colors relative group tracking-wide"
            >
              Beranda
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Button>

            <Button
              onClick={() => {
                document
                  .getElementById("timeline")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-1 font-semibold text-lg bg-transparent text-muted-foreground hover:text-primary transition-colors relative group tracking-wide"
            >
              Timeline
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Button>
            
            <Button
              onClick={() => {
                document
                  .getElementById("kandidat")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-1 font-semibold text-lg bg-transparent text-muted-foreground hover:text-primary transition-colors relative group tracking-wide"
            >
              Kandidat
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Button>
            
            <Button
              onClick={() => {
                document
                  .getElementById("tentang")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-1 font-semibold text-lg bg-transparent text-muted-foreground hover:text-primary transition-colors relative group tracking-wide"
            >
              Tentang
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="default"
              onClick={isLoggedIn && displayName ? () => navigate("/voting") : () => navigate("/voter")}
              className="font-semibold text-lg px-4 py-3 tracking-wide transition-all ease-in-out flex rounded-lg text-white bg-[hsl(var(--accent))] hover:translate-y-[-3px]"
              title={isLoggedIn && displayName ? displayName : "Login"}
            >
              <Users className="w-4 h-4 mr-1" />
              {isLoggedIn
                ? displayName?.length > 18
                  ? displayName.slice(0, 18) + "…"
                  : displayName
                : "Login"}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}