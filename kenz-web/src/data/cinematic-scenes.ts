export type CinematicScene = {
  id: string;
  label: string;
  headline: string;
  subline: string;
  /** Local path under /public when Higgsfield assets are exported */
  localSrc?: string;
  /** CDN fallback until custom renders land */
  fallbackSrc: string;
  poster: string;
  higgsfieldPrompt: string;
  mood: "urban" | "culture" | "desert";
};

export const CINEMATIC_SCENES: CinematicScene[] = [
  {
    id: "urban",
    label: "Urban skyline",
    headline: "Explore Dubai",
    subline: "Where ambition meets the Gulf",
    localSrc: "/videos/dubai-main.mp4",
    fallbackSrc:
      "https://assets.mixkit.co/videos/preview/mixkit-aerial-panorama-of-dubai-city-4695-large.mp4",
    poster: "/videos/hero-urban-poster.png",
    mood: "urban",
    higgsfieldPrompt:
      "Generate a cinematic 15-second background video for a travel startup website. Subject: A panoramic view of the Dubai Marina skyline at golden hour with Burj Khalifa visible in the distance. Camera: Slow, stable aerial drone tracking shot moving horizontally. Lighting: Warm golden hour glow, soft reflections on glass buildings, high-contrast shadows. Style: Hyper-realistic, 8k resolution, cinematic color grading, professional travel documentary aesthetic, very smooth motion, no rapid camera jumps. Mood: Serene, aspirational, and premium.",
  },
  {
    id: "culture",
    label: "Cultural depth",
    headline: "The local soul",
    subline: "Coffee, souks, and living tradition",
    localSrc: "/videos/marina.mp4",
    fallbackSrc:
      "https://assets.mixkit.co/videos/preview/mixkit-pouring-coffee-in-a-cup-482-large.mp4",
    poster: "/videos/hero-culture-poster.png",
    mood: "culture",
    higgsfieldPrompt:
      "Generate a cinematic 15-second background video for a travel startup website. Subject: Close-up, slow-motion shot of a traditional Arabic coffee pour (gahwa) in a modern minimalist setting. Camera: Locked macro with subtle rack focus, minimal movement. Lighting: Soft diffused morning light, shallow depth of field on dallah texture and coffee stream. Style: Hyper-realistic, 8k, high-end lifestyle commercial aesthetic, very smooth motion. Mood: Serene, intimate, premium travel documentary.",
  },
  {
    id: "desert",
    label: "Desert dawn",
    headline: "Beyond the skyline",
    subline: "Dunes, silence, and early light",
    localSrc: "/videos/burj-al-arab.mp4",
    fallbackSrc:
      "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-sand-dunes-in-the-desert-32812-large.mp4",
    poster: "/videos/hero-desert-poster.png",
    mood: "desert",
    higgsfieldPrompt:
      "Generate a cinematic 15-second background video for a travel startup website. Subject: Low-angle aerial tracking shot gliding over pristine desert dunes at sunrise. Camera: Steady floating motion, no shake, slow horizontal drift. Lighting: Long soft shadows, warm amber sand, vast negative space in sky. Style: Hyper-realistic, 8k, premium travel documentary, very smooth motion. Mood: Serene, vast, evocative of early morning peace.",
  },
];

export function sceneVideoSrc(scene: CinematicScene): string {
  return scene.localSrc ?? scene.fallbackSrc;
}
