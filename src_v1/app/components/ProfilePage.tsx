import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { User, Mail, Calendar, Award, Trash2, MapPin } from 'lucide-react';
import { getStoredUser, getStoredCleanups } from '@/lib/mockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export function ProfilePage() {
  const user = getStoredUser();
  const myCleanups = getStoredCleanups().filter(c => c.userId === user?.id);
  const totalKg = myCleanups.reduce((sum, c) => sum + c.quantity, 0);

  if (!user) return null;

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Profil mis à jour avec succès !');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#2E2E2E] mb-2">Mon profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles et consultez vos badges</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarFallback className="bg-gradient-to-br from-[#0A4F70] to-[#3FA796] text-white text-2xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-semibold text-[#2E2E2E] mb-1">{user.name}</h2>
                <Badge className="mb-4 bg-[#3FA796]">Bénévole actif</Badge>
                
                <div className="w-full space-y-3 mt-6">
                  <div className="flex items-center gap-3 text-left">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-[#2E2E2E]">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Membre depuis</p>
                      <p className="text-sm text-[#2E2E2E]">
                        {format(user.joinedDate, 'MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Rôle</p>
                      <p className="text-sm text-[#2E2E2E] capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Mes statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-[#0A4F70]" />
                  <span className="text-sm text-gray-600">Total collecté</span>
                </div>
                <span className="font-bold text-[#0A4F70]">{totalKg.toFixed(1)} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#3FA796]" />
                  <span className="text-sm text-gray-600">Ramassages</span>
                </div>
                <span className="font-bold text-[#3FA796]">{myCleanups.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0A4F70]" />
                  <span className="text-sm text-gray-600">Badges obtenus</span>
                </div>
                <span className="font-bold text-[#0A4F70]">3</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile Form & Badges */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modifier mes informations</CardTitle>
              <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={user.name}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={user.email}
                      placeholder="jean@exemple.fr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone (facultatif)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-[#0A4F70] hover:bg-[#0A4F70]/90">
                    Enregistrer les modifications
                  </Button>
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Mes badges</CardTitle>
              <CardDescription>Récompenses pour votre engagement environnemental</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 border-2 border-[#3FA796] rounded-lg bg-green-50">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0A4F70] to-[#3FA796] flex items-center justify-center mb-2">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-sm text-center">Première action</p>
                  <p className="text-xs text-gray-600 text-center">Débloqué</p>
                </div>

                <div className="flex flex-col items-center p-4 border-2 border-[#3FA796] rounded-lg bg-green-50">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0A4F70] to-[#3FA796] flex items-center justify-center mb-2">
                    <Trash2 className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-sm text-center">10 kg collectés</p>
                  <p className="text-xs text-gray-600 text-center">Débloqué</p>
                </div>

                <div className="flex flex-col items-center p-4 border-2 border-[#3FA796] rounded-lg bg-green-50">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0A4F70] to-[#3FA796] flex items-center justify-center mb-2">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-sm text-center">3 lieux différents</p>
                  <p className="text-xs text-gray-600 text-center">Débloqué</p>
                </div>

                <div className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg opacity-50">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                    <Award className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-semibold text-sm text-center">50 kg collectés</p>
                  <p className="text-xs text-gray-600 text-center">Verrouillé</p>
                </div>

                <div className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg opacity-50">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-semibold text-sm text-center">6 mois d'activité</p>
                  <p className="text-xs text-gray-600 text-center">Verrouillé</p>
                </div>

                <div className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg opacity-50">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                    <Award className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-semibold text-sm text-center">100 kg collectés</p>
                  <p className="text-xs text-gray-600 text-center">Verrouillé</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
