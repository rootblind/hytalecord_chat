package com.hytalecord.mockup_server.service;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.hytalecord.mockup_server.utils.UtilityMethods;

import java.io.IOException;

@Component
public class Authenticate implements Filter {
    @Value("${api.secret}")
    private String mySecret;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        if("/api/mockup/ping".equals(req.getRequestURI())) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = req.getHeader("Authorization");

        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().write("Missing Authorization from header");
            return;
        }

        String secret = authHeader.substring(7); // expected to be already hashed by the bot
        String mySecretHash = UtilityMethods.hashString(mySecret);
        if(!secret.equals(mySecretHash)) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().write("Unauthorized secret hash provided. Access denied.");
            return;
        }


        chain.doFilter(request, response);
    }
}
