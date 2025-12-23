package com.hytalecord.mockup_server.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hytalecord.mockup_server.DTO.MessageRequest;
import com.hytalecord.mockup_server.service.MessageService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/api/mockup")
public class MockupController {
    private final MessageService messageService;

    public MockupController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendMessage(@RequestBody MessageRequest entity) {
        if(entity.message() == null || entity.message().isEmpty()) {
            return ResponseEntity.badRequest().body("Missing message");
        }
        messageService.processMessage(entity);

        return ResponseEntity.status(HttpStatus.CREATED).body("Message sent");
    }

    @GetMapping("/ping")
    public ResponseEntity<Void> ping() {
        return ResponseEntity.ok().build();
    }
    
    
}
