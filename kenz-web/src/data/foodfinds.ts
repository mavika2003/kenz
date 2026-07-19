import data from "./foodfinds-places.json";

export type FoodFindReel = {
  id: string;
  shortCode: string;
  caption: string;
  thumbnail: string;
  videoUrl?: string;
  url: string;
  likesCount: number;
  timestamp: string;
};

export type FoodFindPlace = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  emoji: string;
  reels: FoodFindReel[];
};

export const foodFindPlaces: FoodFindPlace[] = data.places as FoodFindPlace[];

export const foodFindMustSee: string[] = foodFindPlaces.map((p) => p.name);
