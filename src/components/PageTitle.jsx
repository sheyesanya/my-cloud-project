// Drop-in component to set page title + meta description per page
// Usage: <PageTitle title="Create Campaign" description="Build multi-platform media campaigns" />
import { useEffect } from 'react';

const BASE = 'BrandCasta';

export default function PageTitle({ title, description }) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : `${BASE} — Nigeria's Media Campaign Platform`;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
    }
  }, [title, description]);
  return null;
}