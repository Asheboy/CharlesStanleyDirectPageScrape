const puppeteer = require('puppeteer')
const request = require('request')
const promisify = require('util').promisify

const screenshot = 'invest.png'
const secret = process.env.SECRET;
const user = process.env.USER;
const pass = process.env.PASS;
const slackHook = process.env.SLACK_HOOK

(async () => {
    const browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage()
    await page.setViewport({
          width: 1920,
          height: 1080
        })

    await page.goto('https://www.charles-stanley-direct.co.uk/Account')
    await page.type('#login-username', user)
    await page.type('#login-password', pass)
    await Promise.all([
          page.click('[name="login-submit"]'),
          page.waitForNavigation()
        ])

    const charOne = await page.$eval('#character-1', i => i.getAttribute('data-error-message').charAt(19))
    const charTwo = await page.$eval('#character-2', i => i.getAttribute('data-error-message').charAt(19))
    const charThree = await page.$eval('#character-3', i => i.getAttribute('data-error-message').charAt(19))

    await page.type('#character-1', secret.charAt(parseInt(charOne) - 1))
    await page.type('#character-2', secret.charAt(parseInt(charTwo) - 1))
    await page.type('#character-3', secret.charAt(parseInt(charThree) - 1))
    await Promise.all([
          page.click('[name="memorable-word-submit"]'),
          page.waitForNavigation()
        ])

    await page.waitFor(() => !document.querySelector('.combined-portfolio-total').innerText.includes('£0.00'))
    await page.waitFor(2000)
    const fundValue = await page.$eval('.combined-portfolio-total', i => i.innerText.split('\n')[1])
    const response = await promisify(request)({
          url: slackHook,
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: `{"text":"Current Fund Value: ${fundValue}"}`
      })

    await page.goto('https://www.charles-stanley-direct.co.uk/My_Dashboard/My_Direct_Accounts/Combined_Portfolio')
    await page.screenshot({ path: screenshot })
    await browser.close()
    console.log('See screenshot: ' + screenshot)
})()

