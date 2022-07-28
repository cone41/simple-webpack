class ChangeOutPutPath {
    apply(hook) {
        hook.emitFile.tap('test 1', (ctx) => {
            console.log('-----test 1-----')
            ctx.changeOutPutPath('./dist/xixi.js')
        })
    }
}

module.exports = ChangeOutPutPath