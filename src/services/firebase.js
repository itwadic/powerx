import * as firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore"
import "firebase/storage"
//import "firebase/messaging"

import firebaseConfig from "./firebase-config"

let firebaseApp = firebase.initializeApp(firebaseConfig)
let firebaseAuth = firebaseApp.auth()
let firebaseDb = firebaseApp.firestore()
let firebaseStorage = firebaseApp.storage()
//let firebaseMessaging = firebaseApp.messaging()

//firebaseMessaging.usePublicVapidKey("BAsEYOnvy0f-2frv1h-ohmgP3Qv36htM__DRMKPOu4AJYcrA-OMqZCzyCqCA8qDoQX3Dd-fCll_hk5mjxQJ1Z1Y")
// const { Timestamp, GeoPoint } = db
// export { Timestamp, GeoPoint }

//export { firebaseAuth, firebaseDb, firebaseStorage, firebaseApp, firebaseMessaging }
export { firebaseAuth, firebaseDb, firebaseStorage, firebaseApp }