"use client";

import { useState } from "react";
import Image from "next/image";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Phone, MapPin, Globe, Facebook, Instagram, Twitter, ImageIcon, Mail } from "lucide-react";
import { useSettingsQuery, useUpdateSettingsMutation } from "@/lib/hooks/useSettings";
import { Settings, UpdateSettingsInput } from "@/lib/types/settings.types";

// Custom Icon for Tiktok
const TiktokIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

interface SettingsFormProps {
  initialSettings: Settings;
}

function SettingsForm({ initialSettings }: SettingsFormProps) {
  const updateSettingsMutation = useUpdateSettingsMutation();
  const [formData, setFormData] = useState<UpdateSettingsInput>({
    businessPhone: initialSettings.businessPhone || "",
    businessAddress: initialSettings.businessAddress || "",
    businessMapLink: initialSettings.businessMapLink || "",
    facebookUrl: initialSettings.facebookUrl || "",
    instagramUrl: initialSettings.instagramUrl || "",
    tiktokUrl: initialSettings.tiktokUrl || "",
    twitterUrl: initialSettings.twitterUrl || "",
    heroImageUrl: initialSettings.heroImageUrl || "",
    weekdayOpen: initialSettings.weekdayOpen || "",
    weekdayClose: initialSettings.weekdayClose || "",
    weekendOpen: initialSettings.weekendOpen || "",
    weekendClose: initialSettings.weekendClose || "",
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialSettings.heroImageUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create local preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    await updateSettingsMutation.mutateAsync({
        ...formData,
        heroImage: selectedFile
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--gray-900)]">Settings</h2>
        <p className="text-sm text-[var(--gray-500)]">Manage your business contact and social media information.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card className="border-0 shadow-sm md:col-span-1">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-[var(--brand)]" />
              <CardTitle className="text-lg font-semibold">Contact Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Business Phone */}
            <div className="space-y-2">
              <Label htmlFor="businessPhone">Business Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="businessPhone"
                  value={formData.businessPhone || ""}
                  onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                  placeholder="+62 812 3456 7890"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Business Email */}
            <div className="space-y-2">
              <Label htmlFor="businessEmail">Business Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="businessEmail"
                  type="email"
                  value={formData.businessEmail || ""}
                  onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  placeholder="contact@bouncepadel.com"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Business Address */}
            <div className="space-y-2">
              <Label htmlFor="businessAddress">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="businessAddress"
                  value={formData.businessAddress || ""}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  placeholder="Jl. Example No. 123, Jakarta"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Map Link */}
            <div className="space-y-2">
              <Label htmlFor="businessMapLink">Google Maps Link</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="businessMapLink"
                  value={formData.businessMapLink || ""}
                  onChange={(e) => setFormData({ ...formData, businessMapLink: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-gray-500">Link to your location on Google Maps.</p>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="border-0 shadow-sm md:col-span-1">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[var(--brand)]" />
              <CardTitle className="text-lg font-semibold">Social Media</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Facebook */}
            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <div className="relative">
                <Facebook className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="facebookUrl"
                  value={formData.facebookUrl || ""}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="pl-9"
                />
              </div>
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="instagramUrl"
                  value={formData.instagramUrl || ""}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="pl-9"
                />
              </div>
            </div>

            {/* Tiktok */}
            <div className="space-y-2">
              <Label htmlFor="tiktokUrl">TikTok URL</Label>
              <div className="relative">
                <TiktokIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="tiktokUrl"
                  value={formData.tiktokUrl || ""}
                  onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
                  placeholder="https://tiktok.com/@..."
                  className="pl-9"
                />
              </div>
            </div>

            {/* Twitter / X */}
            <div className="space-y-2">
              <Label htmlFor="twitterUrl">X (Twitter) URL</Label>
              <div className="relative">
                <Twitter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="twitterUrl"
                  value={formData.twitterUrl || ""}
                  onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                  placeholder="https://twitter.com/..."
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card className="border-0 shadow-sm md:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[var(--brand)]" />
              <CardTitle className="text-lg font-semibold">Operating Hours</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Weekday Hours */}
              <div className="space-y-2">
                <Label className="text-base">Monday - Friday</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="weekdayOpen" className="text-xs text-gray-500">Opening Time</Label>
                    <div className="relative">
                      <Input
                        id="weekdayOpen"
                        type="time"
                        value={formData.weekdayOpen || ""}
                        onChange={(e) => setFormData({ ...formData, weekdayOpen: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="weekdayClose" className="text-xs text-gray-500">Closing Time</Label>
                    <div className="relative">
                      <Input
                        id="weekdayClose"
                        type="time"
                        value={formData.weekdayClose || ""}
                        onChange={(e) => setFormData({ ...formData, weekdayClose: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekend Hours */}
              <div className="space-y-2">
                <Label className="text-base">Saturday - Sunday</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="weekendOpen" className="text-xs text-gray-500">Opening Time</Label>
                    <div className="relative">
                      <Input
                        id="weekendOpen"
                        type="time"
                        value={formData.weekendOpen || ""}
                        onChange={(e) => setFormData({ ...formData, weekendOpen: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="weekendClose" className="text-xs text-gray-500">Closing Time</Label>
                    <div className="relative">
                      <Input
                        id="weekendClose"
                        type="time"
                        value={formData.weekendClose || ""}
                        onChange={(e) => setFormData({ ...formData, weekendClose: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visuals / Hero Image */}
        <Card className="border-0 shadow-sm md:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[var(--brand)]" />
              <CardTitle className="text-lg font-semibold">Visuals</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hero Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="heroImage">Hero Image</Label>
              <Input
                id="heroImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">Upload the main banner image displayed on the landing page.</p>
            </div>

            {/* Image Preview with next/image */}
            {previewUrl && (
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 relative h-48 w-full">
                <Image
                  src={previewUrl}
                  alt="Hero Preview"
                  fill
                  className="object-cover"
                  unoptimized // Allow local blobs and external URLs
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] min-w-[150px]"
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending ? (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettingsQuery();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      </MainLayout>
    );
  }

  // Ensure settings is not undefined (it shouldn't be if isLoading is false and fetch successful, but safely handle)
  if (!settings) {
     return (
        <MainLayout>
           <div className="p-6 text-center text-red-500">Failed to load settings.</div>
        </MainLayout>
     )
  }

  return (
    <MainLayout>
      <SettingsForm initialSettings={settings} />
    </MainLayout>
  );
}
