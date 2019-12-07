custom-launcher

![image-1](/images/image-1.png)
![image-2](/images/image-2.png)
![image-3](/images/image-3.png)
![image-4](/images/image-4.png)
![image-5](/images/image-5.png)



## Features

- Start apps
- enable/disaple bluetooth,wifi,mobile-data,tethering, airplain
- sleep mode
- weather forecast

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
	{"app_name":"rss-reader"},
	{"app_name":"osm-map", "dir":"outdoor"},
	{"app_name":"knots", "dir":"outdoor"},
	{"app_name":"shellCMD", "dir":"tools"},
	{"app_name":"Note", "dir":"tools"},
	{"app_name":"Calendar"},

	{
		"sleep_mode":
		{
			"startTime":"22:40",
			"duration_h":"8",
			"duration_m":"0"
		}
	},

	{
		"weather":
		{
			"owm_api_key":"6d385b079ea964532d681348",
		
			"location":
			{
				"brüssel":
				{
					"position_lat":" 50.846557",
					"position_long":"4.3516970"

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

5. you can also nest the apps in folders, "you": "myDir". They have to be put in order DirA, DirA, DirB, DirB as in my example.
6. if you want the weather forecast feature get your own api key from [openweathermap.org](openweathermap.org) and put the api-key in "owm_api_key". You can set your default locations. Press soft-left to select your location.

## How to use

+ Navigation up/right/down/left
+ Start apps or toggle options enter
+ on the app page press 0 to show all apps
+ sleep mode pause: select the time and press enter



## To do

Calendar Page: List next coming events

## Dependencies

https://jquery.com/
https://www.chartjs.org/


## Donation

You like the app and you have enough money

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=Q8QLA8CNMWAWG)


