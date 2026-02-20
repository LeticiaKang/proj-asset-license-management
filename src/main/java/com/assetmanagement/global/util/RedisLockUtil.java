package com.assetmanagement.global.util;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class RedisLockUtil {

    private final StringRedisTemplate redisTemplate;

    public boolean tryLock(String key, Duration ttl) {
        return Boolean.TRUE.equals(
            redisTemplate.opsForValue().setIfAbsent(key, "LOCKED", ttl)
        );
    }

    public void unlock(String key) {
        redisTemplate.delete(key);
    }
}
