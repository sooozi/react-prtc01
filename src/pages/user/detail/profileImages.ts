/** public/profile 에 두는 프로필 이미지 (경로는 /profile/... 로 제공) */
export const PROFILE_IMAGE_PATHS = [
  "/profile/1.jpg",
  "/profile/2.jpg",
  "/profile/3.png",
  "/profile/4.jpg",
  "/profile/5.jpg",
  "/profile/6.png",
  "/profile/7.png",
  "/profile/8.webp",
  "/profile/9.jpg",
] as const;

/** seed(예: userId)마다 같은 이미지가 나오도록 선택 */
export function pickProfileImage(seed: string): string {
  if (!seed) return PROFILE_IMAGE_PATHS[0];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return PROFILE_IMAGE_PATHS[Math.abs(hash) % PROFILE_IMAGE_PATHS.length];
}
