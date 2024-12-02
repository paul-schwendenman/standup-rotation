<script lang="ts">
    import Wheel from '$lib/components/Wheel.svelte';
import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let wheelProps = {
        name: 'Basic',
        items: [
            {
                label: 'one',
            },
            {
                label: 'two',
            },
            {
                label: 'three',
            },
        ],
    };
</script>

<Wheel props={wheelProps} />
