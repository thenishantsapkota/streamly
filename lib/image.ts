/**
 * Tiny 4x6 dark shimmer placeholder encoded as base64 data URI.
 * Used as blurDataURL on next/image to show a skeleton while loading.
 */
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="4" height="6">
      <rect width="4" height="6" fill="#1c1c24"/>
    </svg>`,
  );

/** Landscape variant for backdrops / 16:9 images */
export const BLUR_DATA_URL_LANDSCAPE =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9">
      <rect width="16" height="9" fill="#1c1c24"/>
    </svg>`,
  );
