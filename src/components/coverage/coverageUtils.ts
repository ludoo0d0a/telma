import { h } from 'vue';

/**
 * Get a status badge component based on the status string
 */
export const getStatusBadge = (status: string | undefined) => {
  if (status === 'running') {
    return h('span', { class: 'tag is-success' }, 'En cours');
  } else if (status === 'closed') {
    return h('span', { class: 'tag is-danger' }, 'Fermé');
  }
  return h('span', { class: 'tag is-light' }, status || 'N/A');
};

