// Performance optimization utilities

// Debounce function to limit expensive operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Optimize scroll performance
export const optimizeScrolling = () => {
  // Enable GPU acceleration for smooth scrolling
  document.documentElement.style.scrollBehavior = "smooth";

  // Add passive event listeners for better performance
  const passiveSupported = (() => {
    let passiveSupported = false;
    try {
      const options = {
        get passive() {
          passiveSupported = true;
          return false;
        },
      };
      window.addEventListener("test", null as any, options);
      window.removeEventListener("test", null as any, options);
    } catch (err) {
      passiveSupported = false;
    }
    return passiveSupported;
  })();

  if (passiveSupported) {
    const scrollHandler = throttle(() => {
      // Optimize scroll performance
      requestAnimationFrame(() => {
        // Handle scroll optimizations here
      });
    }, 16); // ~60fps

    window.addEventListener("scroll", scrollHandler, { passive: true });
  }
};

// Preload critical routes
export const preloadRoute = (routePath: string) => {
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = routePath;
  document.head.appendChild(link);
};

// Optimize images with lazy loading
export const optimizeImages = () => {
  if ("loading" in HTMLImageElement.prototype) {
    const images = document.querySelectorAll("img[data-src]");
    images.forEach((img: any) => {
      img.src = img.dataset.src;
      img.loading = "lazy";
    });
  } else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement("script");
    script.src =
      "https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver";
    document.head.appendChild(script);
  }
};

// Reduce layout thrashing
export const optimizeLayout = () => {
  // Use will-change property sparingly and clean up after animations
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const target = mutation.target as HTMLElement;
        if (target.classList.contains("animate-")) {
          target.style.willChange = "transform";
          // Clean up after animation
          setTimeout(() => {
            target.style.willChange = "auto";
          }, 1000);
        }
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  });
};

// Initialize all performance optimizations
export const initPerformanceOptimizations = () => {
  // Run optimizations after DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      optimizeScrolling();
      optimizeImages();
      optimizeLayout();
    });
  } else {
    optimizeScrolling();
    optimizeImages();
    optimizeLayout();
  }
};

// CSS-in-JS performance helper
export const useOptimizedStyles = () => {
  return {
    // Use transform instead of changing top/left for animations
    smoothTransform: {
      transform: "translateZ(0)", // Force GPU acceleration
      willChange: "transform",
    },

    // Optimize scrolling containers
    optimizedScroll: {
      scrollBehavior: "smooth" as const,
      WebkitOverflowScrolling: "touch",
      overscrollBehavior: "contain" as const,
    },

    // Reduce paint operations
    layerPromotion: {
      transform: "translateZ(0)",
      backfaceVisibility: "hidden" as const,
      perspective: 1000,
    },
  };
};
