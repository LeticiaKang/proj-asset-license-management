<template>
  <AppLayout>
    <div class="p-6">
      <Card>
        <CardHeader>
          <CardTitle>메뉴별 권한 관리</CardTitle>
          <CardDescription>각 메뉴에 대한 권한을 설정합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-muted-foreground">메뉴별 권한 관리 페이지 (개발 예정)</p>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
</script>
