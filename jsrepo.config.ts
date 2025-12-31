import { defineConfig } from 'jsrepo';

export default defineConfig({
    registries: [
        {
            name: 'vue-bits',
            url: 'https://vue-bits.dev/r',
        },
    ],
    paths: {
        component: 'src/components/ui',
    },
});
