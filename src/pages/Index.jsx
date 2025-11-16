import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Vote, ShieldCheck, Users, BarChart, Calendar, CheckCircle, User, Info } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const timelineData = [
    {
      stage: "Pendaftaran Calon",
      date: "2-4 November 2025",
      status: "completed",
      description: "Pendaftaran calon Ketua Umum PMK ITERA",
      icon: "/public/aset-03.png"
    },
    {
      stage: "Masa Kampanye", 
      date: "9-15 November 2025",
      status: "completed",
      description: "Kampanye terbuka semua kandidat",
      icon: "/public/aset-04.png"
    },
    {
      stage: "Pemilihan",
      date: "21 November 2025",
      status: "current",
      description: "Pemilihan melalui website ini",
      icon: "/public/aset-05.png"
    },
    {
      stage: "Pengumuman Hasil",
      date: "22 November 2025", 
      status: "upcoming",
      description: "Pengumuman Ketua Umum terpilih",
      icon: "/public/aset-03.png"
    }
  ];

  const candidatesData = [
    {
      id: 1,
      name: "Erwandi Pantun Pardede", 
      number: 1,
      vision: "Mewujudkan PMK ITERA sebagai wadah pembentukan mahasiswa Kristen yang berkarakter Kristus yang memimpin dengan kasih, melayani dengan kerendahan hati, dan membangun kesatuan dalam tubuh Kristus.",
      photo: "/PasPoto1.jpeg" // Perbaiki path dengan slash depan
    },
    {
      id: 2,
      name: "Masta Hendri Setiawan Lature",
      number: 2, 
      vision: "Menjadikan PMK sebagai wadah untuk menjangkau, melayani, dan pembentukan karakter yang berpusat pada Kristus, serta berdampak bagi lingkungan sekitar",
      photo: "/PasPoto2.jpeg" // Perbaiki path dengan slash depan
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background backdrop-blur-lg border-border">
        <div className="px-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center space-x-2">
                <div className="rounded-xl">
                  <img src="Logo Pemira Pmk.png" alt="Logo" className="object-contain w-auto h-14" />
                </div>
              </a>
            </div>
            <div className="flex items-center space-x-8">
              <a
                href="#beranda"
                className="relative py-2 font-semibold transition-colors text-foreground hover:text-primary group"
              >
                Beranda
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </a>
              <a
                href="#kandidat"
                className="relative py-2 font-medium transition-colors text-foreground hover:text-primary group"
              >
                Kandidat
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </a>
              <a
                href="#tentang"
                className="relative py-2 font-medium transition-colors text-foreground hover:text-primary group"
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

      <header className="bg-gradient-to-l from-[#924503] to-[#f7941d] text-white py-20 px-4 mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-white/20 backdrop-blur-sm">
            <Vote className="w-10 h-10 text-white" />
          </div>
          <h1 className="mb-3 text-4xl font-bold md:text-5xl">Sistem Pemilu Mahasiswa</h1>
          <p className="text-lg text-white/90">
            Platform Pemilihan Umum Online yang Transparan dan Efisien
          </p>
        </div>
      </header>

      <section id="beranda" className="px-4 py-12 scroll-mt-24 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-foreground">
            Timeline Pemilihan
          </h2>
          
          <div className="space-y-8">
            {timelineData.map((item, index) => (
              <div key={index} className="flex items-center gap-6">
                <div className="flex items-center justify-center flex-shrink-0 w-16 h-16">
                  <img 
                    src={item.icon} 
                    alt={item.stage}
                    className="object-contain w-12 h-12"
                  />
                </div>
                
                <Card className="flex-1 border-l-4 border-primary">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <h3 className="mb-1 text-xl font-semibold text-foreground">
                          {item.stage}
                        </h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {item.date}
                        </div>
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'current' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                          {item.status === 'completed' ? 'Selesai' : 
                           item.status === 'current' ? 'Berlangsung' : 'Akan Datang'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Kandidat - DIPERBAIKI */}
      <section id="kandidat" className="px-4 py-12 scroll-mt-24 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-foreground">
            Calon Ketua Umum
          </h2>
          
          {/* Container dengan flex untuk rata tengah */}
          <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-12">
            {candidatesData.map((candidate) => (
              <Card key={candidate.id} className="w-full max-w-sm text-center transition-shadow hover:shadow-lg">
                <CardHeader className="pb-4">
                  {/* Container foto dengan ukuran lebih besar dan posisi yang tepat */}
                  <div className="relative mx-auto mb-4">
                    <div className="flex items-center justify-center w-32 h-32 mx-auto overflow-hidden border-4 rounded-full bg-muted border-primary/20">
                      <img 
                        src={candidate.photo} 
                        alt={candidate.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {/* Nomor urut */}
                    <div className="absolute flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full shadow-md -top-2 -right-2 bg-primary text-primary-foreground">
                      {candidate.number}
                    </div>
                  </div>
                  
                  <CardTitle className="mb-2 text-xl">{candidate.name}</CardTitle>
                  <CardDescription className="text-base font-medium">Calon Ketua Umum</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm leading-relaxed text-justify text-muted-foreground">
                    {candidate.vision}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section Tentang */}
      <section id="tentang" className="px-4 py-12 scroll-mt-24 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-foreground">
            Tentang Pemira
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-10 h-10 mb-2 rounded-full bg-primary/10">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Apa itu Pemira?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pemira (Pemilihan Umum Mahasiswa) adalah proses demokrasi untuk memilih 
                  Ketua Umum PMK ITERA yang akan memimpin organisasi selama satu periode.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-10 h-10 mb-2 rounded-full bg-primary/10">
                  <Vote className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Tujuan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Memilih pemimpin yang capable dan memiliki integritas untuk membawa 
                  PMK ITERA menuju perkembangan yang lebih baik.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <div className="max-w-6xl px-4 py-16 mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground">Demo Sistem</h2>
          <p className="text-lg text-muted-foreground">
            Pilih role untuk melihat tampilan yang berbeda
          </p>
        </div>

        <div className="grid max-w-4xl gap-8 mx-auto md:grid-cols-2">
          <Card className="transition-all border-2 border-primary/20 hover:border-primary/40 hover:shadow-xl">
            <CardHeader className="pb-4 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">Portal Pemilih</CardTitle>
              <CardDescription className="text-base">
                Login sebagai mahasiswa untuk memberikan suara
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 space-y-2 text-sm rounded-lg bg-secondary/50">
                <div className="font-semibold text-foreground">Kredensial Demo:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">NIM:</div>
                  <div className="font-mono font-semibold">2021001</div>
                  <div className="text-muted-foreground">Token:</div>
                  <div className="font-mono text-xs font-semibold break-all">
                    a1b2c3d4e5f67890...
                  </div>
                </div>
                <p className="mt-2 text-xs italic text-muted-foreground">
                  * Token akan otomatis terisi saat Anda klik tombol demo
                </p>
              </div>
              <Button
                size="lg"
                className="w-full text-lg font-semibold h-14"
                onClick={() => navigate("/voter")}
              >
                <Users className="w-5 h-5 mr-2" />
                Masuk Sebagai Pemilih
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all border-2 border-primary/20 hover:border-primary/40 hover:shadow-xl">
            <CardHeader className="pb-4 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">Portal Admin</CardTitle>
              <CardDescription className="text-base">
                Dashboard monitoring dan analisis hasil pemilu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 space-y-2 text-sm rounded-lg bg-secondary/50">
                <div className="font-semibold text-foreground">Kredensial Demo:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Username:</div>
                  <div className="font-mono font-semibold">admin</div>
                  <div className="text-muted-foreground">Password:</div>
                  <div className="font-mono font-semibold">admin123</div>
                </div>
                <p className="mt-2 text-xs italic text-muted-foreground">
                  * Kredensial akan otomatis terisi saat Anda klik tombol demo
                </p>
              </div>
              <Button
                size="lg"
                className="w-full text-lg font-semibold h-14"
                onClick={() => navigate("/admin")}
              >
                <BarChart className="w-5 h-5 mr-2" />
                Masuk Sebagai Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto mt-12">
          <Card className="bg-muted/50 border-primary/20">
            <CardContent className="pt-6">
              <h4 className="mb-3 text-lg font-bold text-center">📝 Catatan Teknis</h4>
              <p className="text-sm leading-relaxed text-center text-muted-foreground">
                Sistem ini dibangun dengan <strong>React + TypeScript</strong> untuk frontend dan{" "}
                <strong>ReactPHP</strong> untuk backend yang asynchronous. Database menggunakan{" "}
                <strong>MySQL</strong>. Untuk demo lengkap, Anda perlu menjalankan backend ReactPHP
                dan database MySQL (lihat file <code className="bg-background px-1.5 py-0.5 rounded">DOKUMENTASI_TEKNIS.md</code>).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;