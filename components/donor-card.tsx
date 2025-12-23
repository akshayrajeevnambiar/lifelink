import Image from "next/image";
import { Phone, MapPin, Droplets, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type DonorCardProps = {
  donor: {
    id: string;
    name: string;
    bloodGroup: string;
    locationDisplay: string;
    phoneDisplay: string;
    photoUrl: string | null;
    isAvailable: boolean;
    isCompatible: boolean;
  };
};

export default function DonorCard({ donor }: DonorCardProps) {
  const formatBloodGroup = (bg: string) => {
    // A_POSITIVE → A+
    // O_NEGATIVE → O-
    return bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
  };

  return (
    <article
      className="glass-card p-6 rounded-2xl hover:bg-white/10 transition-all group"
      aria-label={`Blood donor: ${donor.name}`}
    >
      <header className="flex items-start space-x-4 mb-4">
        {/* Photo */}
        <div
          className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-red-600 flex-shrink-0 shadow-lg"
          aria-hidden="true"
        >
          {donor.photoUrl ? (
            <Image
              src={donor.photoUrl}
              alt=""
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}

          {/* Fallback - initial */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {donor.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1 truncate">{donor.name}</h3>

          {/* Blood Group Badge */}
          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                donor.isCompatible
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              }`}
              aria-label={`Blood type: ${formatBloodGroup(donor.bloodGroup)}`}
            >
              <Droplets className="h-3 w-3 mr-1" aria-hidden="true" />
              {formatBloodGroup(donor.bloodGroup)}
            </span>

            {donor.isCompatible && (
              <span
                className="text-xs text-green-400 flex items-center"
                role="status"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                Compatible
              </span>
            )}
          </div>

          {/* Location */}
          <p className="text-sm text-slate-400 flex items-center mb-2">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{donor.locationDisplay}</span>
          </p>

          {/* Availability */}
          <div className="flex items-center text-xs">
            {donor.isAvailable ? (
              <span
                className="flex items-center text-green-400"
                role="status"
                aria-label="Currently available to donate"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                Available
              </span>
            ) : (
              <span
                className="flex items-center text-slate-500"
                role="status"
                aria-label="Currently unavailable to donate"
              >
                <XCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                Unavailable
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Call Button */}
      <footer>
        <Button
          asChild
          className="w-full h-12 rounded-xl group-hover:scale-105 transition-transform"
        >
          <a
            href={`tel:${donor.phoneDisplay}`}
            className="flex items-center justify-center"
            aria-label={`Call ${donor.name} at ${donor.phoneDisplay}`}
          >
            <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
            <span>Call {donor.phoneDisplay}</span>
          </a>
        </Button>
      </footer>
    </article>
  );
}
