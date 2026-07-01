package com.fooddelivery.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_MS = 60_000;

    private final ConcurrentHashMap<String, ArrayDeque<Long>> log = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return !uri.equals("/api/auth/login") && !uri.equals("/api/auth/register");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String ip = Optional.ofNullable(request.getHeader("X-Forwarded-For"))
                .map(h -> h.split(",")[0].trim())
                .orElse(request.getRemoteAddr());

        long now = System.currentTimeMillis();

        log.compute(ip, (k, times) -> {
            if (times == null) times = new ArrayDeque<>();
            while (!times.isEmpty() && now - times.peekFirst() > WINDOW_MS) times.pollFirst();
            times.addLast(now);
            return times;
        });

        if (log.get(ip).size() > MAX_REQUESTS) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Too many requests. Please try again in a minute.\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}
