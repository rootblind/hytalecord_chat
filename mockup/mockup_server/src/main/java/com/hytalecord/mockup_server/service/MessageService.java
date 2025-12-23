package com.hytalecord.mockup_server.service;

import org.springframework.stereotype.Service;

import com.hytalecord.mockup_server.DTO.MessageRequest;

@Service
public class MessageService {
    public void processMessage(MessageRequest request) {
        System.out.println(request.message());
    }
}
