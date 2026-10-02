import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SiteHeader } from '@/components/dashboard/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { FloatingAiCopilot } from '@/components/ai/FloatingAiCopilot';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 overflow-auto bg-[var(--bg-base)] min-w-0">
          {children}
        </div>
        <FloatingAiCopilot />
      </SidebarInset>
    </SidebarProvider>
  );
}

