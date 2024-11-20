import { getConnecterUser, triggerNotConnected } from "../lib/session";
import { Redis } from "@upstash/redis";
const PushNotifications = require('@pusher/push-notifications-server');

// Initialize Redis
const redis = Redis.fromEnv();

export default async (request, response) => {
    try {
        // Get the authenticated user
        const user = await getConnecterUser(request);

        if (!user) {
            return triggerNotConnected(response);
        }

        const { receiver_id, content, receiver_type, image_url } = await request.body;

        if (!receiver_id || !content || !receiver_type) {
            return response.status(400).json({ error: "Receiver ID, content, and receiver type are required." });
        }

        // Create message object
        const message = {
            sender_id: user.id,
            sender_name: user.username,
            receiver_id: receiver_id,
            content: content,
            receiver_type: receiver_type,
            image_url: image_url,
            timestamp: new Date().toISOString(),
        };
        console.log(message)

        // Store message in Redis (using a combination of sender_id and receiver_id as the key)
        const messageKey = `messages:${user.id}:${receiver_id}`;  // Key format: messages:<sender_id>:<receiver_id>
        
        // Redis lists store the messages in order (lpush to add new messages to the front)
        await redis.lpush(messageKey, JSON.stringify(message));  

        // Initialize Pusher for Push Notifications
        const beamsClient = new PushNotifications({
            instanceId: '097db24c-140f-4e07-8caa-17dfa6d83ea3',
            secretKey: '62FAB2C7CDB32D45A008008E07BE12B6BC3BDD4FAC66DB3942594EC8280DECBD',
        });

        // Function to send push notifications
        const sendPushNotification = async (externalIds, message, sender) => {
            try {
                await beamsClient.publishToUsers(externalIds, {
                    web: {
                        notification: {
                            title: sender.username,
                            body: message.content,
                            icon: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                        },
                        data: {
                            // additional data if needed
                        },
                    },
                });
                console.log('Notification sent');
            } catch (error) {
                console.error("Error sending notification:", error);
            }
        };

        // Handle notification logic for groups or individual users
        if (receiver_type === 'group') {
            // Fetch all external_ids of users in the group (except sender)
            const allUsersResult = await redis.smembers("users:all");  // Assuming all user external_ids are stored in Redis set

            if (allUsersResult.length > 0) {
                // Remove the sender's external_id
                const externalIds = allUsersResult.filter(externalId => externalId !== user.external_id);
                await sendPushNotification(externalIds, message, user);
            }
        } else if (receiver_type === 'user') {
            // Get the receiver's external ID
            const receiverExternalId = await redis.get(`user:${receiver_id}:external_id`);
            if (receiverExternalId) {
                await sendPushNotification([receiverExternalId], message, user);
            } else {
                return response.status(404).json({ error: "Receiver not found." });
            }
        }

        // Return success response
        return response.status(200).json(message);
    } catch (error) {
        console.error("Error saving message:", error);
        return response.status(500).json({ error: "An error occurred while saving the message." });
    }
};
