<template>
  <AppLayout>
    <div class="p-6">
      <Card>
        <CardHeader>
          <CardTitle>사용자 등록</CardTitle>
          <CardDescription>새로운 사용자를 등록합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-muted-foreground">사용자 등록 페이지 (개발 예정)</p>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
</script>
