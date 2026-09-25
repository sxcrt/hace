/* ================================================================
   STUDY VERSE — SHARED DESKTOP NOTIFICATION SERVICE WORKER
   Covers Dashboard + Calendar + Tasks + Notes + Courses + Pomodoro.
   ================================================================ */

self.addEventListener(
    "notificationclick",
    event => {

        event.notification.close();


        const fallbackUrl =
            new URL(
                "Homepage.html",
                self.registration.scope
            ).href;


        const targetUrl =
            event.notification.data?.url
            ||
            fallbackUrl;


        event.waitUntil(
            clients
                .matchAll(
                    {
                        type:
                            "window",

                        includeUncontrolled:
                            true
                    }
                )
                .then(
                    async windowClients => {

                        for (
                            const client
                            of windowClients
                        ) {

                            if (
                                "navigate"
                                in
                                client
                            ) {

                                try {

                                    await client.navigate(
                                        targetUrl
                                    );

                                } catch (error) {

                                    /* A client may reject navigation; focus it anyway. */
                                }
                            }


                            if (
                                "focus"
                                in
                                client
                            ) {

                                return client.focus();
                            }
                        }


                        if (
                            clients.openWindow
                        ) {

                            return clients.openWindow(
                                targetUrl
                            );
                        }
                    }
                )
        );
    }
);
