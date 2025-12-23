package com.hytalecord.mockup_server.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hytalecord.mockup_server.DTO.DiscordDataResponse;
import com.hytalecord.mockup_server.service.DiscordBotAPI;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/discord")
public class DiscordController {
    private final DiscordBotAPI messageResponse;

    public DiscordController(DiscordBotAPI messageResponse) {
        this.messageResponse = messageResponse;
    }

    @PostMapping("/send")
    public ResponseEntity<String> postDiscordMessage(@RequestBody DiscordDataResponse entity) {
        if(
            entity.message() == null || 
            entity.message().content().isEmpty() || 
            entity.message().username().isEmpty()
        ) {
            return ResponseEntity.badRequest().body("Missing content");
        }
        
        messageResponse.postMessage(entity);   
        return ResponseEntity.status(HttpStatus.CREATED).body("Message sent");
    }
    
}
