<script setup lang="ts">
import UserDto from '#dtos/user';
import { Head } from '@inertiajs/vue3'
import Toaster from '~/components/ui/toast/Toaster.vue'
import DashLayout from '~/layouts/DashLayout.vue'
const logoPath = '/images/logo.png'
defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
}>()
defineOptions({ layout: DashLayout })
</script>