import { Coordinates, LocationResolution } from "./communityTypes";

const knownLocations: Array<{
  matches: string[];
  result: LocationResolution;
}> = [
  {
    matches: ["maplewood", "07040"],
    result: {
      latitude: 40.7312,
      longitude: -74.2714,
      approximateLocationLabel: "Maplewood",
      source: "demo-geocode",
    },
  },
  {
    matches: ["north aiken"],
    result: {
      latitude: 33.608,
      longitude: -81.72,
      approximateLocationLabel: "North Aiken",
      source: "demo-geocode",
    },
  },
  {
    matches: ["aiken", "29801", "29803", "29805"],
    result: {
      latitude: 33.5604,
      longitude: -81.7196,
      approximateLocationLabel: "Aiken",
      source: "demo-geocode",
    },
  },
];

export const resolveApproximateLocation = (
  input: string,
): LocationResolution => {
  const normalized = input.trim().toLowerCase();
  const known = knownLocations.find((entry) =>
    entry.matches.some((match) => normalized.includes(match)),
  );
  if (known) return known.result;

  return {
    latitude: 33.66,
    longitude: -81.82,
    approximateLocationLabel:
      input.trim().split(",")[0].trim() || "Approximate area",
    source: "regional-fallback",
  };
};

export const milesBetween = (a: Coordinates, b: Coordinates) => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const latitudeDelta = toRadians(b.latitude - a.latitude);
  const longitudeDelta = toRadians(b.longitude - a.longitude);
  const latitude1 = toRadians(a.latitude);
  const latitude2 = toRadians(b.latitude);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(value));
};
