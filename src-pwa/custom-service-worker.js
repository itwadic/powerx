/*
 * PowerX Service Worker 
 */

 /* 
    dependencies
 */
import { precacheAndRoute } from 'workbox-precaching'
import {registerRoute} from 'workbox-routing'

/* 
    config
*/
precacheAndRoute(self.__WB_MANIFEST)

/* 
    events - push
*/
self.addEventListener('push', event => {    
    if (event.data) {
        let data = JSON.parse(event.data.text())        
        event.waitUntil(
            self.registration.showNotification(
                data.title,
                {
                    body: data.body,
                    icon: 'icons/icon-128x128.png',
                    badge: 'icons/icon-128x128.png'
                }
            )
        )
    }
})

/* 
    events - notifications
*/ 
self.addEventListener('notificationClick', event => {
    let notification = event.notification
    let action = event.action
 
    console.log('main notification clicked')
    notification.close
})

self.addEventListener('notificationclose', event => {
    console.log('notification closed.', event)
})