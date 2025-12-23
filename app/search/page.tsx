"use client";

import { useState, useEffect } from "react";
import {
  Search as SearchIcon,
  Loader2,
  RefreshCw,
  MapPin,
  Droplets,
} from "lucide-react";
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
import DonorCard from "@/components/donor-card";
import { toast } from "sonner";

type Donor = {
  id: string;
  name: string;
  bloodGroup: string;
  locationDisplay: string;
  phoneDisplay: string;
  photoUrl: string | null;
  isAvailable: boolean;
  isCompatible: boolean;
};

export default function SearchPage() {
  const [bloodGroup, setBloodGroup] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (bloodGroup) params.append("bloodGroup", bloodGroup);
      if (location) params.append("location", location);
      params.append("seed", seed.toString());
      params.append("limit", "50");

      const response = await fetch(`/api/donors/search?${params}`);
      const data = await response.json();

      if (data.ok) {
        setDonors(data.donors);
        if (data.donors.length === 0) {
          toast.info("No donors found. Try adjusting your search.");
        }
      } else {
        toast.error(data.message || "Search failed");
        setDonors([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search. Please try again.");
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSeed((prev) => prev + 1);
    handleSearch();
  };

  // Keyboard shortcut - Escape to clear filters
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (bloodGroup || location)) {
        setBloodGroup("");
        setLocation("");
        toast.info("Filters cleared");
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [bloodGroup, location]);

  // Auto-search on mount if no filters
  useEffect(() => {
    handleSearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-7xl mx-auto">
      {/* Live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {loading && "Searching for donors..."}
        {!loading &&
          hasSearched &&
          `Found ${donors.length} donor${donors.length !== 1 ? "s" : ""}`}
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Find Blood Donors
        </h1>
        <p className="text-slate-400 text-lg" role="doc-subtitle">
          Connect with life-saving donors in your area
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="glass-card p-6 rounded-2xl mb-8"
        role="search"
        aria-label="Search for blood donors"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Blood Group Filter */}
          <div>
            <Label htmlFor="bloodGroup" className="text-slate-300 mb-2 block">
              <Droplets className="inline h-4 w-4 mr-1" aria-hidden="true" />
              Blood Group
            </Label>
            <Select
              value={bloodGroup}
              onValueChange={setBloodGroup}
              aria-label="Filter by blood group"
            >
              <SelectTrigger
                id="bloodGroup"
                className="bg-slate-800/50 border-slate-700"
                aria-label={
                  bloodGroup
                    ? `Selected: ${bloodGroup.replace("_", "")}`
                    : "All blood groups"
                }
              >
                <SelectValue placeholder="All blood groups" />
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
          </div>

          {/* Location Filter */}
          <div>
            <Label htmlFor="location" className="text-slate-300 mb-2 block">
              <MapPin className="inline h-4 w-4 mr-1" aria-hidden="true" />
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Mumbai, Delhi"
              className="bg-slate-800/50 border-slate-700"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              aria-label="Filter by location"
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl"
              aria-busy={loading}
              aria-live="polite"
            >
              {loading ? (
                <>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <SearchIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Search</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Results Header */}
      {hasSearched && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-slate-300 font-medium text-xl">
              {loading
                ? "Searching..."
                : `${donors.length} donor${
                    donors.length !== 1 ? "s" : ""
                  } found`}
            </h2>
            {bloodGroup && (
              <p className="text-sm text-slate-400" role="status">
                Showing compatible donors for {bloodGroup.replace("_", "")}
              </p>
            )}
          </div>

          {donors.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="rounded-xl"
              aria-label="Refresh results to show different donors"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>Refresh</span>
            </Button>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          aria-label="Loading donor results"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="glass-card p-6 rounded-2xl animate-pulse"
              aria-hidden="true"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-slate-700 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                  <div className="h-3 bg-slate-700 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Donor Cards */}
      {!loading && donors.length > 0 && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label={`${donors.length} donor search results`}
        >
          {donors.map((donor) => (
            <div key={donor.id} role="listitem">
              <DonorCard donor={donor} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && hasSearched && donors.length === 0 && (
        <div className="glass-card p-12 rounded-2xl text-center" role="status">
          <div
            className="inline-block p-4 bg-slate-800/50 rounded-full mb-4"
            aria-hidden="true"
          >
            <SearchIcon className="h-12 w-12 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No donors found</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            We couldn't find any donors matching your criteria. Try adjusting
            your filters or search in a different location.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setBloodGroup("");
                setLocation("");
                handleSearch();
              }}
              className="rounded-xl"
              aria-label="Clear all filters and show all donors"
            >
              Clear Filters
            </Button>
            <Button
              onClick={() => (window.location.href = "/donors/new")}
              className="rounded-xl"
              aria-label="Register yourself as a blood donor"
            >
              Register as Donor
            </Button>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div
        className="mt-12 glass-card p-6 rounded-2xl border-l-4 border-blue-500"
        role="complementary"
        aria-label="Information about blood compatibility"
      >
        <h3 className="font-semibold mb-2 flex items-center">
          <Droplets className="h-5 w-5 mr-2 text-blue-400" aria-hidden="true" />
          Why Your Blood Type Matters
        </h3>
        <p className="text-sm text-slate-400">
          Blood compatibility saves lives. Our search automatically includes
          compatible blood types. For example, if you search for B+, we'll show
          B+, B-, O+, and O- donors who can safely donate to you.
        </p>
      </div>
    </div>
  );
}
