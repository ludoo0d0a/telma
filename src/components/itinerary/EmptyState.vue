<template>
  <div class="box has-text-centered">
    <div class="content">
      <span class="icon is-large has-text-warning mb-4" style="font-size: 4rem">🚂</span>
      <h2 class="title is-4">Aucun train trouvé</h2>
      <p class="subtitle is-6 has-text-grey">
        Il n'y a actuellement aucun train disponible entre {{ fromName || 'la gare de départ' }} et {{ toName || 'la gare d\'arrivée' }} pour les prochains jours.
      </p>
      <div class="content has-text-left mt-5">
        <div class="message is-info">
          <div class="message-header">
            <p>Informations</p>
          </div>
          <div class="message-body">
            <ul>
              <li>
                Gare de départ: <strong>{{ fromId ? `${fromName} (trouvée)` : `${fromName || 'Non sélectionnée'} (non trouvée)` }}</strong>
              </li>
              <li>
                Gare d'arrivée: <strong>{{ toId ? `${toName} (trouvée)` : `${toName || 'Non sélectionnée'} (non trouvée)` }}</strong>
              </li>
              <li>Période recherchée: Aujourd'hui et les 2 prochains jours</li>
            </ul>
          </div>
        </div>
        <div class="notification is-warning is-light mt-4">
          <p>
            <strong>Suggestion:</strong> Essayez de vérifier les horaires directement sur le site SNCF ou contactez le service client.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  fromName: string;
  toName: string;
  fromId: string | undefined;
  toId: string | undefined;
}

defineProps<Props>();
</script>

