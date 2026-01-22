import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Calendar, MapPin, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { wasteTypes, saveCleanup, currentUser } from '@/lib/mockData';
import { CleanupAction } from '@/lib/types';
import { toast } from 'sonner';

export function NewCleanupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWasteTypeToggle = (type: string) => {
    setSelectedWasteTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    const newCleanup: CleanupAction = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      date: new Date(formData.get('date') as string),
      location: formData.get('location') as string,
      latitude: 48.3905 + (Math.random() - 0.5) * 0.5, // Mock coordinates around Brest
      longitude: -4.4516 + (Math.random() - 0.5) * 0.5,
      wasteTypes: selectedWasteTypes,
      quantity: parseFloat(formData.get('quantity') as string),
      photos: photoPreview ? [photoPreview] : [],
      notes: formData.get('notes') as string || undefined,
      createdAt: new Date(),
    };

    // Simulate API call
    setTimeout(() => {
      saveCleanup(newCleanup);
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Ramassage enregistré avec succès !');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedWasteTypes([]);
        setPhotoPreview('');
        (e.target as HTMLFormElement).reset();
      }, 2000);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2E2E2E]">Merci !</h3>
              <p className="text-gray-600">
                Votre action de ramassage a été enregistrée avec succès.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl text-[#2E2E2E] mb-2">Déclarer un ramassage</h1>
        <p className="text-gray-600">Enregistrez votre action de nettoyage des plages et zones côtières</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'action</CardTitle>
            <CardDescription>Renseignez les détails de votre ramassage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date du ramassage
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  disabled={isSubmitting}
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité collectée (kg)</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="12.5"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Lieu du ramassage
              </Label>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="Plage du Moulin Blanc, Brest"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Waste Types */}
            <div className="space-y-3">
              <Label>Types de déchets collectés</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {wasteTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={selectedWasteTypes.includes(type)}
                      onCheckedChange={() => handleWasteTypeToggle(type)}
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor={type}
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
              {selectedWasteTypes.length === 0 && (
                <p className="text-sm text-red-600">Veuillez sélectionner au moins un type de déchet</p>
              )}
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="photo" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Photo (facultatif)
              </Label>
              <Input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={isSubmitting}
              />
              {photoPreview && (
                <div className="mt-2">
                  <img
                    src={photoPreview}
                    alt="Aperçu"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (facultatif)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Commentaires, observations particulières..."
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-[#0A4F70] hover:bg-[#0A4F70]/90"
                disabled={isSubmitting || selectedWasteTypes.length === 0}
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer le ramassage'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedWasteTypes([]);
                  setPhotoPreview('');
                }}
                disabled={isSubmitting}
              >
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
