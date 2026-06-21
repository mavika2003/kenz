# KenZ hero videos

## Current assets (June 2026)

| File | Source | Notes |
|------|--------|-------|
| `hero-urban.mp4` | **Higgsfield** `seedance_2_0` (image-to-video) | From `nano_banana_2` still + slow drift prompt |
| `hero-culture.mp4` | **Higgsfield** `seedance_2_0` (image-to-video) | Gahwa pour animation |
| `hero-desert.mp4` | **Ken Burns** (ffmpeg from Higgsfield still) | Video job failed (out of credits); subtle 10s zoom loop |
| `hero-*-poster.png` | **Higgsfield** `nano_banana_2` stills | Used as video posters |

## Credits & plan

- Free plan: text-to-video (`kling2_6`, `kling3_0_turbo`) requires **Basic plan or higher**
- Image-to-video via `seedance_2_0` works on free tier (~25 credits per 5s clip)
- Desert full AI video: top up credits or upgrade, then run `seedance_2_0` with job `015be717-1d83-4a79-befb-17645eec4359` as `start_image`

## Regenerate desert (when credits available)

In Cursor with Higgsfield MCP:

```
generate_video model=seedance_2_0 duration=5 aspect_ratio=16:9
medias=[{role:start_image, value:015be717-1d83-4a79-befb-17645eec4359}]
prompt="Slow floating aerial glide over desert dunes at sunrise..."
```

Save output to `hero-desert.mp4` and restore `localSrc` in `cinematic-scenes.ts`.

Prompts: `scripts/higgsfield-hero-prompts.json`  
Brand rules: `.cursor/rules/video-branding.mdc`
