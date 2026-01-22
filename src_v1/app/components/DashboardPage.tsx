import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Trash2, Users, Calendar, TrendingUp, MapPin } from 'lucide-react';
import { mockStatistics, getStoredCleanups } from '@/lib/mockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function DashboardPage() {
  const stats = mockStatistics;
  const recentCleanups = getStoredCleanups().slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#2E2E2E] mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité et des statistiques globales</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-[#0A4F70]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total collecté
            </CardTitle>
            <Trash2 className="w-5 h-5 text-[#0A4F70]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0A4F70]">{stats.totalKg.toFixed(1)} kg</div>
            <p className="text-xs text-gray-600 mt-1">+12% ce mois-ci</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#3FA796]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Nombre de ramassages
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-[#3FA796]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#3FA796]">{stats.totalCleanups}</div>
            <p className="text-xs text-gray-600 mt-1">Actions réalisées</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#0A4F70]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bénévoles actifs
            </CardTitle>
            <Users className="w-5 h-5 text-[#0A4F70]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0A4F70]">{stats.totalVolunteers}</div>
            <p className="text-xs text-gray-600 mt-1">Ce mois-ci</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#3FA796]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Dernier ramassage
            </CardTitle>
            <Calendar className="w-5 h-5 text-[#3FA796]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-[#3FA796]">
              {stats.lastCleanupDate ? format(stats.lastCleanupDate, 'd MMM', { locale: fr }) : 'N/A'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.lastCleanupDate ? format(stats.lastCleanupDate, 'yyyy', { locale: fr }) : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dernières activités</CardTitle>
            <CardDescription>Les 5 derniers ramassages effectués</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCleanups.map((cleanup) => (
                <div key={cleanup.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {cleanup.photos[0] ? (
                      <img 
                        src={cleanup.photos[0]} 
                        alt={cleanup.location}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#2E2E2E] truncate">{cleanup.location}</p>
                    <p className="text-sm text-gray-600">{cleanup.userName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-semibold text-[#3FA796]">{cleanup.quantity} kg</span>
                      <span className="text-xs text-gray-500">
                        {format(cleanup.date, 'd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zones d'action</CardTitle>
            <CardDescription>Aperçu des zones nettoyées récemment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-[#0A4F70] mx-auto mb-2" />
                <p className="text-sm text-gray-600">Carte interactive disponible</p>
                <p className="text-xs text-gray-500">dans l'onglet "Carte"</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waste Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des déchets collectés</CardTitle>
          <CardDescription>Par type de déchet (en kg)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.wasteByType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, kg]) => {
                const percentage = (kg / stats.totalKg) * 100;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#2E2E2E]">{type}</span>
                      <span className="font-semibold text-[#0A4F70]">{kg.toFixed(1)} kg</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0A4F70] to-[#3FA796] rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
