const { getAudioUrls } = require('./helper/freeLoopsParser')

getAudioUrls('white noise').then((sounds) => {
    for (const { id, title } of sounds) {
        console.log(id, title)
    }
})
