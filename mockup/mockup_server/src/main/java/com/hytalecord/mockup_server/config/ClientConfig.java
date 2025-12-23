package com.hytalecord.mockup_server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class ClientConfig {
    @Value("${api.secret}")
    private String secret;
    @Bean
    public RestClient restClient() {
        return RestClient.builder()
            .defaultHeader("Authorization", "Bearer " + secret)
            .build();
    }
}