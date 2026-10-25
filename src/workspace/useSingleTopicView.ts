import { useEffect, useState } from 'react';

export const SINGLE_TOPIC_VIEW_QUERY = '(max-width: 900px), (max-height: 600px)';

export function useSingleTopicView() {
  const [singleView, setSingleView] = useState(() => window.matchMedia?.(SINGLE_TOPIC_VIEW_QUERY).matches ?? false);

  useEffect(() => {
    const media = window.matchMedia?.(SINGLE_TOPIC_VIEW_QUERY);
    if (!media) return undefined;
    const update = () => setSingleView(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return singleView;
}
