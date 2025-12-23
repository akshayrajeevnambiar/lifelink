"use client";

import { useState } from "react";
import PhotoUpload from "@/components/photo-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewDonorPage() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPublicId, setPhotoPublicId] = useState<string | null>(null);

  const handlePhotoUpload = (url: string, publicId: string) => {
    setPhotoUrl(url);
    setPhotoPublicId(publicId);
    console.log("Photo uploaded:", { url, publicId });
  };

  const handlePhotoRemove = () => {
    setPhotoUrl(null);
    setPhotoPublicId(null);
    console.log("Photo removed");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card p-8 rounded-2xl">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Register as Blood Donor
        </h1>
        <p className="text-slate-400 mb-8">
          Help save lives by registering as a blood donor
        </p>

        <form className="space-y-6">
          {/* Photo Upload */}
          <div>
            <Label htmlFor="photo-upload" className="text-slate-300 mb-2 block">
              Profile Photo (Optional)
            </Label>
            <PhotoUpload
              onUploadComplete={handlePhotoUpload}
              onRemove={handlePhotoRemove}
              currentPhotoUrl={photoUrl}
            />
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-slate-300">
              Full Name *
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              className="mt-2 bg-slate-800/50 border-slate-700"
              required
            />
          </div>

          {/* Blood Group */}
          <div>
            <Label htmlFor="bloodGroup" className="text-slate-300">
              Blood Group *
            </Label>
            <Select required>
              <SelectTrigger className="mt-2 bg-slate-800/50 border-slate-700">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A_POSITIVE">A+</SelectItem>
                <SelectItem value="A_NEGATIVE">A-</SelectItem>
                <SelectItem value="B_POSITIVE">B+</SelectItem>
                <SelectItem value="B_NEGATIVE">B-</SelectItem>
                <SelectItem value="AB_POSITIVE">AB+</SelectItem>
                <SelectItem value="AB_NEGATIVE">AB-</SelectItem>
                <SelectItem value="O_POSITIVE">O+</SelectItem>
                <SelectItem value="O_NEGATIVE">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-slate-300">
              Location *
            </Label>
            <Input
              id="location"
              placeholder="Toronto, ON"
              className="mt-2 bg-slate-800/50 border-slate-700"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-slate-300">
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (416) 555-0123"
              className="mt-2 bg-slate-800/50 border-slate-700"
              required
            />
          </div>

          {/* Consent */}
          <div className="flex items-start space-x-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <input type="checkbox" id="consent" className="mt-1" required />
            <Label
              htmlFor="consent"
              className="text-sm text-slate-300 cursor-pointer"
            >
              I confirm that I have consent to share my contact details and
              photo (if provided) publicly to help connect with people in need
              of blood donations.
            </Label>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full h-12 text-base rounded-xl">
            Register as Donor
          </Button>
        </form>
      </div>
    </div>
  );
}
