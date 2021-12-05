let puppeteer = require('puppeteer');
let _ = require('underscore');
let TwitterApi = require('twitter-api-v2');
let { Client, Intents } = require('discord.js');
require('dotenv').config();

// 1000 * 60 * 60 is one hour
const sleep_time = 1000*60*30 // sleep 30 min

// flags for whether to post to twitter/discord
const twitter = true
const discord = true

// headless determines whether to open a GUI chromium window
// false opens gui
// true runs "silently"
const headless = false

let twitterClient
if (twitter) {
  twitterClient = new TwitterApi.TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_KEY_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });
}

let discord_client, channel
if (discord) {
  discord_client = new Client({ intents: [Intents.FLAGS.GUILDS] });
}

// post the same message to twitter and discord,
// useful method for testing
let multi_post_discord_twitter = async (message) => {
  return new Promise(async (resolve, reject) => {

    await twitterClient.v1.tweet(message);

    discord_client = new Client({ intents: [Intents.FLAGS.GUILDS] });
    discord_client.login(process.env.DISCORD_TOKEN)

    discord_client.once('ready', () => {
      console.log('discord client is ready')
      channel = discord_client.channels.cache.get(process.env.DISCORD_CHANNEL_ID.toString());
      channel.send(message);
    });
  })
}

let get_recent_sale_data_for_collection = async (collection_url, page, browser) => {
  return new Promise(async (resolve,reject) => {

    await page.goto(collection_url);

    // wait for sales data button to render
    let selector = await page.waitForSelector('body > app-root > layout-component > mat-sidenav-container > mat-sidenav-content > view-collection-page > view-collection > div > div.max-w-5xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-4.pb-8.justify-between.items-center.bg-transparent.text-color-main-secondary.flex.flex-col.grid.grid-cols-12 > span.text-sm.mb-8.flex.flex-col.col-span-9.md\\:col-span-10 > span.grid.grid-cols-1.md\\:grid-cols-3.gap-4.mb-4 > span:nth-child(2)')

    // click on sales data button
    await page.click('body > app-root > layout-component > mat-sidenav-container > mat-sidenav-content > view-collection-page > view-collection > div > div.max-w-5xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-4.pb-8.justify-between.items-center.bg-transparent.text-color-main-secondary.flex.flex-col.grid.grid-cols-12 > span.text-sm.mb-8.flex.flex-col.col-span-9.md\\:col-span-10 > span.grid.grid-cols-1.md\\:grid-cols-3.gap-4.mb-4 > span:nth-child(2)')

    // select elements of interest, grab data
    let element = await page.$('#mat-dialog-0 > collection-sales-history-modal > div > mat-dialog-content > mat-list > mat-list-item:nth-child(2) > div > span:nth-child(3) > a > span:nth-child(2)')
    let title = await page.evaluate(el => el.textContent, element)

    element = await page.$('#mat-dialog-0 > collection-sales-history-modal > div > mat-dialog-content > mat-list > mat-list-item:nth-child(2) > div > span:nth-child(4)')
    let sale_date = await page.evaluate(el => el.textContent, element)

    element = await page.$('#mat-dialog-0 > collection-sales-history-modal > div > mat-dialog-content > mat-list > mat-list-item:nth-child(2) > div > span:nth-child(5)')
    let sale_price = await page.evaluate(el => el.textContent, element)

    element = await page.$('#mat-dialog-0 > collection-sales-history-modal > div > mat-dialog-content > mat-list > mat-list-item:nth-child(2) > div > span:nth-child(6) > a')
    let seller_address = await page.evaluate(el => el.textContent, element)

    element = await page.$('#mat-dialog-0 > collection-sales-history-modal > div > mat-dialog-content > mat-list > mat-list-item:nth-child(2) > div > span:nth-child(7) > a')
    let buyer_address = await page.evaluate(el => el.textContent, element)

    element = await page.$('#mat-dialog-0 > collection-sales-history-modal > div > mat-dialog-content > mat-list > mat-list-item:nth-child(2) > div > span:nth-child(8) > a')
    let transaction_address = await page.evaluate(el => el.textContent, element)

    resolve({
      title : title,
      sale_date : sale_date.substring(1,sale_date.length-1),
      sale_price : sale_price.substring(1,sale_price.length-1),
      seller_address : seller_address.substring(1,seller_address.length-1),
      buyer_address : buyer_address.substring(1,buyer_address.length-1),
      transaction_address : transaction_address.substring(1,transaction_address.length-1)
    })
  })
}

