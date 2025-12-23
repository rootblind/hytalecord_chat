package com.hytalecord.mockup_server.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.hytalecord.mockup_server.DTO.DiscordDataResponse;

@Service
public class DiscordBotAPI {
    private final RestClient restClient;

    @Value("${bot.api.uri}")
    private String discord_uri;

    @Value("${api.secret}")
    private String secret;

    public DiscordBotAPI(RestClient restClient) {
        this.restClient = restClient;
    }

    public void postMessage(DiscordDataResponse body) {
        restClient.post()
            .uri(discord_uri)
            .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
            .header("X-Guild-Id", "947393690484219984")
            .body(body)
            .retrieve()
            .toBodilessEntity();
    }
}
