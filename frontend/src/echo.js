// src/echo.js
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "reverb",
  key: "my-app-key",  // must match REVERB_APP_KEY in .env
  wsHost: "127.0.0.1", // or your Laravel server hostname
  wsPort: 8080,        // must match REVERB_PORT in .env
  forceTLS: false,
  enabledTransports: ["ws", "wss"],
});

export default echo;