let new_sale_exists = async (to_compare, collection_url, page, browser) => {
  return new Promise(async (resolve,reject) => {

    await page.goto(collection_url);

    // wait for sales data button to render
    let selector = await page.waitForSelector('body > app-root > layout-component > mat-sidenav-container > mat-sidenav-content > view-collection-page > view-collection > div > div.max-w-5xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-4.pb-8.justify-between.items-center.bg-transparent.text-color-main-secondary.flex.flex-col.grid.grid-cols-12 > span.text-sm.mb-8.flex.flex-col.col-span-9.md\\:col-span-10 > span.grid.grid-cols-1.md\\:grid-cols-3.gap-4.mb-4 > span:nth-child(2)')

    // click on sales data button
    await page.click('body > app-root > layout-component > mat-sidenav-container > mat-sidenav-content > view-collection-page > view-collection > div > div.max-w-5xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-4.pb-8.justify-between.items-center.bg-transparent.text-color-main-secondary.flex.flex-col.grid.grid-cols-12 > span.text-sm.mb-8.flex.flex-col.col-span-9.md\\:col-span-10 > span.grid.grid-cols-1.md\\:grid-cols-3.gap-4.mb-4 > span:nth-child(2)')

    let element = await page.$('#mat-dialog-0 > collection-sales-history-modal > div > mat-dialog-content > mat-list > mat-list-item:nth-child(2) > div > span:nth-child(3) > a > span:nth-child(2)')
    let title = await page.evaluate(el => el.textContent, element)

    element = await page.$('#mat-dialog-0 > collection-sales-history-modal > div > mat-dialog-content > mat-list > mat-list-item:nth-child(2) > div > span:nth-child(4)')
    let sale_date = await page.evaluate(el => el.textContent, element)

    element = await page.$('#mat-dialog-0 > collection-sales-history-modal > div > mat-dialog-content > mat-list > mat-list-item:nth-child(2) > div > span:nth-child(5)')
    let sale_price = await page.evaluate(el => el.textContent, element)

    element = await page.$('#mat-dialog-0 > collection-sales-history-modal > div > mat-dialog-content > mat-list > mat-list-item:nth-child(2) > div > span:nth-child(6) > a')
    let seller_address = await page.evaluate(el => el.textContent, element)

    element = await page.$('#mat-dialog-0 > collection-sales-history-modal > div > mat-dialog-content > mat-list > mat-list-item:nth-child(2) > div > span:nth-child(7) > a')
    let buyer_address = await page.evaluate(el => el.textContent, element)

    element = await page.$('#mat-dialog-0 > collection-sales-history-modal > div > mat-dialog-content > mat-list > mat-list-item:nth-child(2) > div > span:nth-child(8) > a')
    let transaction_address = await page.evaluate(el => el.textContent, element)

    let recent_data = {
      title : title,
      sale_date : sale_date.slice(1,sale_date.length-1),
      sale_price : sale_price.slice(1,sale_price.length-1),
      seller_address : seller_address.slice(1,seller_address.length-1),
      buyer_address : buyer_address.slice(1,buyer_address.length-1),
      transaction_address : transaction_address.slice(1,transaction_address.length-1)
    }

    if (_.isEqual(to_compare, recent_data)) {
      resolve(false)
    } else {
      resolve(true)
    }
  })
}

