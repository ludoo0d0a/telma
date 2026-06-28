<template>
  <div class="app-flight">
    <PageHeader
      title="Raise an Issue"
      subtitle="Signalez un problème en quelques secondes"
      :show-notification="false"
    />

    <main>
      <div class="container" style="padding: '20px'">
        <h2 class="title is-2 has-text-centered">Raise an Issue</h2>
        <div class="columns is-multiline is-mobile is-centered">
          <div
            v-for="(issue, index) in issues"
            :key="index"
            class="column is-half-mobile is-one-third-tablet"
          >
            <button
              class="button is-large is-fullwidth is-flex is-flex-direction-column"
              @click="handleIssueClick(issue.text)"
              style="height: '150px'"
            >
              <span class="icon is-large">
                <component :is="issue.icon" />
              </span>
              <span>{{ issue.text }}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Clock, Ban, Wrench, HeartPulse, DoorClosed, MessageSquareWarning } from 'lucide-vue-next';
import { PageHeader } from '@/components/skytrip';
import type { Component } from 'vue';

interface Issue {
  text: string;
  icon: Component;
}

const issues: Issue[] = [
  { text: 'Delay', icon: Clock },
  { text: 'Cancellation', icon: Ban },
  { text: 'Broken Train', icon: Wrench },
  { text: 'Sick Person', icon: HeartPulse },
  { text: 'Closed Door', icon: DoorClosed },
  { text: 'Other', icon: MessageSquareWarning },
];

const handleIssueClick = (issueText: string) => {
  console.log('Issue reported:', issueText);
  alert(`Thank you for reporting the issue: ${issueText}`);
};
</script>

