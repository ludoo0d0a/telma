import { ref } from 'vue';

export const useSidebar = () => {
  const isOpen = ref(false);

  const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
  };

  const closeSidebar = () => {
    isOpen.value = false;
  };

  return {
    isOpen,
    toggleSidebar,
    closeSidebar
  };
};

