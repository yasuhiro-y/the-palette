import { parseColor, type ColorResult } from "./color-utils";

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Extract dominant colors from an image using k-means clustering
 */
export async function extractColorsFromImage(
  imageSource: string | File,
  colorCount: number = 8
): Promise<ColorResult[]> {
  const imageData = await loadImageData(imageSource);
  const pixels = getPixelsFromImageData(imageData);
  const clusters = kMeansClustering(pixels, colorCount);
  
  // Sort by frequency (largest cluster first)
  clusters.sort((a, b) => b.count - a.count);
  
  const colors: ColorResult[] = [];
  for (const cluster of clusters) {
    const hex = rgbToHex(cluster.center);
    const parsed = parseColor(hex);
    if (parsed) {
      colors.push(parsed);
    }
  }
  
  return colors;
}

/**
 * Load image and get ImageData
 */
async function loadImageData(source: string | File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Limit size for performance
      const maxSize = 200;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      resolve(imageData);
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    
    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(source);
    } else {
      img.src = source;
    }
  });
}

/**
 * Extract RGB pixels from ImageData, sampling for performance
 */
function getPixelsFromImageData(imageData: ImageData): RGB[] {
  const pixels: RGB[] = [];
  const data = imageData.data;
  const sampleRate = Math.max(1, Math.floor(data.length / 4 / 10000)); // Sample ~10k pixels max
  
  for (let i = 0; i < data.length; i += 4 * sampleRate) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    // Skip transparent pixels
    if (a < 128) continue;
    
    // Skip very light (white) and very dark (black) pixels
    const brightness = (r + g + b) / 3;
    if (brightness > 250 || brightness < 5) continue;
    
    pixels.push({ r, g, b });
  }
  
  return pixels;
}

interface Cluster {
  center: RGB;
  count: number;
}

/**
 * K-means clustering for color quantization
 */
function kMeansClustering(pixels: RGB[], k: number, iterations: number = 10): Cluster[] {
  if (pixels.length === 0) return [];
  if (pixels.length <= k) {
    return pixels.map(p => ({ center: p, count: 1 }));
  }
  
  // Initialize centroids using k-means++ method
  const centroids: RGB[] = [];
  centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
  
  while (centroids.length < k) {
    const distances = pixels.map(pixel => {
      const minDist = Math.min(...centroids.map(c => colorDistance(pixel, c)));
      return minDist * minDist;
    });
    
    const totalDist = distances.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalDist;
    
    for (let i = 0; i < pixels.length; i++) {
      random -= distances[i];
      if (random <= 0) {
        centroids.push(pixels[i]);
        break;
      }
    }
  }
  
  // Run k-means iterations
  for (let iter = 0; iter < iterations; iter++) {
    // Assign pixels to nearest centroid
    const clusters: RGB[][] = Array.from({ length: k }, () => []);
    
    for (const pixel of pixels) {
      let minDist = Infinity;
      let minIdx = 0;
      
      for (let i = 0; i < centroids.length; i++) {
        const dist = colorDistance(pixel, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          minIdx = i;
        }
      }
      
      clusters[minIdx].push(pixel);
    }
    
    // Update centroids
    for (let i = 0; i < k; i++) {
      if (clusters[i].length > 0) {
        centroids[i] = {
          r: Math.round(clusters[i].reduce((sum, p) => sum + p.r, 0) / clusters[i].length),
          g: Math.round(clusters[i].reduce((sum, p) => sum + p.g, 0) / clusters[i].length),
          b: Math.round(clusters[i].reduce((sum, p) => sum + p.b, 0) / clusters[i].length),
        };
      }
    }
  }
  
  // Final assignment to get counts
  const finalClusters: Cluster[] = centroids.map(c => ({ center: c, count: 0 }));
  
  for (const pixel of pixels) {
    let minDist = Infinity;
    let minIdx = 0;
    
    for (let i = 0; i < centroids.length; i++) {
      const dist = colorDistance(pixel, centroids[i]);
      if (dist < minDist) {
        minDist = dist;
        minIdx = i;
      }
    }
    
    finalClusters[minIdx].count++;
  }
  
  // Filter out empty clusters
  return finalClusters.filter(c => c.count > 0);
}

/**
 * Euclidean distance in RGB space
 */
function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) +
    Math.pow(a.g - b.g, 2) +
    Math.pow(a.b - b.b, 2)
  );
}

/**
 * Convert RGB to hex string
 */
function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}
