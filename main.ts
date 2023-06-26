import dotenv from "https://esm.sh/dotenv@16.0.3"
import axios from "https://esm.sh/axios@1.3.4"
import * as cron from "https://esm.sh/node-cron@3.0.2"

dotenv.config()
const veloTokenAddress = '0x3c8b650257cfb5f272f799f5e2b4e65093a11a05'
const discordWebhook = Deno.env.get("DISCORD_WEBHOOK_URL")
const targetPrice = Deno.env.get("TARGET_PRICE")
const coingeckoUrl =
  'https://api.coingecko.com/api/v3/simple/token_price/optimistic-ethereum?contract_addresses=0x3c8b650257cfb5f272f799f5e2b4e65093a11a05&vs_currencies=usd'


async function checkPrices() {
  const priceResp = await axios.get(coingeckoUrl)
  console.log('resp', priceResp.status)
  if (priceResp.status == 200) {
    console.log('data', priceResp.data[veloTokenAddress])
    if (priceResp.data[veloTokenAddress]['usd']) {
      const price = Number(priceResp.data[veloTokenAddress]['usd'])
      console.log('price : ', price)
      if (price >= targetPrice) {
        console.log('Price target triggered... Sending message')
        const message = {
          token: '$VELO',
          price,
        }

        const params = {
          username: 'Alerts',
          avatar_url: '',
          content: `@everyone ${JSON.stringify(message)}`,
        }

        axios.post(discordWebhook, JSON.stringify(params), {
          headers: { 'Content-type': 'application/json' },
        })
      }
    }
  }
}

cron.schedule('* * * * *', () => {
    console.log("Invoked new job at - ", new Date())
  checkPrices()
});