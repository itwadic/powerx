/* 
    dependencies
*/ 
const express = require('express') 
const admin = require('firebase-admin')
let webpush = require('web-push')

/* 
    config - express
*/ 
const app = express() 


/*
    config - firebase
*/ 
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "powerx-df94e.appspot.com"
});

const db = admin.firestore();
let bucket = admin.storage().bucket();

/*
    config - webpush
*/ 
webpush.setVapidDetails(
    'mailto:info@powerx.app',
    'BEasyhN92tM-ukjUS71uhsfTT1hyAlWFzfa2Qto7PA98kyQKJPSPhXnxt5lLPZwWBQ1mvQKNYJJY6McuOWuF6XU', // public key
    '54x2mliksUWBTGrP7FFdMByxaGINDICtEYOmVrU6oGY' // private key
)

/*
    endpoint - tasks
*/
app.get('/tasks', (request, response) => {    
    response.set('Access-Control-Allow-Origin', '*')
    // let tasks = [
    //     {
    //         title: 'test', 
    //         date: Date.now()            
    //     },
    //     {
    //         title: 'test2', 
    //         date: Date.now()            
    //     }
    // ]
    // let tasks = []
    // db.collection('tasks').where('createdBy', '==', 'zHrf01cjRmdtDCTUjZ9vtCd8Szp2').get().then(snapshot => {
    //     snapshot.forEach((doc) => {          
    //         tasks.push(doc.data())
    //     })
    //     response.send(tasks)
    // })     
    
})

/*
    endpoint - tasks
*/
app.post('/addTask', (request, response) => {    
    response.set('Access-Control-Allow-Origin', '*')    
    sendPushNotification(request)
})

app.post('/editTask', (request, response) => {    
    response.set('Access-Control-Allow-Origin', '*')    
    sendPushNotification(request)
})

app.post('/completeTask', (request, response) => {
    response.set('Access-Control-Allow-Origin', '*')    
    sendPushNotification(request)
})

app.post('/restoreTask', (request, response) => {
    response.set('Access-Control-Allow-Origin', '*')    
    sendPushNotification(request)
})

function sendPushNotification(request) {    
    let subscriptions = []
    let connections = request.connections
    let data = request.query.data

    let connList = []
    connections.forEach(conn => {
        connList.push
    })
    
    db.collection('subscriptions').where('user', '==', data.entry.actorId).get().then(snapshot => {
        snapshot.forEach((doc) => {             
            subscriptions.push(doc.data())
        })
        return subscriptions
    }).then(subscriptions => {
        subscriptions.forEach(subscription => {
            const pushSubscription = {
                endpoint: subscription.endpoint,
                keys: {
                    auth: subscription.keys.auth,
                    p256dh: subscription.keys.p256dh
                }
            }
            
            let pushContent = {
                title: 'Task complete!',
                body: `${ data.actorName } ${ data.logMessage }`
            }
            let pushContentStringified = JSON.stringify(pushContent)
            
            webpush.sendNotification(pushSubscription, pushContentStringified).then(
                console.log('then')
            ).catch(err => {
                console.log(err)
            })
        })
    }) 
}

 
/*
    endpoint - createSubscription
*/
app.post('/createSubscription', (request, response) => {    
    response.set('Access-Control-Allow-Origin', '*')    
    
    db.collection('subscriptions').add(request.query).then(docRef => {
        
        response.send({
            message: 'Subscription added',
            postData: request.query
        })
    })
}) 

/* 
    listen
*/
app.listen(process.env.PORT || 3000, () => {
    console.log(`PowerX listening @ port ${ process.env.PORT || 3000 }`)
})
