import dotenv from "npm:dotenv@16.0.3"
import axios from "npm:axios@1.3.4"
import * as cron from "npm:node-cron@3.0.2"

dotenv.config()
const veloTokenAddress = '0x9560e827af36c94d2ac33a39bce1fe78631088db'
const message =`Sending Alert `
const discordWebhook = Deno.env.get("DISCORD_WEBHOOK_URL")
const targetPrice = Deno.env.get("TARGET_PRICE")
const coingeckoUrl =
  `https://api.coingecko.com/api/v3/simple/token_price/optimistic-ethereum?contract_addresses=${veloTokenAddress}&vs_currencies=usd`


async function checkPrices() {
  const priceResp = await axios.get(coingeckoUrl)
  console.log('resp', priceResp.status)
  if (priceResp.status == 200) {
    console.log('data:: ', priceResp.data)
    console.log('data', priceResp.data[veloTokenAddress])
    if (priceResp.data[veloTokenAddress]['usd']) {
      const price = Number(priceResp.data[veloTokenAddress]['usd'])
      console.log('price : ', price)
      return price
    }
  }
}

async function sendDiscordAlert(message: string, value: string | number) {
    const params = {
      message,
      avatar_url: '',
      content: `@everyone ${new Date()} => ${message} - ${value}`,
    }

    if (discordWebhook) {
      axios.post(discordWebhook, JSON.stringify(params), {
        headers: { 'Content-type': 'application/json' },
      })
    } else {
      throw new Error(`Missing Discord Webhook Url`)
    }
  }

async function sleep(sec: number) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000))
}

async function start(fnToRun, args) {
  while (true) {
    const val: any = await fnToRun.apply(null, ...(args as [any]))
    //check if alert needs to be sent
    if (val) {
      await sendDiscordAlert(message, val)
    }
    await sleep(10)
  }
}

start(checkPrices,[])
