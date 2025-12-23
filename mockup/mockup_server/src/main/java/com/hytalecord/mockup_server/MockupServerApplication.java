package com.hytalecord.mockup_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MockupServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(MockupServerApplication.class, args);
	}

}
