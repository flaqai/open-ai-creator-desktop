import { SidebarProvider } from '@/components/ui/sidebar';
import Sider3 from '@/components/sider/panel-sider/sider3';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className='min-h-[calc(100dvh-64px)]'>
      <Sider3 />
      <div className='min-w-0 flex-1 overflow-x-hidden'>{children}</div>
    </SidebarProvider>
  );
}
