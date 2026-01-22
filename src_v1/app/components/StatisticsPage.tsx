import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { mockStatistics } from '@/lib/mockData';
import { TrendingUp, Award, Target } from 'lucide-react';

const COLORS = ['#0A4F70', '#3FA796', '#7AB8A5', '#1A6A8A', '#2E2E2E', '#95BDB1'];

export function StatisticsPage() {
  const stats = mockStatistics;

  const wasteData = Object.entries(stats.wasteByType).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#2E2E2E] mb-2">Statistiques & Impact</h1>
        <p className="text-gray-600">Visualisez l'impact environnemental de vos actions</p>
      </div>

      {/* Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-t-[#0A4F70]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-[#0A4F70]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Objectif mensuel</p>
                <p className="text-2xl font-bold text-[#0A4F70]">85%</p>
                <p className="text-xs text-gray-500">68 / 80 kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-[#3FA796]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#3FA796]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progression</p>
                <p className="text-2xl font-bold text-[#3FA796]">+24%</p>
                <p className="text-xs text-gray-500">vs mois dernier</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-[#0A4F70]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-[#0A4F70]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Classement</p>
                <p className="text-2xl font-bold text-[#0A4F70]">Top 3</p>
                <p className="text-xs text-gray-500">bénévoles actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
            <CardDescription>Quantité de déchets collectés (kg)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="#2E2E2E"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#2E2E2E" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="kg"
                  stroke="#0A4F70"
                  strokeWidth={3}
                  dot={{ fill: '#0A4F70', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par type</CardTitle>
            <CardDescription>Distribution des déchets collectés</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wasteData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {wasteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Actions Count */}
      <Card>
        <CardHeader>
          <CardTitle>Nombre d'actions par mois</CardTitle>
          <CardDescription>Fréquence des ramassages effectués</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="#2E2E2E"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#2E2E2E" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="actions" fill="#3FA796" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      <Card className="bg-gradient-to-br from-[#0A4F70] to-[#3FA796] text-white">
        <CardHeader>
          <CardTitle className="text-white">Impact environnemental</CardTitle>
          <CardDescription className="text-white/80">Votre contribution pour la planète</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">{stats.totalKg.toFixed(0)}</p>
              <p className="text-white/90">kg de déchets évités en mer</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">~{Math.floor(stats.totalKg * 15)}</p>
              <p className="text-white/90">animaux marins sauvés</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">{(stats.totalKg * 0.5).toFixed(0)}</p>
              <p className="text-white/90">m² de plage nettoyés</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
