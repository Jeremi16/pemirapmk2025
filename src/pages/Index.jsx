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
    <div className="min-h-screen bg-secondary">
      <nav className="fixed top-0 w-full bg-background backdrop-blur-lg border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center space-x-2">
                <div className="rounded-xl">
                  <img
                    src="Logo Utama.png"
                    alt="Logo"
                    className="h-14 w-auto object-contain"
                  />
                </div>
                <div className="flex flex-col leading-none">
                  <div className="text-xl text-primary leading-none">
                    PEMIRA
                  </div>
                  <span className="text-sm font-semibold text-[hsl(var(--brand-orange))] -mt-1">
                    PMK ITERA 2025
                  </span>
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
                className="font-medium px-4 py-3 text-base transition-all ease-in-out flex rounded-lg text-white bg-[hsl(var(--accent))] hover:translate-y-[-3px]"
              >
                <Users className="w-4 h-4 mr-1" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <div className="HeroSection" id="beranda">
        {/* Hero */}
        <section className="flex justify-between items-center hero-padding">
          <div className="max-w-7xl mx-auto px-8 relative">
            <div className="grid grid-cols-12 gap-10 items-center">
              {/* Konten Teks */}
              <div className="col-span-7 space-y-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#924603] bg-[#F1C762] px-4 py-2 text-sm font-semibold tracking-wide text-[#2A1E09]">
                  <ShieldCheck className="w-4 h-4 text-[#924603]" />
                  Transparan • Aman • Demokratis
                </span>

                <div className="space-y-4">
                  <h1 className="text-6xl font-extrabold leading-[1.05] tracking-tight">
                    <span className="text-[#2A1E09]">
                      Pemilihan Raya PMK 2025
                    </span>
                    <span className="block text-[#924603] mt-4">
                      Perkuat Suara, Bentuk Masa Depan
                    </span>
                  </h1>

                  <p className="text-lg text-[#2A1E09]/90 max-w-2xl">
                    Platform e-voting modern untuk memastikan setiap suara
                    tercatat akurat, adil, dan real‑time. Ayo ambil peranmu.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="font-medium transition-all gap-3 px-6 py-4 rounded-lg bg-[#924603] shadow-lg hover:bg-[#924603]/90 text-white text-base ease-linear"
                    onClick={() => navigate("/voter")}
                  >
                    <Vote className="w-5 h-5" />
                    Mulai Memilih
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-3 bg-transparent text-[#924603] border-2 border-[#924603] px-6 py-4 rounded-lg hover:bg-[#924603] hover:text-white transition-all ease-linear"
                    onClick={() =>
                      document
                        .getElementById("kandidat")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    <Users className="w-5 h-5" />
                    Lihat Kandidat
                  </Button>
                </div>
              </div>

              <div className="col-span-5 flex justify-center">
                <div className="relative">
                  {/* Lingkaran dengan Gradient Lembut */}
                  <div className="w-96 h-96 rounded-full bg-gradient-to-br from-[#F1C762] to-[#FAEBC8] border-8 border-white shadow-2xl flex items-center justify-center">
                    <img
                      src="Logo Utama.png"
                      alt="Logo Pemira"
                      className="w-64 h-auto object-contain drop-shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
