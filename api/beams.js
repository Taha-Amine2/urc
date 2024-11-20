import {getConnecterUser, triggerNotConnected} from "../lib/session.js";

import PushNotifications from '@pusher/push-notifications-server';


export default async (req, res) => {
    console.log("haha")
    const userIDInQueryParam = req.query["user_id"];
    const user = await getConnecterUser(req);
    if (user === undefined || user === null || userIDInQueryParam !== user.externalId) {
        triggerNotConnected(res);
        return;
    }   
    console.log("haha")

    console.log("Using push instance : " + process.env.PUSHER_INSTANCE_ID);
    const beamsClient = new PushNotifications({
        instanceId: '097db24c-140f-4e07-8caa-17dfa6d83ea3',
        secretKey: '62FAB2C7CDB32D45A008008E07BE12B6BC3BDD4FAC66DB3942594EC8280DECBD',
    });

    const beamsToken = beamsClient.generateToken(user.externalId);
    console.log("ha lval dyalo",beamsToken)
    res.send(beamsToken);
};