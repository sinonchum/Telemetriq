import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0a0a1a' }] },
  },
};

export default preview;
