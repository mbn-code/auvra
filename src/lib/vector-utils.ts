/**
 * AUVRA VECTOR UTILITIES
 * Bridge to the ResNet50 Feature Extraction Microservice
 */

export async function getImageEmbedding(imageUrl: string): Promise<number[]> {
  // In a real production environment, this would call a Python service running Torch/ResNet50.
  // For now, we return a deterministic pseudo-random vector based on the URL to simulate the architecture.
  
  console.log(`[VectorEngine] Generating embedding for: ${imageUrl}`);
  
  // Simulated 2048-dimension vector
  const dimensions = 2048;
  const embedding = new Array(dimensions).fill(0).map((_, i) => {
    // Deterministic value based on string hash
    const charCode = imageUrl.charCodeAt(i % imageUrl.length);
    return (Math.sin(charCode + i) * 0.1);
  });

  return embedding;
}

/**
 * Normalizes a vector to unit length (L2 norm)
 */
export function normalize(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
  return v.map(val => val / norm);
}
