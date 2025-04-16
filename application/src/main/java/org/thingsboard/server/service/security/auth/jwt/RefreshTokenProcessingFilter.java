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
package org.thingsboard.server.service.security.auth.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.thingsboard.common.util.JacksonUtil;
import org.thingsboard.server.common.data.StringUtils;
import org.thingsboard.server.service.security.auth.RefreshAuthenticationToken;
import org.thingsboard.server.service.security.exception.AuthMethodNotSupportedException;
import org.thingsboard.server.service.security.model.SecurityUser;
import org.thingsboard.server.service.security.model.token.JwtTokenFactory;
import org.thingsboard.server.service.security.model.token.RawAccessJwtToken;

import java.io.IOException;

@Slf4j
public class RefreshTokenProcessingFilter extends AbstractAuthenticationProcessingFilter {

    private final AuthenticationSuccessHandler successHandler;
    private final AuthenticationFailureHandler failureHandler;
    private final JwtTokenFactory tokenFactory;


    public RefreshTokenProcessingFilter(String defaultProcessUrl, AuthenticationSuccessHandler successHandler,
                                        AuthenticationFailureHandler failureHandler, JwtTokenFactory tokenFactory) {
        super(defaultProcessUrl);
        this.successHandler = successHandler;
        this.failureHandler = failureHandler;
        this.tokenFactory = tokenFactory;
    }

//    @Override
//    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
//            throws AuthenticationException, IOException, ServletException {
//        if (!HttpMethod.POST.name().equals(request.getMethod())) {
//            if(log.isDebugEnabled()) {
//                log.debug("Authentication method not supported. Request method: " + request.getMethod());
//            }
//            throw new AuthMethodNotSupportedException("Authentication method not supported");
//        }
//
//        RefreshTokenRequest refreshTokenRequest;
//        try {
//            refreshTokenRequest = JacksonUtil.fromReader(request.getReader(), RefreshTokenRequest.class);
//        } catch (Exception e) {
//            throw new AuthenticationServiceException("Invalid refresh token request payload");
//        }
//
//        if (StringUtils.isBlank(refreshTokenRequest.getRefreshToken())) {
//            throw new AuthenticationServiceException("Refresh token is not provided");
//        }
//
//        RawAccessJwtToken token = new RawAccessJwtToken(refreshTokenRequest.getRefreshToken());
//
//        return this.getAuthenticationManager().authenticate(new RefreshAuthenticationToken(token));
//    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException, IOException, ServletException {

        if (!HttpMethod.POST.name().equals(request.getMethod())) {
            if (log.isDebugEnabled()) {
                log.debug("Authentication method not supported. Request method: " + request.getMethod());
            }
            throw new AuthMethodNotSupportedException("Authentication method not supported");
        }

        RefreshTokenRequest refreshTokenRequest;
        try {
            refreshTokenRequest = JacksonUtil.fromReader(request.getReader(), RefreshTokenRequest.class);
        } catch (Exception e) {
            throw new AuthenticationServiceException("Invalid refresh token request payload", e);
        }

        String refreshTokenStr = refreshTokenRequest.getRefreshToken();
        if (StringUtils.isBlank(refreshTokenStr)) {
            throw new AuthenticationServiceException("Refresh token is not provided");
        }

        RawAccessJwtToken rawToken = new RawAccessJwtToken(refreshTokenStr);

        SecurityUser parsedUser = tokenFactory.parseRefreshToken(refreshTokenStr);

        RefreshAuthenticationToken authToken = new RefreshAuthenticationToken(rawToken);
        if (parsedUser.getNonceOauth2() != null) {
            authToken.setNonce(parsedUser.getNonceOauth2());
        }
        Authentication result = this.getAuthenticationManager().authenticate(authToken);
        Object principal = result.getPrincipal();
        if (principal instanceof SecurityUser) {
            ((SecurityUser) principal).setNonceOauth2(parsedUser.getNonceOauth2());
        }
        return result;
    }
    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
                                            Authentication authResult) throws IOException, ServletException {
        successHandler.onAuthenticationSuccess(request, response, authResult);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                              AuthenticationException failed) throws IOException, ServletException {
        SecurityContextHolder.clearContext();
        failureHandler.onAuthenticationFailure(request, response, failed);
    }
}
