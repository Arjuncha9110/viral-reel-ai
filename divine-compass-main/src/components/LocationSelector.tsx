import React, { useState, useEffect } from "react";
import { Label } from "./ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { MapPin, Globe, Map } from "lucide-react";

import countriesData from "../data/locations/countries.json";

export interface LocationData {
    name: string;
    stateCode: string;
    countryCode: string;
    lat: number;
    lon: number;
    timezone: string;
}

interface CountryState {
    name: string;
    code: string;
    cities: {
        name: string;
        lat: number;
        lon: number;
        timezone: string;
    }[];
}

interface CountryData {
    country: string;
    code: string;
    states: CountryState[];
}

interface LocationSelectorProps {
    onLocationSelect: (location: LocationData) => void;
    initialCity?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
    onLocationSelect,
    initialCity
}) => {
    const [selectedCountry, setSelectedCountry] = useState<string>("");
    const [selectedState, setSelectedState] = useState<string>("");
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [countryData, setCountryData] = useState<CountryData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const countries = countriesData;

    // Load country data dynamically
    useEffect(() => {
        const loadData = async () => {
            if (!selectedCountry) {
                setCountryData(null);
                return;
            }

            setIsLoading(true);
            try {
                // Map GB to UK for file naming if necessary, but we used uk.json, usa.json, india.json
                const fileMap: Record<string, string> = {
                    "IN": "india",
                    "US": "usa",
                    "GB": "uk",
                    "AE": "uae"
                };

                const fileName = fileMap[selectedCountry] || selectedCountry.toLowerCase();
                const data = await import(`../data/locations/${fileName}.json`);
                setCountryData(data.default);
            } catch (error) {
                console.error("Error loading country data:", error);
                setCountryData(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [selectedCountry]);

    // Handle initial city if provided
    useEffect(() => {
        if (initialCity && !selectedCountry) {
            // We can't easily find the country just from the city name with the new dynamic system
            // without loading all files. For now, we'll default to India if it's a common Indian city or just skip.
            // However, most pages pass a default location anyway.
            if (initialCity === "Bengaluru") {
                setSelectedCountry("IN");
                setSelectedState("KA");
                setSelectedCity("Bengaluru");
            }
        }
    }, [initialCity]);

    const states = countryData?.states || [];
    const currentState = states.find(s => s.code === selectedState);
    const cities = currentState?.cities || [];

    const handleCountryChange = (value: string) => {
        setSelectedCountry(value);
        setSelectedState("");
        setSelectedCity("");
    };

    const handleStateChange = (value: string) => {
        setSelectedState(value);
        setSelectedCity("");
    };

    const handleCityChange = (value: string) => {
        setSelectedCity(value);
        const city = cities.find((c) => c.name === value);
        if (city && countryData) {
            onLocationSelect({
                name: city.name,
                stateCode: selectedState,
                countryCode: countryData.code,
                lat: city.lat,
                lon: city.lon,
                timezone: city.timezone
            });
        }
    };

    return (
        <div className="grid gap-4 sm:grid-cols-3 w-full">
            {/* Country Select */}
            <div className="space-y-2">
                <Label className="text-foreground font-medium">Country</Label>
                <Select value={selectedCountry} onValueChange={handleCountryChange}>
                    <SelectTrigger className="h-11 bg-card border-2 border-primary/20 text-foreground">
                        <Globe className="mr-2 h-4 w-4 text-primary" />
                        <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* State Select */}
            <div className="space-y-2">
                <Label className="text-foreground font-medium">State/Region</Label>
                <Select
                    value={selectedState}
                    onValueChange={handleStateChange}
                    disabled={!selectedCountry || isLoading}
                >
                    <SelectTrigger className="h-11 bg-card border-2 border-primary/20 text-foreground">
                        <Map className="mr-2 h-4 w-4 text-primary" />
                        <SelectValue placeholder={isLoading ? "Loading..." : "Select State"} />
                    </SelectTrigger>
                    <SelectContent>
                        {states.map((s) => (
                            <SelectItem key={s.code} value={s.code}>
                                {s.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* City Select */}
            <div className="space-y-2">
                <Label className="text-foreground font-medium">City</Label>
                <Select
                    value={selectedCity}
                    onValueChange={handleCityChange}
                    disabled={!selectedState}
                >
                    <SelectTrigger className="h-11 bg-card border-2 border-primary/20 text-foreground">
                        <MapPin className="mr-2 h-4 w-4 text-primary" />
                        <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                        {cities.map((c) => (
                            <SelectItem key={c.name} value={c.name}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};
