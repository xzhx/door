const fs = require('fs')
const Handlebars = require('handlebars')
const path = require('path')
const promisify = require('util').promisify
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)
// const config = require('../config/defaultConfig')
const mime = require('./mime')

const tplPath = path.join(__dirname,'../template/dir.tpl')
const source = fs.readFileSync(tplPath)
const template = Handlebars.compile(source.toString())
const compress = require('./compress')
const range = require('./range')
const  isFresh = require('./cache')

module.exports = async function (req,res,filePath,config){
    try {
        const stats = await stat(filePath)
        if (stats.isFile()) {
            const contentType = mime(filePath)
            
            if(isFresh(stats,req,res)){
                res.statusCode = 304
                res.end()
                return
            }


            res.setHeader('Content-Type', contentType)
            let rs
            const {code,start,end} = range(stats.size,req,res)
            if (code === 200){
                res.statusCode = 200
                rs = fs.createReadStream(filePath)
            } else {
                res.statusCode = 206
                rs = fs.createReadStream(filePath,{start:start,end:end})
            }
            if(filePath.match(config.compress)){
                rs = compress(rs,req,res)
            }
            rs.pipe(res)


        } else if (stats.isDirectory()) {
            const files = await readdir(filePath)
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            const dir = path.relative(config.root,filePath)
            const data = {
                files: files,
                title: path.basename(filePath),
                dir: (req.url=='/')? '': req.url
                //dir: dir ? `/${dir}` : '',
            }
            res.end(template(data))
            
        }
    } catch(ex) {
        console.error(ex)
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/plain')
        res.end(`${filePath} is not found!`)
    }
}