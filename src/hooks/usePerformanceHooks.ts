import { useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Hook optimisé pour la memoization stable avec deep equality
 */
export function useStableMemo<T>(value: T, deps: React.DependencyList): T {
  const ref = useRef<T>(value);
  const depsRef = useRef(deps);
  
  // Vérification si les dépendances ont changé
  const depsChanged = deps.some((dep, index) => dep !== depsRef.current[index]);
  
  if (depsChanged) {
    ref.current = value;
    depsRef.current = deps;
  }
  
  return ref.current;
}

/**
 * Hook pour debouncer les valeurs (optimise les recherches)
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook pour throttler les fonctions (optimise les événements fréquents)
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T, 
  delay: number
): T {
  const throttleRef = useRef<number | null>(null);
  const lastCallTime = useRef<number>(0);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCallTime.current >= delay) {
      lastCallTime.current = now;
      return callback(...args);
    }
    
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }
    
    throttleRef.current = window.setTimeout(() => {
      lastCallTime.current = Date.now();
      callback(...args);
    }, delay - (now - lastCallTime.current));
  }, [callback, delay]) as T;
}

/**
 * Hook pour gérer le cache des données avec expiration
 */
export function useDataCache<T>(
  key: string, 
  fetchData: () => T, 
  ttl: number = 5 * 60 * 1000 // 5 minutes par défaut
) {
  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  
  return useMemo(() => {
    const cached = cache.current.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.data;
    }
    
    const data = fetchData();
    cache.current.set(key, { data, timestamp: now });
    
    return data;
  }, [key, fetchData, ttl]);
}

/**
 * Hook pour optimiser les filtres avec memoization intelligente
 */
export function useOptimizedFilter<T>(
  items: T[],
  filters: Record<string, any>,
  filterFunctions: Record<string, (item: T, value: any) => boolean>
) {
  // Memoize la clé de cache basée sur les filtres
  const cacheKey = useMemo(() => 
    JSON.stringify(filters) + items.length, 
    [filters, items.length]
  );

  return useMemo(() => {
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === '') return true;
        const filterFn = filterFunctions[key];
        return filterFn ? filterFn(item, value) : true;
      });
    });
  }, [items, cacheKey, filterFunctions]);
}

/**
 * Hook pour gérer les images lazy loading
 */
export function useLazyImage(src: string) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return { imageSrc, isLoaded, imgRef, handleLoad };
}

/**
 * Hook pour optimiser les event listeners
 */
export function useOptimizedEventListener<T extends keyof WindowEventMap>(
  eventType: T,
  handler: (event: WindowEventMap[T]) => void,
  options: AddEventListenerOptions = {}
) {
  const handlerRef = useRef(handler);
  
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventHandler = (event: WindowEventMap[T]) => {
      handlerRef.current(event);
    };

    window.addEventListener(eventType, eventHandler, options);
    
    return () => {
      window.removeEventListener(eventType, eventHandler, options);
    };
  }, [eventType, options]);
}

import { useState } from 'react';
