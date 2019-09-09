custom-launcher

![image-1](/images/image-1.png)
![image-2](/images/image-2.png)
![image-2](/images/image-3.png)

## Installation


1. download [/build/custom-launcher.zip](/build/custom-launcher.zip) 
2. copy in sdcard/downloads/ on your phone 
3. installl the app with the GerdaOs Installer App.
4. Put on your sd card a file with the name custom-launcher.json with the following structure:

```
[
	{"app_name":"Telegram"},
	{"app_name":"Audio"},
	{"app_name":"Gallery"},
	{"app_name":"osm-map"},
	{"app_name":"sms-templater"},
	{"app_name":"Note"},
	{"app_name":"shellCMD"},
	{"app_name":"Calendar"},
	{"app_name":"rss-reader"},
	{
		"weather":
		{
			"owm_api_key":"6d385ac2ee574b079ea964532d681348",
		
			"location":
			{
				"singapore":
				{
					"position_lat":"1.290270",
					"position_long":"103.851959"

				},
				"prag":
				{
					"position_lat":"50.073658",
					"position_long":"14.418540"

				}
			}

		}
	}
]

```
5. if you want the weather forecast feature get your own api key from [openweathermap.org](openweathermap.org) and put the api-key in "owm_api_key"

## How to use

+ Navigation up/right/down/left
+ Start apps or toggle options enter
+ on the app page press 0 to show all apps



## To do

Calendar Page: List next coming events