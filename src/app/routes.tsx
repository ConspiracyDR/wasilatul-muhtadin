import { useEffect, useState } from 'react';

export function useHashlessRouter() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (nextPath: string) => {
    if (window.location.pathname === nextPath) {
      return;
    }
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  };

  return { path, navigate };
}
