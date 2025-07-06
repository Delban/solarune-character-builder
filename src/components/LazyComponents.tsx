// Lazy loading optimisé pour les composants principaux
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../shared/components/ui/LoadingSpinner';

// Composants chargés de manière paresseuse avec imports optimisés
export const LazyDonList = lazy(() => 
  import('../features/feats/components/FeatList').then(module => ({ default: module.FeatList }))
);

export const LazyDonDetails = lazy(() => 
  import('./DonDetails').then(module => ({ default: module.DonDetails }))
);

export const LazySortList = lazy(() => 
  import('./SortList').then(module => ({ default: module.SortList }))
);

export const LazySortDetails = lazy(() => 
  import('./SortDetails').then(module => ({ default: module.SortDetails }))
);

export const LazyCharacterBuilder = lazy(() => 
  import('../pages/CharacterBuilder').then(module => ({ default: module.CharacterBuilder }))
);

// Composant de loading réutilisable (utilise la version shared)
// export const LoadingSpinner = ... (supprimé, utilise @shared/components/ui)

// HOC pour wrapper les composants lazy avec Suspense
export const withSuspense = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  );
};

// Composants exportés avec Suspense intégré
export const DonListLazy = withSuspense(LazyDonList, <LoadingSpinner message="Chargement des dons..." />);
export const DonDetailsLazy = withSuspense(LazyDonDetails, <LoadingSpinner message="Chargement des détails..." />);
export const SortListLazy = withSuspense(LazySortList, <LoadingSpinner message="Chargement des sorts..." />);
export const SortDetailsLazy = withSuspense(LazySortDetails, <LoadingSpinner message="Chargement des détails..." />);
export const CharacterBuilderLazy = withSuspense(LazyCharacterBuilder, <LoadingSpinner message="Chargement du générateur..." />);
