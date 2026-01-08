<template>
  <AppLayout>
    <div class="p-6">
      <Card>
        <CardHeader>
          <CardTitle>라이센스 사용 현황</CardTitle>
          <CardDescription>등록된 라이센스가 사용되는 현황을 사용자별로 매칭되어 조회됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-muted-foreground">라이센스 사용 현황 페이지 (개발 예정)</p>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
</script>
