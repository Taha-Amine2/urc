import { PushNotifications } from '@pusher/push-notifications-server';

export default async (req, res) => {
    const { receiverExternalId, message, sender } = req.body;
    const beamsClient = new PushNotifications({
        instanceId: 'your-instance-id',
        secretKey: 'your-secret-key',
    });

    try {
        await beamsClient.publishToUsers([receiverExternalId], {
            web: {
                notification: {
                    title: sender.username,
                    body: message.content,
                    icon: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                },
                data: {
                    /* additional data if needed */
                }
            },
        });
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error sending notification:", error);
        return res.status(500).json({ error: "Notification error" });
    }
};
