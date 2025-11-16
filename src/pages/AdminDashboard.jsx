import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, CheckCircle, XCircle, TrendingUp, LogOut, Shield, AlertTriangle, Power, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [electionStatus, setElectionStatus] = useState("closed");
  const [stats, setStats] = useState({
    total_voters: 0,
    total_voted: 0,
    total_not_voted: 0,
    participation_rate: 0,
    candidates: [],
    faculties: [],
    election_status: "closed"
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Base URL untuk backend - sesuaikan dengan URL backend Anda
  const API_BASE_URL = "http://localhost:8000";

  // Data dummy sesuai dengan 2 kandidat dan 3 fakultas
  const dummyData = {
    total_voters: 1200,
    total_voted: 843,
    total_not_voted: 357,
    participation_rate: 70.25,
    election_status: "closed",
    candidates: [
      { 
        candidate_id: 1, 
        name: "Erwandi Pantun Pardede", 
        vote_count: 450, 
        percentage: 53.4 
      },
      { 
        candidate_id: 2, 
        name: "Masta Hendri Setiawan Lature", 
        vote_count: 393, 
        percentage: 46.6 
      }
    ],
    faculties: [
      { faculty: "FTI", voted: 420, not_voted: 180, total: 600 },
      { faculty: "FTIK", voted: 283, not_voted: 117, total: 400 },
      { faculty: "FS", voted: 140, not_voted: 60, total: 200 }
    ]
  };

  // Fungsi untuk fetch data dari backend
  const fetchElectionData = async () => {
    try {
      setRefreshing(true);
      
      // Ambil token admin dari localStorage
      const token = localStorage.getItem("admin_token");
      
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        setElectionStatus(data.data.election_status);
        toast.success("Data berhasil diperbarui");
      } else {
        throw new Error(data.message || "Gagal mengambil data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal mengambil data dari server, menggunakan data dummy");
      
      // Fallback ke data dummy yang sudah disesuaikan
      setStats(dummyData);
      setElectionStatus(dummyData.election_status);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fungsi untuk toggle status pemilihan
  const toggleElectionStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const newStatus = electionStatus === "closed" ? "open" : "closed";
      
      const response = await fetch(`${API_BASE_URL}/api/admin/election/status`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setElectionStatus(newStatus);
        setStats(prev => ({ ...prev, election_status: newStatus }));
        
        toast.success(
          newStatus === "open" 
            ? "✅ Pemilihan telah DIBUKA" 
            : "❌ Pemilihan telah DITUTUP"
        );
        
        // Refresh data setelah mengubah status
        fetchElectionData();
      } else {
        throw new Error(data.message || "Gagal mengubah status");
      }
    } catch (error) {
      console.error("Error toggling election status:", error);
      toast.error("Gagal mengubah status pemilihan");
      
      // Fallback: update status lokal saja
      setElectionStatus(prev => prev === "closed" ? "open" : "closed");
      setStats(prev => ({ 
        ...prev, 
        election_status: prev.election_status === "closed" ? "open" : "closed" 
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_token");
    toast.success("Logout berhasil");
    navigate("/admin");
  };

  // Format data untuk chart - HANYA 2 KANDIDAT
  const candidateData = stats.candidates.map(candidate => ({
    name: candidate.name.length > 20 ? candidate.name.split(' ')[0] + '...' : candidate.name,
    fullName: candidate.name,
    value: candidate.vote_count,
    percentage: candidate.percentage,
    color: candidate.candidate_id === 1 ? "#3b82f6" : "#ef4444" // Biru untuk kandidat 1, Merah untuk kandidat 2
  }));

  const participationData = [
    { name: "Sudah Memilih", value: stats.total_voted, color: "#10b981" },
    { name: "Belum Memilih", value: stats.total_not_voted, color: "#6b7280" },
  ];

  const facultyData = stats.faculties.map(faculty => ({
    name: faculty.faculty,
    voted: faculty.voted,
    notVoted: faculty.not_voted,
    total: faculty.total,
    participation: ((faculty.voted / faculty.total) * 100).toFixed(1)
  }));

  // Auto-refresh data setiap 30 detik
  useEffect(() => {
    fetchElectionData();
    
    const interval = setInterval(() => {
      fetchElectionData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-4 py-4 mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin Pemira</h1>
                <p className="text-gray-600">Monitor pemilihan secara real-time</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={fetchElectionData}
                variant="outline" 
                size="sm"
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${
                electionStatus === "open" 
                  ? "bg-green-100 text-green-800 border border-green-300" 
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}>
                <div className={`w-2 h-2 rounded-full ${electionStatus === "open" ? "bg-green-500" : "bg-red-500"}`}></div>
                Status: {electionStatus === "open" ? "DIBUKA" : "DITUTUP"}
              </div>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Emergency Control */}
      <div className="border-b border-yellow-200 bg-yellow-50">
        <div className="px-4 py-4 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">Kontrol Darurat Pemilihan</h3>
                <p className="text-sm text-yellow-700">
                  {electionStatus === "open" 
                    ? "Pemilihan sedang berlangsung" 
                    : "Pemilihan saat ini ditutup"}
                </p>
              </div>
            </div>
            <Button 
              onClick={toggleElectionStatus}
              variant={electionStatus === "open" ? "destructive" : "default"}
              className="gap-2 whitespace-nowrap"
              disabled={loading}
            >
              <Power className="w-4 h-4" />
              {loading ? "Memproses..." : electionStatus === "open" ? "TUTUP Pemilihan" : "BUKA Pemilihan"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 mx-auto max-w-7xl">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pemilih</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total_voters.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-gray-500">Daftar Pemilih Tetap</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sudah Memilih</p>
                  <p className="mt-1 text-2xl font-bold text-green-700">{stats.total_voted.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-gray-500">Telah menggunakan hak pilih</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Belum Memilih</p>
                  <p className="mt-1 text-2xl font-bold text-orange-700">{stats.total_not_voted.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-gray-500">Belum menggunakan hak pilih</p>
                </div>
                <XCircle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Partisipasi</p>
                  <p className="mt-1 text-2xl font-bold text-purple-700">{stats.participation_rate}%</p>
                  <p className="mt-1 text-xs text-gray-500">Persentase partisipasi</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail Kandidat */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          {stats.candidates.map((candidate, index) => (
            <Card key={candidate.candidate_id} className={`border-l-4 ${
              index === 0 ? 'border-blue-400' : 'border-red-400'
            }`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>Kandidat {candidate.candidate_id}</span>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    index === 0 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {candidate.percentage}%
                  </span>
                </CardTitle>
                <CardDescription className="text-base font-medium text-gray-900">
                  {candidate.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Suara:</span>
                    <span className="font-semibold">{candidate.vote_count.toLocaleString()} suara</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${candidate.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="candidates">Perolehan Suara</TabsTrigger>
            <TabsTrigger value="participation">Partisipasi</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Diagram Batang - Perolehan Suara</CardTitle>
                  <CardDescription>Perbandingan suara kedua kandidat</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={candidateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} suara`, 'Jumlah Suara']}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            return payload[0].payload.fullName;
                          }
                          return label;
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Jumlah Suara"
                        radius={[4, 4, 0, 0]}
                      >
                        {candidateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Diagram Lingkaran - Perolehan Suara</CardTitle>
                  <CardDescription>Distribusi suara dalam persentase</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={candidateData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {candidateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} suara (${props.payload.percentage}%)`, 
                          'Jumlah Suara'
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="participation" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status Partisipasi Pemilih</CardTitle>
                  <CardDescription>Perbandingan sudah vs belum memilih</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={participationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {participationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Partisipasi per Fakultas</CardTitle>
                  <CardDescription>Data pemilih berdasarkan 3 fakultas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={facultyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [`${value} mahasiswa`, name]}
                        labelFormatter={(label) => `Fakultas ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="voted" fill="#10b981" name="Sudah Memilih" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="notVoted" fill="#6b7280" name="Belum Memilih" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Tabel Detail Fakultas */}
            <Card>
              <CardHeader>
                <CardTitle>Detail Partisipasi per Fakultas</CardTitle>
                <CardDescription>Data lengkap partisipasi mahasiswa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 font-semibold text-left">Fakultas</th>
                        <th className="py-3 font-semibold text-right">Total</th>
                        <th className="py-3 font-semibold text-right">Sudah Memilih</th>
                        <th className="py-3 font-semibold text-right">Belum Memilih</th>
                        <th className="py-3 font-semibold text-right">Partisipasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facultyData.map((faculty, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 font-medium">{faculty.name}</td>
                          <td className="py-3 text-right">{faculty.total.toLocaleString()}</td>
                          <td className="py-3 font-medium text-right text-green-600">
                            {faculty.voted.toLocaleString()}
                          </td>
                          <td className="py-3 font-medium text-right text-orange-600">
                            {faculty.notVoted.toLocaleString()}
                          </td>
                          <td className="py-3 font-bold text-right">
                            {faculty.participation}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Last Updated */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="text-center text-blue-700">
              <p className="font-medium">🔄 Data Terakhir Diperbarui</p>
              <p className="text-sm">{new Date().toLocaleString('id-ID')}</p>
              <p className="mt-1 text-xs">Auto-refresh setiap 30 detik</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;