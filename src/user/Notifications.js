import React, { useEffect } from 'react';
// Importing Client and TokenProvider explicitly, as they are named exports
import { Client, TokenProvider } from "@pusher/push-notifications-web";


console.log("Notifications component loaded");

const beamsClient = new Client({
    instanceId: '097db24c-140f-4e07-8caa-17dfa6d83ea3',
});

const Notifications = ({ children }) => {
    useEffect(() => {
        const initializePushNotifications = async () => {
            const token = sessionStorage.getItem('token');
const userExternalId = sessionStorage.getItem('externalId');

if (!token || !userExternalId) {
    console.error('Token or External ID is missing!');
    return; // Sortir de la fonction si les données sont manquantes
}


            const beamsTokenProvider = new TokenProvider({
                url: "/api/beams",
                headers: {
                    Authentication: "Bearer " + token,
                },
            });
            try {
                await beamsClient.start();
                await beamsClient.addDeviceInterest('global'); 
                console.log("ha lbeam token",beamsTokenProvider)
                await beamsClient.setUserId(userExternalId, beamsTokenProvider);
                const deviceId = await beamsClient.getDeviceId();
            } catch (error) {
                console.error("Erreur d'initialisation des notifications push:", error);
            }
        };

        initializePushNotifications();
    }, []);

    return (
        <>
            {children}
        </>
    );
    
};

export default Notifications;