package com.hytalecord.mockup_server.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hytalecord.mockup_server.DTO.MessageRequest;
import com.hytalecord.mockup_server.service.MessageService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/mockup")
public class MockupController {
    private final MessageService messageService;

    public MockupController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/send")
    public String sendMessage(@RequestBody MessageRequest entity) {
        messageService.processMessage(entity);

        return "Message sent";
    }
    
}
