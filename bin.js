const workflow = require('./workflow')
const cleanStack = require('clean-stack')
const toLanguage = process.env.TARGET_LANGUAGE || 'EN'

const input = process.argv[2]

const output = arr => {
  console.log(JSON.stringify({
    items: arr
  }, null, '\t'))
}

const error = err => {
  const stack = cleanStack(err.stack || err)

  const copy = `
\`\`\`
${stack}
\`\`\`
`.trim()

  output([{
    title: err.stack ? `${err.name}: ${err.message}` : err,
    subtitle: 'Press ⌘L to see the full error and ⌘C to copy it.',
    valid: false,
    text: {
      copy,
      largetype: stack
    },
    icon: {
      path: exports.icon.error
    }
  }])
}

workflow(toLanguage, input, output, error)
