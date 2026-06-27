export type CinematicScene = {
  id: string;
  label: string;
  headline: string;
  subline: string;
  /** Served from kenz-web/public/videos (synced from /assets) */
  src: string;
  higgsfieldPrompt: string;
  mood: "urban" | "culture" | "desert";
};

export const CINEMATIC_SCENES: CinematicScene[] = [
  {
    id: "urban",
    label: "Urban skyline",
    headline: "Explore Dubai",
    subline: "Where ambition meets the Gulf",
    src: "/videos/dubai-main.mp4",
    mood: "urban",
    higgsfieldPrompt:
      "Generate a cinematic 15-second background video for a travel startup website. Subject: A panoramic view of the Dubai Marina skyline at golden hour with Burj Khalifa visible in the distance. Camera: Slow, stable aerial drone tracking shot moving horizontally. Lighting: Warm golden hour glow, soft reflections on glass buildings, high-contrast shadows. Style: Hyper-realistic, 8k resolution, cinematic color grading, professional travel documentary aesthetic, very smooth motion, no rapid camera jumps. Mood: Serene, aspirational, and premium.",
  },
  {
    id: "culture",
    label: "Marina",
    headline: "The waterfront",
    subline: "Marina walks and golden-hour light",
    src: "/videos/marina.mp4",
    mood: "culture",
    higgsfieldPrompt:
      "Generate a cinematic 15-second background video for a travel startup website. Subject: Dubai Marina waterfront at golden hour. Camera: Slow, stable aerial or tracking shot. Style: Hyper-realistic, premium travel documentary aesthetic, very smooth motion.",
  },
  {
    id: "desert",
    label: "Burj Al Arab",
    headline: "Iconic Dubai",
    subline: "Landmarks that define the skyline",
    src: "/videos/burj-al-arab.mp4",
    mood: "desert",
    higgsfieldPrompt:
      "Generate a cinematic 15-second background video for a travel startup website. Subject: Burj Al Arab and Dubai coastline. Camera: Steady floating motion, no shake. Style: Hyper-realistic, premium travel documentary, very smooth motion.",
  },
];

export function sceneVideoSrc(scene: CinematicScene): string {
  return scene.src;
}
