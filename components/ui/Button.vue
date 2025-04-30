<template>
  <button :class="buttonClasses" :disabled="disabled" @click="handleClick">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
  import { computed, PropType } from 'vue';

  const props = defineProps({
    /**
     * Size of the button.
     * @type {'small' | 'large'}
     * @default 'small'
     */
    size: {
      type: String as PropType<'small' | 'large'>,
      default: 'small'
    },
    /**
     * Kind of the button, which determines its color.
     * @type {'primary' | 'secondary' | 'secondary-dark-bg'}
     * @default 'blue'
     */
    kind: {
      type: String as PropType<'primary' | 'secondary' | 'secondary-dark-bg'>,
      default: 'blue'
    },
    /**
     * Whether the button is disabled.
     * @type {boolean}
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    }
  });

  const buttonClasses = computed(() => {
    const sizeClass = props.size === 'large' ? 'btn-large' : 'btn-small';
    const colorClass = {
      primary: 'button-orange',
      secondary: 'button-blue',
      'secondary-dark-bg': 'button-white'
    }[props.kind];

    return `${sizeClass} ${colorClass}`;
  });

  const emit = defineEmits(['click']);
  /**
   * Handles the button click event.
   * Emits a click event if the button is not disabled.
   * @param {Event} event - The click event.
   */
  const handleClick = (event: Event) => {
    if (!props.disabled) {
      emit('click', event);
    }
  };
</script>
