import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheck, MoveLeft } from "lucide-react";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("admin_token", data.token);
        toast.success("Login admin berhasil!");
        navigate("/admin/dashboard");
      } else {
        toast.error("Username atau password salah.");
      }
    } catch (error) {
      toast.error(
        "Koneksi ke server gagal. Pastikan backend ReactPHP berjalan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-gradient-to-br from-[#f1c662d3] to-[#511600a1] overflow-hidden">
      {/* <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#f1c662d3] to-[#511600a1] overflow-hidden">
        <div className="w-full max-w-5xl">
          <Card className="border-none flex flex-col lg:flex-row bg-white/95 rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden">
            <CardContent className="w-1/2 p-12">
              <form onSubmit={handleLogin} className="max-w-md mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[#511600a1] mb-1">
                    Selamat Datang
                  </h2>
                  <p className="text-sm text-[#511600a1] mb-4">
                    Masukan NIM dan Token Anda
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="nim" className="font-medium">
                      Nomor Induk Mahasiswa (NIM)
                    </Label>
                    <Input
                      id="nim"
                      type="text"
                      placeholder="Contoh: 1234567890"
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      required
                      className="h-12 rounded-md bg-background/70 placeholder:p-1 p-3 focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-orange))]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="token" className="font-medium">
                      Token Pemilihan
                    </Label>
                    <Input
                      id="token"
                      type="password"
                      placeholder="Token rahasia"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                      className="h-12 placeholder:p-1 p-3 rounded-md bg-background/70 tracking-widest focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-orange))] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 mt-4 text-base font-semibold bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--brand-orange))] text-primary-foreground hover:opacity-90 shadow-md shadow-[hsl(var(--brand-orange))]/30 transition"
                  >
                    {loading ? "Memproses..." : "Masuk & Pilih"}
                  </Button>
                </div>
              </form>
  
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  Pastikan data sesuai. Token bersifat satu kali pakai.
                </p>
              </div>
            </CardContent>
            <CardContent className="w-1/2 p-12 bg-[#f1c662d3] items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-wide bg-[#511600a1] bg-clip-text text-transparent">
                  PEMIRA PMK 2025
                </h1>
                <p className="text-sm text-[#511600a1]">
                  Akses pemilihan aman & transparan.
                </p>
                <div className="mt-8 flex justify-center">
                  <div className="w-56 h-56 bg-white/90 rounded-full flex items-center justify-center shadow-xl overflow-hidden">
                    <img
                      src="Logo Utama.png"
                      alt="Logo Pemira PMK"
                      width={180}
                      height={180}
                      className="object-cover text-transparent"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
       </div> */}
      <div className="w-full max-w-5xl">
        <Card className="border-none flex flex-row bg-primary-foreground rounded-2xl shadow-2xl overflow-hidden">
          <CardContent className="w-1/2 p-12 bg-gradient-to-bl from-[#f1c662d3] to-[#947100a1] items-center justify-center flex flex-col">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-wide bg-[#511600a1] bg-clip-text text-transparent">
                PEMIRA PMK 2025
              </h1>
              <p className="text-sm text-[#511600a1]">
                Akses pemilihan aman & transparan.
              </p>
              <div className="mt-8 flex justify-center">
                <div className="w-56 h-56 bg-white/90 rounded-full flex items-center justify-center shadow-xl overflow-hidden">
                  <img
                    src="Logo Utama.png"
                    alt="Logo Pemira PMK"
                    width={180}
                    height={180}
                    className="object-cover text-transparent"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardContent className="w-1/2 p-12">
            <div>
              <CardTitle className="text-3xl font-bold text-primary mt-2">
                Selamat Datang
              </CardTitle>
              <CardDescription className="text-base text-primary mb-3">
                Masuk dengan kredensial admin
              </CardDescription>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="px-4 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="px-4 h-12"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>
            <div className="mt-6 text-center space-y-2">
              <div>
                <a
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  <MoveLeft className="inline-block w-4 me-2"/>
                  Kembali ke Halaman Utama
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
