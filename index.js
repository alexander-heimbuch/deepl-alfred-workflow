const workflow = require('./workflow')
const { input, output, error } = require('alfy')
const toLanguage = process.env.TARGET_LANGUAGE || 'EN'

workflow(toLanguage, input, output, error)
