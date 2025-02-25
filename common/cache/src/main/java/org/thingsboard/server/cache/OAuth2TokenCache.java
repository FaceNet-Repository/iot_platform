/**
 * Copyright © 2016-2024 The Thingsboard Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
