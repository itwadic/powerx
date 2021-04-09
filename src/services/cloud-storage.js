import { firebaseAuth, firebaseStorage } from 'src/services/firebase'

async function uploadBlob(imageData) {
    return new Promise((resolve, reject) => {

        const newRef = 'profileImages/' + firebaseAuth.currentUser.uid + ".jpg"  // + "_" + file.name
        
        let uploadTask = firebaseStorage.ref(newRef).put(imageData)

        // let uploadTask = firebase.storage().ref().child(storageId).putString(imageData, "base64")
        uploadTask.on(
            "state_changed",
            function (snapshot) {},
            function (error) {
                reject(error)
            },
            function () {
                uploadTask.snapshot.ref
                    .getDownloadURL()
                    .then(function (downloadURL) {
                        // console.log("Uploaded a blob or file!")
                        // console.log("got downloadURL: ", downloadURL)
                        resolve(downloadURL)
                    })
            }
        )
    })
}


export default {
    uploadBlob
}