<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
    <Card class="w-[400px]">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl text-center">자산 관리 시스템</CardTitle>
        <CardDescription class="text-center">
          사용자명과 비밀번호를 입력하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <Label for="username">사용자명</Label>
            <Input
              id="username"
              v-model="username"
              type="text"
              placeholder="admin"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="password">비밀번호</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            <template v-if="loading">
              로그인 중...
            </template>
            <template v-else>
              로그인
            </template>
          </Button>
        </form>
        <div v-if="error" class="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
          {{ error }}
        </div>
      </CardContent>
      <CardFooter class="flex flex-col space-y-2">
        <div class="text-sm text-muted-foreground text-center">
          기본 계정: admin / admin123
        </div>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    // TODO: API 연동
    console.log('Login:', username.value, password.value)

    // 임시 딜레이 (실제 API 호출 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 500))

    router.push('/dashboard')
  } catch (err) {
    error.value = '로그인에 실패했습니다. 다시 시도해주세요.'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>
