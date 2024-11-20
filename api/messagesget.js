import { checkSession, unauthorizedResponse } from "../lib/session";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const config = {
    runtime: 'edge',  // Ensure edge runtime is configured
};

export default async function handler(request) {
    try {
        // Check if the user is authenticated
        const connected = await checkSession(request);
        if (!connected) {
            console.log("Not connected");
            return unauthorizedResponse();  // Send unauthorized response if not connected
        }

        // Extract receiver_id from URL query parameters
        const url = new URL(request.url);
        const receiver_id = url.searchParams.get("receiver_id");

        // Return an error if receiver_id is not provided
        if (!receiver_id) {
            return new Response(JSON.stringify({ error: "Receiver ID is required" }), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            });
        }

        // Redis key for fetching the message list
        const messageKey = `messages:${connected.id}:${receiver_id}`;

        // Fetch the messages for the given sender/receiver pair from Redis
        const messages = await redis.lrange(messageKey, 0, -1); // Get all messages for this sender/receiver pair

        // If there are no messages, return an empty array
        if (messages.length === 0) {
            return new Response(JSON.stringify([]), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        }

        console.log(messages)
        // Parse the messages (check if they're strings before parsing)
        const parsedMessages = messages.map((message) => {
            if (typeof message === 'string') {
                try {
                    return JSON.parse(message);  // Parse string messages
                } catch (error) {
                    console.error("Error parsing message:", error);
                    return null;  // If parsing fails, return null
                }
            } else {
                return message;  // If it's already an object, return as is
            }
        }).filter((message) => message !== null); // Remove any invalid messages

        // If there are valid messages, return them as JSON
        return new Response(JSON.stringify(parsedMessages), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });

    } catch (error) {
        // Handle any unexpected errors and log them
        console.error("Error handling the request:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
};
