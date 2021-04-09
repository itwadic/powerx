/* 
    Global sound methods
*/

async function playSound(key) {
    var audio

    if( key == 'SUCCESS') {
        audio = new Audio(require('src/assets/success.ogg')).play()        
    } else if (key == 'FAIL') {
        audio = new Audio(require('src/assets/fail.ogg')).play()
    }

    audio = null
}


export default {
    playSound
}