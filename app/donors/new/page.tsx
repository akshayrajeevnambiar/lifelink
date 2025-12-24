"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { createDonorAction } from "@/app/actions/donor-actions";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function NewDonorPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPublicId, setPhotoPublicId] = useState<string | null>(null);
  const [bloodGroup, setBloodGroup] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handlePhotoUpload = (url: string, publicId: string) => {
    setPhotoUrl(url);
    setPhotoPublicId(publicId);
  };

  const handlePhotoRemove = () => {
    setPhotoUrl(null);
    setPhotoPublicId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    // Add phone number manually (PhoneInput doesn't use standard form field)
    if (phoneNumber) {
      formData.append("phone", phoneNumber);
    }

    // Add photo data if exists
    if (photoUrl) formData.append("photoUrl", photoUrl);
    if (photoPublicId) formData.append("photoPublicId", photoPublicId);

    // Add consent (checkbox value)
    const consentCheckbox = formData.get("consent");
    formData.append("consentGiven", consentCheckbox ? "true" : "false");

    startTransition(async () => {
      const result = await createDonorAction(formData);

      if (result.ok) {
        toast.success(result.message || "Donor registered successfully!");
        router.push(`/search`);
      } else {
        setError(result.message || "Something went wrong");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
          // Show all field errors as toast and log
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            errors.forEach((msg) => {
              toast.error(
                `${field.charAt(0).toUpperCase() + field.slice(1)}: ${msg}`
              );
              console.error(`Field error [${field}]: ${msg}`);
            });
          });
        }
        toast.error(result.message || "Failed to register donor");
        if (!result.fieldErrors) {
          console.error(result.message || "Failed to register donor");
        }
      }
    });
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

        {/* ADD THIS - Live region for screen readers (invisible but announced) */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {error && `Error: ${error}`}
        </div>

        {/* Global Error: only show if no field errors */}
        {error && Object.keys(fieldErrors).length === 0 && (
          <div className="mb-6 flex items-start space-x-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload - stays as is */}
          <div>
            <Label htmlFor="photo-upload" className="text-slate-300 mb-2 block">
              Profile Photo (Optional)
            </Label>
            <PhotoUpload
              onUploadComplete={handlePhotoUpload}
              onRemove={handlePhotoRemove}
              currentPhotoUrl={photoUrl}
              disabled={isPending}
            />
          </div>

          {/* REPLACE your existing Name field with this: */}
          <div>
            <Label htmlFor="name" className="text-slate-300">
              Full Name{" "}
              <span className="text-red-400" aria-label="required">
                *
              </span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              className="mt-2 bg-slate-800/50 border-slate-700"
              required
              disabled={isPending}
              aria-invalid={fieldErrors.name ? "true" : "false"}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
            {fieldErrors.name && fieldErrors.name.length > 0 && (
              <ul
                id="name-error"
                className="text-sm text-red-400 mt-1"
                role="alert"
              >
                {fieldErrors.name.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            )}
          </div>

          {/* REPLACE your existing Blood Group field with this: */}
          <div>
            <Label htmlFor="bloodGroup" className="text-slate-300">
              Blood Group{" "}
              <span className="text-red-400" aria-label="required">
                *
              </span>
            </Label>
            <Select
              name="bloodGroup"
              required
              disabled={isPending}
              value={bloodGroup}
              onValueChange={setBloodGroup}
            >
              <SelectTrigger className="mt-2 bg-slate-800/50 border-slate-700">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="A_POSITIVE" className="focus:bg-slate-800">
                  A+
                </SelectItem>
                <SelectItem value="A_NEGATIVE" className="focus:bg-slate-800">
                  A-
                </SelectItem>
                <SelectItem value="B_POSITIVE" className="focus:bg-slate-800">
                  B+
                </SelectItem>
                <SelectItem value="B_NEGATIVE" className="focus:bg-slate-800">
                  B-
                </SelectItem>
                <SelectItem value="AB_POSITIVE" className="focus:bg-slate-800">
                  AB+
                </SelectItem>
                <SelectItem value="AB_NEGATIVE" className="focus:bg-slate-800">
                  AB-
                </SelectItem>
                <SelectItem value="O_POSITIVE" className="focus:bg-slate-800">
                  O+
                </SelectItem>
                <SelectItem value="O_NEGATIVE" className="focus:bg-slate-800">
                  O-
                </SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.bloodGroup && fieldErrors.bloodGroup.length > 0 && (
              <ul
                id="bloodGroup-error"
                className="text-sm text-red-400 mt-1"
                role="alert"
              >
                {fieldErrors.bloodGroup.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Apply the same pattern to Location and Phone fields */}
          <div>
            <Label htmlFor="location" className="text-slate-300">
              Location{" "}
              <span className="text-red-400" aria-label="required">
                *
              </span>
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="Mumbai, Maharashtra"
              className="mt-2 bg-slate-800/50 border-slate-700"
              required
              disabled={isPending}
              aria-invalid={fieldErrors.location ? "true" : "false"}
              aria-describedby={
                fieldErrors.location ? "location-error" : undefined
              }
            />
            {fieldErrors.location && fieldErrors.location.length > 0 && (
              <ul
                id="location-error"
                className="text-sm text-red-400 mt-1"
                role="alert"
              >
                {fieldErrors.location.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="text-slate-300">
              Phone Number{" "}
              <span className="text-red-400" aria-label="required">
                *
              </span>
            </Label>
            <PhoneInput
              international
              defaultCountry="IN"
              value={phoneNumber}
              onChange={(value) => setPhoneNumber(value || "")}
              disabled={isPending}
              className="mt-2 phone-input-custom"
              placeholder="+91 98765 43210"
              aria-invalid={fieldErrors.phone ? "true" : "false"}
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            />
            {fieldErrors.phone && fieldErrors.phone.length > 0 && (
              <ul
                id="phone-error"
                className="text-sm text-red-400 mt-1"
                role="alert"
              >
                {fieldErrors.phone.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Consent Checkbox */}
          <div>
            <label
              className="flex items-center gap-2 text-slate-300"
              htmlFor="consent"
            >
              <input
                id="consent"
                name="consent"
                type="checkbox"
                className="accent-red-500 w-4 h-4"
                required
                disabled={isPending}
                aria-invalid={fieldErrors.consentGiven ? "true" : "false"}
                aria-describedby={
                  fieldErrors.consentGiven ? "consent-error" : undefined
                }
              />
              I consent to my data being used for blood donation purposes{" "}
              <span className="text-red-400">*</span>
            </label>
            {fieldErrors.consentGiven &&
              fieldErrors.consentGiven.length > 0 && (
                <ul
                  id="consent-error"
                  className="text-sm text-red-400 mt-1"
                  role="alert"
                >
                  {fieldErrors.consentGiven.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base rounded-xl"
            disabled={isPending}
            aria-busy={isPending}
            aria-live="polite"
          >
            {isPending ? (
              <>
                <Loader2
                  className="mr-2 h-5 w-5 animate-spin"
                  aria-hidden="true"
                />
                Registering...
              </>
            ) : (
              "Register as Donor"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
