'use client';

import { ProjectProvider } from '@/lib/ProjectContext';

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProjectProvider>{children}</ProjectProvider>;
}
