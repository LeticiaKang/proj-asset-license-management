<template>
  <AppLayout>
    <div class="p-6">
      <Card>
        <CardHeader>
          <CardTitle>자산 목록</CardTitle>
          <CardDescription>등록된 자산을 조회하고 관리합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-muted-foreground">자산 목록 페이지 (개발 예정)</p>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
</script>
