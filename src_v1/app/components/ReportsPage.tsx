import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { FileText, Download, Calendar } from 'lucide-react';
import { mockStatistics } from '@/lib/mockData';
import { toast } from 'sonner';

export function ReportsPage() {
  const stats = mockStatistics;

  const handleDownloadPDF = (reportType: string) => {
    toast.success(`Rapport ${reportType} téléchargé !`, {
      description: 'Le fichier PDF a été généré avec succès.',
    });
  };

  const monthlyReports = [
    { month: 'Janvier 2026', kg: 67.5, actions: 5 },
    { month: 'Décembre 2025', kg: 63.4, actions: 12 },
    { month: 'Novembre 2025', kg: 51.2, actions: 9 },
    { month: 'Octobre 2025', kg: 38.9, actions: 7 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#2E2E2E] mb-2">Rapports & Exports</h1>
        <p className="text-gray-600">Téléchargez les rapports mensuels et annuels en PDF</p>
      </div>

      {/* Quick Stats for Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-[#0A4F70] mb-2">{stats.totalCleanups}</p>
              <p className="text-sm text-gray-600">Actions totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-[#3FA796] mb-2">{stats.totalKg.toFixed(0)} kg</p>
              <p className="text-sm text-gray-600">Déchets collectés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-[#0A4F70] mb-2">{stats.totalVolunteers}</p>
              <p className="text-sm text-gray-600">Bénévoles actifs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports mensuels</CardTitle>
          <CardDescription>Téléchargez les rapports d'activité par mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthlyReports.map((report) => (
              <div
                key={report.month}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#3FA796] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0A4F70] to-[#3FA796] flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2E2E2E]">{report.month}</h3>
                    <p className="text-sm text-gray-600">
                      {report.actions} actions · {report.kg} kg collectés
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPDF(report.month)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger PDF
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Annual Report */}
      <Card className="border-l-4 border-l-[#0A4F70]">
        <CardHeader>
          <CardTitle>Rapport annuel 2025</CardTitle>
          <CardDescription>Document complet de l'année écoulée</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-white shadow-sm flex items-center justify-center">
                <Calendar className="w-8 h-8 text-[#0A4F70]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#2E2E2E] mb-1">Bilan 2025</h3>
                <p className="text-sm text-gray-600">
                  47 actions · 252.5 kg collectés · 8 bénévoles
                </p>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => handleDownloadPDF('Annuel 2025')}
              className="bg-[#0A4F70] hover:bg-[#0A4F70]/90 gap-2"
            >
              <Download className="w-5 h-5" />
              Télécharger le rapport
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Report */}
      <Card>
        <CardHeader>
          <CardTitle>Rapport personnalisé</CardTitle>
          <CardDescription>Créez un rapport sur mesure avec vos critères</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">Fonctionnalité prochainement disponible</p>
            <Button variant="outline" disabled>
              Créer un rapport personnalisé
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#0A4F70]" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[#2E2E2E] mb-1">À propos des rapports</h4>
              <p className="text-sm text-gray-700">
                Les rapports PDF contiennent des statistiques détaillées, des graphiques, 
                les photos des ramassages et peuvent être partagés avec vos partenaires 
                institutionnels et financeurs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
