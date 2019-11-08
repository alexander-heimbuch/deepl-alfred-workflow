const puppeteer = require('puppeteer-core')
const browserPaths = require('chrome-paths')
const { debounce, get } = require('lodash')
const { output, input } = require('./helper')

const deepl = {
  root: 'https://www.deepl.com/translator',
  api: 'https://www2.deepl.com/jsonrpc'
}

if (!browserPaths.chrome || !browserPaths.chromium) {
  output({
    title: 'This workflow needs an installed chrome or chromium browser',
    valid: false,
    icon: {
      "path": "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns"
    }
  })

  process.exit(1)
}

const request = (input) => new Promise(async (resolve, reject) => {
  const browser = await puppeteer.launch({ executablePath: browserPaths.chrome || browserPaths.chromium })
  const page = await browser.newPage()

  page.on('response', async response => {
    setTimeout(() => {
      reject({ error: 'timeout' })
      browser.close()
    }, 2000)

    if (response.url() !== deepl.api) {
      return
    }

    const request = JSON.parse(response.request().postData())
    const query = get(request, 'params.jobs[0].raw_en_sentence')

    if (query !== input) {
      return
    }

    const result = await response.json()
    const url = await page.evaluate('location.href')

    resolve({
      ...result,
      url
    })

    await browser.close()
  })

  await page.goto(deepl.root)
  await page.focus('[dl-test="translator-source-input"]')
  await page.keyboard.type(input, { delay: 0 })
})

const transform = response => ({
  url: get(response, 'url'),
  source: get(response, 'result.source_lang'),
  target: get(response, 'result.target_lang'),
  translations: get(response, 'result.translations[0].beams', []).map(({ postprocessed_sentence }) => postprocessed_sentence),
  error: get(response, 'error')
})

request(input).then(transform).then(({ translations, error, source, target }) => {
  if (error) {
    output([{
      title: error,
      valid: false,
      icon: {
        "path": "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns"
      }
    }])
  }

  output(translations.map(title => ({
      title,
      subtitle: `${source} → ${target}`,
      arg: title
    }))
  )
})

