const { translateWithAlternatives } = require('deepl-translator')

module.exports = (toLanguage, input, output, error) => {
  translateWithAlternatives(input, toLanguage)
  .then(({translationAlternatives = [], targetLanguage}) => translationAlternatives.map(item => ({
    title: item,
    arg: item,
    icon: {
      path: `icons/${targetLanguage}.png`
    }
  })))
  .then(output)
  .catch(error)
}
