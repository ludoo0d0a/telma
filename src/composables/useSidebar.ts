import { ref, provide, inject, type App } from 'vue';

interface SidebarContextType {
  isOpen: { value: boolean };
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContextKey = Symbol('sidebar');

export function provideSidebar(app: App) {
  const isOpen = ref(false);

  const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
  };

  const closeSidebar = () => {
    isOpen.value = false;
  };

  const sidebarContext: SidebarContextType = {
    isOpen,
    toggleSidebar,
    closeSidebar,
  };

  app.provide(SidebarContextKey, sidebarContext);
}

export function useSidebar(): SidebarContextType {
  const context = inject<SidebarContextType>(SidebarContextKey);
  if (!context) {
    throw new Error('useSidebar must be used within an app that provides sidebar');
  }
  return context;
}

