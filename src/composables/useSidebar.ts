import { ref, provide, inject } from 'vue';

interface SidebarContextType {
  isOpen: typeof isOpen;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContextKey = Symbol('sidebar');

export const useSidebarProvider = () => {
  const isOpen = ref(false);

  const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
  };

  const closeSidebar = () => {
    isOpen.value = false;
  };

  const context = {
    isOpen,
    toggleSidebar,
    closeSidebar
  };

  provide(SidebarContextKey, context);

  return { isOpen, toggleSidebar, closeSidebar };
};

export const useSidebar = () => {
  const context = inject<{
    isOpen: typeof isOpen;
    toggleSidebar: () => void;
    closeSidebar: () => void;
  }>(SidebarContextKey);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

