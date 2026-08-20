const CACHE = "katelynn-fit-v7-timer-upgrade";
const BASE = "/Katelynn-Fit/";
const paths = [
  "",
  "manifest.webmanifest",
  "assets/apple-touch-icon.png",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/phase3/rower-technique.jpg",
  "assets/exercise-library/generated/arm-circles-female.gif",
  "assets/exercise-library/generated/bird-dog-female.gif",
  "assets/exercise-library/generated/bodyweight-squat-female.gif",
  "assets/exercise-library/generated/cable-chest-press-female.gif",
  "assets/exercise-library/generated/cable-crunch-female.gif",
  "assets/exercise-library/generated/cable-curl-female.gif",
  "assets/exercise-library/generated/cable-face-pull-female.gif",
  "assets/exercise-library/generated/cable-hammer-curl-female.gif",
  "assets/exercise-library/generated/cable-lateral-raise-female.gif",
  "assets/exercise-library/generated/cable-shoulder-press-female.gif",
  "assets/exercise-library/generated/cable-straight-arm-pushdown-female.gif",
  "assets/exercise-library/generated/chest-shoulder-mobility.gif",
  "assets/exercise-library/generated/dead-bug-female.gif",
  "assets/exercise-library/generated/goblet-squat-female.gif",
  "assets/exercise-library/generated/hamstring-mobility.gif",
  "assets/exercise-library/generated/high-to-low-cable-chop-female.gif",
  "assets/exercise-library/generated/hip-flexor-mobility.gif",
  "assets/exercise-library/generated/hip-glute-mobility-female.gif",
  "assets/exercise-library/generated/hip-hinge-female.gif",
  "assets/exercise-library/generated/incline-cable-press-female.gif",
  "assets/exercise-library/generated/lat-pulldown-female.gif",
  "assets/exercise-library/generated/post-workout-stretch-female.gif",
  "assets/exercise-library/generated/rear-delt-cable-fly-female.gif",
  "assets/exercise-library/generated/rope-triceps-pushdown-female.gif",
  "assets/exercise-library/generated/seated-cable-row-female.gif",
  "assets/exercise-library/generated/side-plank-from-knees-female.gif",
  "assets/exercise-library/generated/single-arm-cable-row-female.gif",
  "assets/exercise-library/generated/slow-breathing-female.gif",
  "assets/exercise-library/generated/smith-bulgarian-split-squat-female.gif",
  "assets/exercise-library/generated/smith-machine-calf-raise-female.gif",
  "assets/exercise-library/generated/smith-machine-rdl-female.gif",
  "assets/exercise-library/generated/smith-machine-squat-female.gif",
  "assets/exercise-library/generated/treadmill-easy-walk.gif",
  "assets/exercise-library/generated/treadmill-hiit-interval.gif",
  "assets/exercise-library/generated/treadmill-incline-walk.gif",
  "assets/exercise-library/generated/zone-2-cardio-female.gif",
  "assets/exercise-library/original/arm-circles-posture.webp",
  "assets/exercise-library/original/bodyweight-squat-posture.webp",
  "assets/exercise-library/original/cable-hammer-curl-red-cage.webp",
  "assets/exercise-library/original/hip-hinge-posture.webp",
  "assets/exercise-library/original/incline-cable-press-cage.webp",
  "assets/exercise-library/original/lat-pulldown-red-cage.webp",
  "assets/exercise-library/ritfit/cable-chest-press.webp",
  "assets/exercise-library/ritfit/cable-crunch.webp",
  "assets/exercise-library/ritfit/cable-curl.webp",
  "assets/exercise-library/ritfit/cable-face-pull.webp",
  "assets/exercise-library/ritfit/cable-lateral-raise.webp",
  "assets/exercise-library/ritfit/cable-shoulder-press.webp",
  "assets/exercise-library/ritfit/high-to-low-cable-chop.webp",
  "assets/exercise-library/ritfit/rear-delt-cable-fly.webp",
  "assets/exercise-library/ritfit/seated-cable-row.webp",
  "assets/exercise-library/ritfit/single-arm-cable-row.webp",
  "assets/exercise-library/ritfit/smith-machine-calf-raise.webp",
  "assets/exercise-library/ritfit/smith-machine-rdl.webp",
  "assets/exercise-library/ritfit/smith-machine-squat.webp",
  "assets/exercise-library/ritfit/straight-arm-pulldown.webp",
  "assets/exercise-library/wger/hip-flexor-stretch.webp",
  "assets/exercise-library/wger/smith-split-squat.gif",
  "assets/exercise-library/wger/triceps-pushdown.webp"
];
const SHELL = paths.map((path) => `${BASE}${path}`);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  const isMedia = requestUrl.pathname.includes("/assets/");
  if (isMedia) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    })));
    return;
  }
  event.respondWith(fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match(BASE))));
});
