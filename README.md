# Exchange.art Sales Bot
This is a sales bot which tracks sales for a given NFT collection on [exchange.art](https://exchange.art/). This bot has Twitter and/or Discord api integration. It can be configured to Tweet recent sales data and/or post the data to a specified Discord channel.

## Initial Setup & Install
Ensure that you have the correct versions of node
```console
node -v
# v16.13.1
```

Clone the repository and install the dependencies via NPM
```console
git clone https://github.com/0XABSTRACT/Exchange-Art-Sales-Bot
cd Exchange-Art-Sales-Bot/
npm install
```

### Create a .env file to hold onto constants & Twitter/Discord API access keys
Take a look at the Exchange-Art-Sales-Bot/tempenv text file, it looks like this :

```text
COLLECTION_URL=YOUR_COLLECTION_URL
TWITTER_API_KEY=YOUR_API_KEY
TWITTER_API_KEY_SECRET=YOUR_API_KEY_SECRET
TWITTER_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
TWITTER_ACCESS_TOKEN_SECRET=YOUR_ACCESS_TOKEN_SECRET
DISCORD_TOKEN=YOUR_DISCORD_TOKEN
DISCORD_CHANNEL_ID=YOUR_DISCORD_CHANNEL_ID
```

Create a new hidden file called Exchange-Art-Sales-Bot/.env

This new .env file will follow the same format as the tempenv file but it will contain all of your unique constants, API keys, and tokens for request access.

The .env file also contains a link to the Exchange.art NFT collection url. Set the line containing COLLECTION_URL to the collection's url you wish to track.


```text
COLLECTION_URL=https://exchange.art/collections/GAIKOTSU%20DEMONS
...
```

## Setup Twitter API
### We need to setup a developer account and proper permissions to get our TWITTER_API_KEY, TWITTER_API_KEY_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET, and to send requests
In order to access the Twitter API you'll have to register for a developer account. You can do this at

[https://developer.twitter.com/en/docs/developer-portal/overview](https://developer.twitter.com/en/docs/developer-portal/overview)

Initialize an application using your Twitter developer portal. You'll need access to the v1 Twitter API, you can apply for elevated access via the developer portal

[https://developer.twitter.com/en/portal/dashboard](https://developer.twitter.com/en/portal/dashboard)

![alt text](readme_images/twitter_elevated_access.png "Elevated Access")

 You'll need Read and Write access for your application via your Twitter Dev Portal

![alt text](readme_images/rw_twitter_permission.png "RW Twitter Permissions")