let get_sales_json_array = async (collection_url, page, browser) => {
  return new Promise(async (resolve, reject) => {
    await page.goto(collection_url);

    // wait for sales data button to render
    let selector = await page.waitForSelector('body > app-root > layout-component > mat-sidenav-container > mat-sidenav-content > view-collection-page > view-collection > div > div.max-w-5xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-4.pb-8.justify-between.items-center.bg-transparent.text-color-main-secondary.flex.flex-col.grid.grid-cols-12 > span.text-sm.mb-8.flex.flex-col.col-span-9.md\\:col-span-10 > span.grid.grid-cols-1.md\\:grid-cols-3.gap-4.mb-4 > span:nth-child(2)')

    // click on sales data button
    await page.click('body > app-root > layout-component > mat-sidenav-container > mat-sidenav-content > view-collection-page > view-collection > div > div.max-w-5xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-4.pb-8.justify-between.items-center.bg-transparent.text-color-main-secondary.flex.flex-col.grid.grid-cols-12 > span.text-sm.mb-8.flex.flex-col.col-span-9.md\\:col-span-10 > span.grid.grid-cols-1.md\\:grid-cols-3.gap-4.mb-4 > span:nth-child(2)')

    let element = await page.$('#mat-dialog-0 > collection-sales-history-modal > div > mat-dialog-content > mat-list')

    let sales_data_json_array = await page.evaluate(async () => {

      let sleep = async (t) => {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, t)
        })
      }
      // sleep for 5 seconds
      await sleep(5000)

      let array_of_sales_data = document.querySelector('#mat-dialog-0 > collection-sales-history-modal > div > mat-dialog-content > mat-list').innerText.split(/\r?\n/)

      let sub_array_of_sales_data = array_of_sales_data.slice(5,array_of_sales_data.length)

      // init array to store each json of sales data
      let sales_data_json_array = []

      // each sales data item has title, sales date, sale price, seller address
      // buyer address, and transaction address
      // render plaintext to json
      for (let i = 0; i < sub_array_of_sales_data.length;i+=6) {
        let title = sub_array_of_sales_data[i]
        let sale_date = sub_array_of_sales_data[i+1]
        let sale_price = sub_array_of_sales_data[i+2]
        let seller_address = sub_array_of_sales_data[i+3]
        let buyer_address = sub_array_of_sales_data[i+4]
        let transaction_address = sub_array_of_sales_data[i+5]
        let data_item = {
          title : title,
          sale_date : sale_date,
          sale_price : sale_price,
          seller_address : seller_address,
          buyer_address : buyer_address,
          transaction_address : transaction_address
        }
        sales_data_json_array.push(data_item)
      }
      return sales_data_json_array
    })
    resolve(sales_data_json_array)
  })
}


// take a recent sale, and the whole sales history
// return the index of the
let get_index_of_last_sale = async (sales_json_array, recent_data) => {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < sales_json_array.length; i++) {
      if (recent_data['title']==sales_json_array[i]['title'] && recent_data['sale_date']==sales_json_array[i]['sale_date'] && recent_data['sale_price']==sales_json_array[i]['sale_price']) {
        // this is the index of the matching element
        resolve(i)
      }
    }
  })
}

// sleep for specified time
// param t is time
let sleep = async (t) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, t)
  })
}

let main = async () => {

  let collection_url = process.env.COLLECTION_URL

  // init browser
  const browser = await puppeteer.launch({headless: headless});
  // init page
  const page = await browser.newPage();

  // get recent sales data for collection
  let recent_data = await get_recent_sale_data_for_collection(collection_url, page, browser)

  console.log('initially sleeping for a bit\n')
  await sleep(3000) // sleep for a 3 seconds
  while (true) {
    console.log('woke up, checking if new sale exists...')
    let vnew_sale_exists = await new_sale_exists(recent_data, collection_url, page, browser)
    if (vnew_sale_exists) {
      console.log('new sale(s) exist, getting list of new sales...')
      // new sale exists, get list of sales
      let sales_json_array = await get_sales_json_array(collection_url, page, browser)
      let index_of_previous_sale = await get_index_of_last_sale(sales_json_array, recent_data)
      let list_of_new_sales = sales_json_array.slice(0, index_of_previous_sale)
      // this is where we iterate over the list of new sales and tweet each item
      console.log('list of new sales', list_of_new_sales)
      // iterate the list of new sales, tweet each one
      for (let i = 0; i < list_of_new_sales.length;i++) {

        // tweet here
        if (twitter) {
          console.log('attempting to post to twitter')
          try {
            await twitterClient.v1.tweet(JSON.stringify(list_of_new_sales[i].stringify()));
          } catch (e) {
            console.log(e)
          }
        }

        // post to discord
        // ensure that you've setup a discord bot, the bot has message permission
        // ensure the bot is present in the server you wish to post to
        // ensure the bot has permission to message in the specified channel
        if (discord) {
          // login to discord
          discord_client.login(process.env.DISCORD_TOKEN)
          // once client is ready to post...
          discord_client.once('ready', () => {
            console.log('attempting to post to discord')
            try {
              channel = discord_client.channels.cache.get(process.env.DISCORD_CHANNEL_ID.toString());
              channel.send(JSON.stringify(list_of_new_sales[i]));
            } catch (e) {
              console.log(e)
            }
          });
        }
      }
      recent_data = await get_recent_sale_data_for_collection(collection_url, page, browser)
    } else {
      console.log('no new sale exists...')
    }
    console.log('sleeping for a bit\n')
    await sleep(sleep_time) // sleep for a minute
  }
}

main()
