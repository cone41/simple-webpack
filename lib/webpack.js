const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')         //返回 ast 抽象语法树
const traverse = require('@babel/traverse').default    // @babel/traverse   提取抽象语法树里面的节点信息
const { transformFromAst } = require('@babel/core')
class Webpack {
   constructor(options) {
      const { entry, output } = options
      this.entry = entry;
      this.output = output
      this.modules = []



   }
   // 初始执行函数
   run() {
      // 分析入口模块的内容
      const info = this.parse(this.entry)
      this.modules.push(info)
      // 递归遍历，并将对象 push 进 this.modules
      this.modules.forEach(module => {
         const { dependencies } = module
         Object.values(dependencies).map(item => {
            this.modules.push(this.parse(item))
         })
      })

      const obj = {}
      console.log(this.modules);
      // 将this.modules转换成对象，key 为item.entryFile路径
      this.modules.forEach(item => {
         obj[item.entryFile] = item
      })

      console.log(obj);
      // 生成 bundle
      this.generateFile(obj)
   }

   // 解析文件
   parse(entryFile) {
      const content = fs.readFileSync(entryFile, 'utf-8')
      // 使用 parser 分析内容，返回 ast 抽象语法树
      const ast = parser.parse(content, {
         sourceType: 'module'
      })
      const dependencies = {}
      traverse(ast, {
         ImportDeclaration({ node }) {
            // node.source.value   == > ./a
            const filePath = './' + path.join(path.dirname(entryFile), node.source.value)
            dependencies[node.source.value] = filePath
         }
      })

      // 解析抽象语法树，拿到 code
      const { code } = transformFromAst(ast, null, {
         presets: ['@babel/preset-env']
      })
      // console.log(dependencies);
      // console.log(code);

      return {
         entryFile,
         dependencies,
         code
      }

   }

   // 生成 bundle
   generateFile(code) {
      const bundlePath = path.resolve(this.output.path, this.output.filename)
      console.log(bundlePath);
      const newCode = JSON.stringify(code)
      const bundle = `(function(graph){
         function require(entry){
            function customRequire(path){
               return require(graph[entry].dependencies[path])
            }
            var exports = {};
            (function(require,exports,code){
               eval(code)
            })(customRequire,exports,graph[entry].code)
            return exports;
         }
         require('${this.entry}')
      })(${newCode})`

      // 写入文件
      fs.writeFileSync(bundlePath, bundle, 'utf-8')

   }
}

module.exports = Webpack