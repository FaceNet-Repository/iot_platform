package org.thingsboard.server.cache;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Component;

@Component
public class OAuth2TokenCache {

    private final Cache<String, String> tokenCache;

    public OAuth2TokenCache() {
        this.tokenCache = Caffeine.newBuilder().build();
    }

    private String generateKey(String email, String nonce) {
        return email + ":" + nonce;
    }

    public void saveToken(String email, String nonce, String idToken) {
        String key = generateKey(email, nonce);
        tokenCache.put(key, idToken);
    }

    public String getToken(String email, String nonce) {
        String key = generateKey(email, nonce);
        return tokenCache.getIfPresent(key);
    }

    public void removeToken(String email, String nonce) {
        String key = generateKey(email, nonce);
        tokenCache.invalidate(key);
    }
}
