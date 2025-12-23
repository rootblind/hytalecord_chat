package com.hytalecord.mockup_server.DTO;

public record MessageBodyObject(
    String content,
    String username,
    String timestamp
) {}