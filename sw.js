self.addEventListener("notificationclick", event => {
    event.notification.close();
    const fallbackUrl = new URL("Homepage.html", self.registration.scope).href;
    const targetUrl = event.notification.data?.url || fallbackUrl;

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then(async windowClients => {
            for (const client of windowClients) {
                if ("navigate" in client) {
                    try {
                        await client.navigate(targetUrl);
                    } catch (error) {}
                }
                if ("focus" in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
