// aos.ts
// Utility to initialize AOS (Animate On Scroll)

export function initAOS() {
  if (typeof window !== 'undefined' && (window as any).AOS) {
    (window as any).AOS.init({
      duration: 700,
      once: true,
      easing: 'ease-in-out',
    });
  }
}
