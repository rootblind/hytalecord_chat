package com.hytalecord.mockup_server.service;

import java.io.InputStream;
import java.util.Random;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.hytalecord.mockup_server.DTO.DiscordDataResponse;
import com.hytalecord.mockup_server.DTO.DummyMessages;

import jakarta.annotation.PostConstruct;
import tools.jackson.databind.ObjectMapper;

@Service
public class ScheduleDummyMessages {
    private final DiscordBotAPI discordBotAPI;
    private DummyMessages dummyMessages;
    private ObjectMapper objectMapper;
    private final Random random = new Random();

    public ScheduleDummyMessages(
        DiscordBotAPI discordBotAPI,
        ObjectMapper objectMapper
    ) {
        this.discordBotAPI = discordBotAPI;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void loadMessage() {
        try (InputStream is = getClass().getResourceAsStream("/dummy_messages.json")) {
            this.dummyMessages = objectMapper.readValue(is, DummyMessages.class);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Scheduled(fixedRate = 60_000)
    public void sendDummyMessage() {
        if(dummyMessages == null || dummyMessages.messages().isEmpty()) return;

        // picking a random object
        DiscordDataResponse randomDummy = dummyMessages
            .messages()
            .get(
                random
                    .nextInt(
                        dummyMessages
                            .messages()
                            .size()
                        )
            );
        discordBotAPI.postMessage(randomDummy);
    }
}
