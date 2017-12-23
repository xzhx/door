const path = require('path')
const mimeTypes = {
    'css': 'text/css',
    'gif': 'image/gif',
    'html': 'text/html',
    'jpg': 'image/jpeg',
    'js': 'text/javascript',
    'txt': 'text/plain'
}

module.exports = (filePath)=>{
    let ext = path.extname(filePath).split('.').pop().toLowerCase()

    if(!ext){
        ext = filePath
    }
    console.log(ext)
    console.log(mimeTypes[ext])
    return mimeTypes[ext] || mimeTypes['txt']
}