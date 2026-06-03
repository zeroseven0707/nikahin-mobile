/**
 * imageOptimizer.js
 * 
 * Kompres dan resize gambar sebelum upload menggunakan expo-image-manipulator.
 * Tujuan: kurangi ukuran file tanpa kehilangan kualitas visual yang berarti.
 */
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Default optimization options
 */
const DEFAULTS = {
  maxWidth:   1280,   // px — max lebar output
  maxHeight:  1280,   // px — max tinggi output
  quality:    0.82,   // 0–1 (JPEG quality)
  format:     ImageManipulator.SaveFormat.JPEG,
};

/**
 * Optimize a single image URI.
 *
 * @param {string} uri          - Local image URI dari ImagePicker / Camera
 * @param {object} options      - Override default options
 * @param {number} options.maxWidth
 * @param {number} options.maxHeight
 * @param {number} options.quality    - 0.0–1.0
 * @param {string} options.format     - SaveFormat.JPEG | SaveFormat.PNG
 *
 * @returns {Promise<{uri: string, width: number, height: number, fileName: string, mimeType: string}>}
 */
export async function optimizeImage(uri, options = {}) {
  const cfg = { ...DEFAULTS, ...options };

  // Step 1 — get original dimensions (resize only if needed)
  let actions = [];

  // We resize using ImageManipulator's resize action.
  // Pass resize with both constraints; manipulator will maintain aspect ratio.
  actions.push({
    resize: {
      width:  cfg.maxWidth,
      height: cfg.maxHeight,
    },
  });

  const result = await ImageManipulator.manipulateAsync(
    uri,
    actions,
    {
      compress: cfg.quality,
      format:   cfg.format,
      base64:   false,
    }
  );

  const ext      = cfg.format === ImageManipulator.SaveFormat.PNG ? 'png' : 'jpg';
  const mimeType = cfg.format === ImageManipulator.SaveFormat.PNG ? 'image/png' : 'image/jpeg';
  const fileName = `optimized_${Date.now()}.${ext}`;

  return {
    uri:      result.uri,
    width:    result.width,
    height:   result.height,
    fileName,
    mimeType,
  };
}

/**
 * Optimize multiple images concurrently (max 4 parallel).
 *
 * @param {Array<{uri: string, fileName?: string, mimeType?: string}>} assets
 * @param {object} options
 * @returns {Promise<Array>}
 */
export async function optimizeImages(assets, options = {}) {
  const CHUNK = 4;
  const results = [];

  for (let i = 0; i < assets.length; i += CHUNK) {
    const chunk = assets.slice(i, i + CHUNK);
    const optimized = await Promise.all(
      chunk.map((asset) => optimizeImage(asset.uri, options))
    );
    results.push(...optimized);
  }

  return results;
}

/**
 * Get human-readable file size string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Quick estimate of whether an image needs compression.
 * Based on file size + dimensions heuristic.
 *
 * @param {object} asset - ImagePicker asset
 * @returns {boolean}
 */
export function needsOptimization(asset) {
  const SIZE_THRESHOLD = 800 * 1024; // 800 KB
  const DIM_THRESHOLD  = 1280;

  const tooBig    = asset.fileSize && asset.fileSize > SIZE_THRESHOLD;
  const tooWide   = asset.width    && asset.width   > DIM_THRESHOLD;
  const tooTall   = asset.height   && asset.height  > DIM_THRESHOLD;

  return tooBig || tooWide || tooTall;
}
