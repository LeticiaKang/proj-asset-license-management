<template>
  <AppLayout>
    <div class="p-6">
      <Card>
        <CardHeader>
          <CardTitle>사용자 수정</CardTitle>
          <CardDescription>사용자 정보를 수정합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-muted-foreground">사용자 수정 페이지 (개발 예정)</p>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
</script>
