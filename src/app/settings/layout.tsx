import { redirect } from 'next/navigation';
import { createClient } from '@/server/supabase';
import { SettingsMenuComponent } from './SettingsMenuComponent';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="flex h-full w-full items-start mobile:flex-col mobile:flex-nowrap mobile:gap-0">
      <SettingsMenuComponent />
      <div className="container max-w-none flex grow shrink-0 basis-0 flex-col items-center gap-6 self-stretch bg-default-background py-12 shadow-sm">
        {children}
      </div>
    </div>
  );
} 