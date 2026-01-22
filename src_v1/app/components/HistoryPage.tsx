import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { MapPin, Calendar, Trash2 } from 'lucide-react';
import { getStoredCleanups, currentUser } from '@/lib/mockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function HistoryPage() {
  const allCleanups = getStoredCleanups();
  const myCleanups = allCleanups.filter(c => c.userId === currentUser.id);

  const totalMyKg = myCleanups.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#2E2E2E] mb-2">Mon historique</h1>
        <p className="text-gray-600">Consultez toutes vos actions de ramassage</p>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-[#0A4F70]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Mes ramassages</p>
                <p className="text-3xl font-bold text-[#0A4F70]">{myCleanups.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-[#0A4F70] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#3FA796]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total collecté</p>
                <p className="text-3xl font-bold text-[#3FA796]">{totalMyKg.toFixed(1)} kg</p>
              </div>
              <Trash2 className="w-8 h-8 text-[#3FA796] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#0A4F70]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Moyenne par action</p>
                <p className="text-3xl font-bold text-[#0A4F70]">
                  {myCleanups.length > 0 ? (totalMyKg / myCleanups.length).toFixed(1) : '0'} kg
                </p>
              </div>
              <MapPin className="w-8 h-8 text-[#0A4F70] opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes mes actions</CardTitle>
          <CardDescription>Historique complet de vos ramassages</CardDescription>
        </CardHeader>
        <CardContent>
          {myCleanups.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucun ramassage enregistré pour le moment</p>
              <p className="text-sm text-gray-500 mt-2">Commencez par déclarer votre première action !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myCleanups.map((cleanup) => (
                <div
                  key={cleanup.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#3FA796] transition-colors"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {cleanup.photos[0] && (
                      <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img
                          src={cleanup.photos[0]}
                          alt={cleanup.location}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-[#2E2E2E] mb-1">{cleanup.location}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(cleanup.date, "EEEE d MMMM yyyy", { locale: fr })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#3FA796]">{cleanup.quantity} kg</p>
                          <p className="text-xs text-gray-500">collectés</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {cleanup.wasteTypes.map((type) => (
                          <Badge key={type} variant="secondary" className="bg-[#F2EFEA] text-[#2E2E2E]">
                            {type}
                          </Badge>
                        ))}
                      </div>

                      {cleanup.notes && (
                        <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded">
                          {cleanup.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
