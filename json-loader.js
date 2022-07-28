module.exports = function (source) {
    console.log('source', JSON.stringify(source))
    return `export default ${JSON.stringify(source)}`
}