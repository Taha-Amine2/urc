import { db } from '@vercel/postgres';
import { Redis } from '@upstash/redis';
import { arrayBufferToBase64, stringToArrayBuffer } from "../lib/base64";



const redis = Redis.fromEnv();

export default async function handler(request) {
    try {
        const { username, password } = await request.json();
        const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
        const hashed64 = arrayBufferToBase64(hash);

        const client = await db.connect();
        const { rowCount, rows } = await client.sql`select * from users where username = ${username} and password = ${hashed64}`;
        if (rowCount !== 1) {
            const error = { code: "UNAUTHORIZED", message: "Identifiant ou mot de passe incorrect" };
            return new Response(JSON.stringify(error), {
                status: 401,
                headers: { 'content-type': 'application/json' },
            });
        } else {
            await client.sql`update users set last_login = now() where user_id = ${rows[0].user_id}`;

            // Generate UUID token and the current timestamp
            const token = crypto.randomUUID().toString();
            const issuedAt = Math.floor(Date.now() / 1000);  // Current time in seconds

            // Save the token and issuedAt timestamp in Redis
            const user = { id: rows[0].user_id, username: rows[0].username, email: rows[0].email, externalId: rows[0].external_id, issuedAt: issuedAt };
            await redis.set(token, user, { ex: 60 * 60 });  // Expires in 1 hour

            const userInfo = {};
            userInfo[user.id] = user;
            await redis.hset("users", userInfo);

            return new Response(JSON.stringify({
                token: token,
                username: username,
                externalId: rows[0].external_id,
                id: rows[0].user_id,
                issuedAt: issuedAt  // Include issuedAt in the response
            }), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        }
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify(error), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
