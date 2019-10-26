
$(document).ready(function() 
 {


	//Global Vars
	var windowOpen = false;
	var i = 0;
	var z = -1;
	var finderNav_tabindex = -1;
	var app_list_filter_arr = [];
	var app_shortcut_arr = [];
	var list_all = false;
	var debug = true;
	var page = 0;
	var pos_focus = 0
	var locations = [];
	var dir_level = 0;



	var current_lng;
	var current_lat;
	var openweather_api ="";

	var items = "";

	var airplane_mode = true;

	var pages_arr = [];


	var startTime;
	var duration_h = 0;
	var duration_m = 0;
	var sleepModeState;




$("div#window-status").text(windowOpen);




//execute weather function once 
	var once_exec = (function() {
	    var executed = false;
	    return function() {
	        if (!executed) {
	            executed = true;
	            weather("geolocation")
	        }
	    };
	})();

////////////////////
//NOTFICATION//////
//////////////////



function notify(param_title,param_text,param_silent) {

	  var options = {
      body: param_text,
      silent: param_silent
  }
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
     var notification = new Notification(param_title,options);

  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(param_title,options);


      }
    });
  }

}

/////////////////
////Sleep Mode///
////////////////
function sleep()
{
	//init local storage item
	sleepModeState = localStorage.getItem("sleepMode")
	if(sleepModeState === null)
	{
		localStorage.setItem("sleepMode","false")
		sleepModeState = localStorage.getItem("sleepMode","false")
	}

	
	function remove_alarms()
	{
		var request = navigator.mozAlarms.getAll();

		request.onsuccess = function () 
		{
			

		  this.result.forEach(function (alarm) {
		  	
		  	navigator.mozAlarms.remove(alarm.id);
		  	$('div.alarms div.time').empty();

		  	
		  });
		  console.log('operation successful:' + this.result.length + 'alarms pending');
		};

		request.onerror = function () 
		{ 
		  console.log("An error occurred: " + this.error.name);
		};
	}




	function getAlarms()
	{
		var request = navigator.mozAlarms.getAll();
		request.onsuccess = function () 
		{
			//$('div.alarms div.time').append("<div class='grid-col-6'>"+this.result.length+"</div")
			this.result.forEach(function (alarm) {
				var dateFormat =  moment(alarm.date).format("dd.MM, HH:mm");
				$('div.alarms div.time').append("<div class='grid-col-100'>"+dateFormat+"</div")
				getAlarmState()
			});
		};
	}





	function set_alarm(alarm_date,message_text)
	{

		var request = navigator.mozAlarms.add(new Date(alarm_date), "honorTimezone", { "message": message_text });

		request.onsuccess = function () 
		{
			console.log(this.result)
			getAlarmState()

		}

		request.onerror = function () 
		{
		  alert('operation failed: ' + this.error);
		}
	}


	navigator.mozSetMessageHandler("alarm", function (mozAlarm) { 
		var getData = JSON.stringify(mozAlarm.data)
		if(sleepModeState == "false")
		{
			if(mozAlarm.data["message"] == "Start")
			{
				//notify("alarm","Start", true);
				airplan_strict("off");
			}
			if(mozAlarm.data["message"] == "End")
			{
				//notify("alarm","End", true);
				airplan_strict("on");
			}
		}

	});

	//get timestamp current date-time 
	var today = moment().format("YYYY-MM-DD")
	var time = startTime; 
	//var m = moment(today+"T"+time).format("DD.MM.YYYY, HH:mm:ss")
	var m = moment(today+"T"+time).valueOf()
	//set the alarm end
	var n = moment(m).add(duration_h, 'hours').add(duration_m, 'minute')


	function alarmInterval(startTime,endTime)
	{

		set_alarm(startTime,"Start",true)
		set_alarm(endTime,"End",true)
		

	}

	//remove all alarms
	remove_alarms();
	//check if user paused the alarms
	getAlarmState();


	setTimeout(
	function() 
	{
		alarmInterval(m,n)
		getAlarms()


	}, 3000);





}


function getAlarmState()
{
	sleepModeState = localStorage.getItem("sleepMode")
	if(sleepModeState == "true")
	{
		$('div.alarms div.time div').css("opacity","0.5")
		$('div.alarms div.time div').css("font-style","italic")
	}
	if(sleepModeState == "false")
	{
		$('div.alarms div.time div').css("opacity","1")
		$('div.alarms div.time div').css("font-style","normal")

	}

}


	/////////////////////////////
	//////FINDER////////////////
	///////////////////////////



	function finder()
	{
	app_list_filter_arr.length = 0;

	var finder = new Applait.Finder({ type: "sdcard", debugMode: true });


		finder.on("empty", function (needle) 
		{
			//alert("no sdcard found, no openweathermap api-key found");
			return;
		});

		finder.search("custom-launcher.json");



		finder.on("fileFound", function (file, fileinfo, storageName) 
		{

			var reader = new FileReader()


			reader.onerror = function(event) 
					{
						alert('shit happens')
						reader.abort();
					};

					reader.onloadend = function (event) 
					{

							search_result = event.target.result
							
							//check if json valid
							var printError = function(error, explicit) {
							console.log("[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}");
							}

							try {
							   
							} catch (e) {
							    if (e instanceof SyntaxError) {
							        alert("Json file is not valid");
							        return;
							    } else {
							        
							    }

							}
									var app_list_filter = JSON.parse(search_result);
									

									$.each(app_list_filter, function(i, item) {
										if(item.dir == undefined)
										{
											app_list_filter_arr.push([item.app_name,"root"]);
										}
										else
										{
											app_list_filter_arr.push([item.app_name,item.dir]);

										}
									

									
									
										if(item.weather)
										{
											openweather_api = item.weather.owm_api_key;

										if(openweather_api == "")
										{
											$("div#weather-wrapper").remove()
										}

									

											$.each(item.weather.location, function(k, item_location) {
												locations.push([k,item_location.position_lat,item_location.position_long])
											})
										}


										if(item.sleep_mode)
										{
											startTime = item.sleep_mode.startTime;
											duration_h = item.sleep_mode.duration_h;
											duration_m = item.sleep_mode.duration_m;


											sleep()

										}
								
									});

									listApps()



					//get list of pages								
						$('.page').each(function() {
							var currentElement = $(this);
							var value = currentElement.attr('id'); 
							pages_arr.push(value)

						});


					};
					reader.readAsText(file)
				});
				$('div#finder').find('div.items[tabindex=0]').focus();

	}	


finder()





////////////////////////
//NAVIGATION
/////////////////////////



	function nav (move) {

		
		if(move == "+1")
		{
			pos_focus++



			if(pos_focus <= items.length)
			{

				$('div[tabindex='+pos_focus+']').focus()
			}	

			if( pos_focus == items.length)
			{
				pos_focus = 0;
				$('div[tabindex=0]').focus()

				  
			}


		}

		if(move == "-1")
		{
			pos_focus--
			if( pos_focus >= 0)
			{
				
				$('div[tabindex='+pos_focus+']').focus()

			}

			if(pos_focus == -1)
			{
				pos_focus = items.length-1;
				
				$('div[tabindex='+pos_focus+']').focus()

			}
		}


		if(move == "slide_right")
		{
			pos_focus = 0;
			if(page < pages_arr.length-1)
			{
				page++

				$("div.page").css("display","none");
				$("div#"+pages_arr[page]).css("display","block");



				if(pages_arr[page] == "weather-wrapper")
				{
					//execute weather() only once
					once_exec()
					//weather()
				}
				

				if(pages_arr[page] == "quick-settings")
				{
					items = document.querySelectorAll('div#quick-settings > div.items');
					$('div#quick-settings').find('div.items[tabindex=0]').focus();
					
				}

				if(pages_arr[page] == "finder")
				{
					items = document.querySelectorAll('div#app-list > div.items');
					$('div#app-list').find('div.items[tabindex=0]').focus();

				}

				if(pages_arr[page] == "weather-wrapper")
				{
					items = document.querySelectorAll('div#weather-wrapper div#weather-locations > div.items');

				}


				if(pages_arr[page] == "dev")
				{
					ble_test();

				}

			}		
		}


		if(move == "slide_left")
		{
			pos_focus = 0;
			if(page > 0)
			{
				page--

					$("div.page").css("display","none");
					$("div#"+pages_arr[page]).css("display","block");

				if(pages_arr[page] == "quick-settings")
				{
					items = document.querySelectorAll('div#quick-settings > div.items');
					$('div#quick-settings').find('div.items[tabindex=0]').focus();
				}


				if(pages_arr[page] == "finder")
				{
					items = document.querySelectorAll('div#app-list > div.items');
					$('div#app-list').find('div.items[tabindex=0]').focus();
				}

				if(pages_arr[page] == "weather-wrapper")
				{
					items = document.querySelectorAll('div#weather-wrapper div#weather-locations > div.items');

				}

				
				if(pages_arr[page] == "dev")
				{
					ble_test();

				}
			}
		}




		

	}


/////////////////////////
//LIST APPS
/////////////////////////




	var last_dir;
	var dirs = [];
	function listApps(param)
	{
		z = -1
		$("div#app-list").empty();
		var request = window.navigator.mozApps.mgmt.getAll()


		request.onsuccess = function() 
		{
			if (request.result) 
			{

				var data = request.result;
				
				//list all apps
				if (param == true)
				{
					$.each(data, function(i, item) {
					z++
				
						$("div#app-list").append('<div class="items" tabindex="0" data-url="'+z+'">'+item.manifest.name+'</div>');
					})

				}

				else
				{
					for(var k = 0; k< app_list_filter_arr.length-1; k++)
					{


						$.each(data, function(i, item)
						{


							
							if (item.manifest.name == app_list_filter_arr[k][0]) 
							{
						
									
								if(app_list_filter_arr[k][1] == "root")
								{			
									$("div#app-list").append('<div class="items" tabindex="0" data-app_name = "'+item.manifest.name+'"data-url="'+i+'">'+item.manifest.name+'</div>');
								}

								if(app_list_filter_arr[k][1] != "root")
								{
									
									if($.inArray(app_list_filter_arr[k][1], dirs) == -1)
									{
										dirs.push(app_list_filter_arr[k][1])
										$("div#app-list").append('<div class="items dir  '+app_list_filter_arr[k][1]+'" tabindex="0" data-app_name = "'+item.manifest.name+'"data-url="'+i+'"><span class="dir-name">'+app_list_filter_arr[k][1]+'</span><span class="app-name">'+item.manifest.name+'</span></div>');

									}

										//first element of dir
									else
									{
										$("div#app-list").append('<div class="items dir child-of-dir '+app_list_filter_arr[k][1]+'" tabindex="0" data-app_name = "'+item.manifest.name+'"data-url="'+i+'"><span class="dir-name">'+app_list_filter_arr[k][1]+'</span><span class="app-name">'+item.manifest.name+'</span></div>');
									}
									
								}
											
							}
							
						})
					}

				}

			items = $('div#app-list > div.items:visible');
			pos_focus = 0;
			//dir_view()
			set_tabindex()


			} 

			
			else 
			{
				alert("No apps");
			}
		};


		request.onerror = function() {
		// Display error name from the DOMError object
		alert("Error: " + request.error.name);
		};
		

	}



function set_tabindex()
{
		var items_list = $('div#finder div.items:visible');
		items = $('div#app-list > div.items:visible');
		
		for(var i =-1; i < items.length; i++)
		{
			$(items[i]).attr('tabindex',i) 
			pos_focus = 0
			$('div#finder').find('div.items[tabindex=0]').focus();
		}
}



function dir_view()
{

	for (var i = 0; i < dirs.length; i++) {
		var test = document.getElementsByClassName(dirs[i])
		$(test).addClass("child-of-dir")
		$(test).first().removeClass("child-of-dir")
	}
set_tabindex()
}



function dir_nav()
{
	if(dir_level == 1)
	{
			$("div.items").css("display","block");
			$("div.items").children('.dir-name').css('display','block')
			$("div.items").children('.app-name').css('display','none')
			$("div.child-of-dir").css("display","none");
			
			$('div#finder').find('div.items[tabindex=0]').focus();
			$('div#finder div#app-list .dir').css("border-left","4px solid silver")
			pos_focus = 0
			dir_level = 0;
			set_tabindex()

	}


}


/////DEV/////
/////////////

function ble_test()
{
var gatt = device.gatt;
if (gatt && gatt.connectionState === "connected") 
{
  gatt.readRemoteRssi()


}
else
{
	alert("not connected")
}

}




//////////////////
//LAUNCH APP
//////////////////

function launchApp()
{
	if(page == 0)
	{

		var selected_button = $(":focus")[0];
		var app_url = selected_button.getAttribute('data-url');
		//if element is a dir
		if($(selected_button).hasClass('dir') && dir_level == 0)
		{

			$("div.items").css("display","none");
			var same_class = $("*:focus").eq(0).attr('class')	
			var elems = document.getElementsByClassName(same_class);
			$(elems).children('.dir-name').css('display','none')
			$(elems).children('.app-name').css('display','block')
			$(elems).css("display","block");
			pos_focus = 0
			$('div#finder').find('div.items[tabindex=0]').focus();
			dir_level = 1;
			$('div#finder div#app-list .dir').css("border","0px solid silver")
			set_tabindex()


			return;
			
		}
		//if element is not a dir start app
		else
		{
			var request = window.navigator.mozApps.mgmt.getAll();
			request.onsuccess = function() 
			{
				if (request.result) 
				{
					request.result[app_url].launch()
					return;
				}
				
			}
		} 


	

	}
}


//////////////////
//DELETE APP
//////////////////

function delete_app()
{
	if(page == 0)
	{

		var request = window.navigator.mozApps.mgmt.getAll()
		request.onsuccess = function() {
		if (request.result) {


			var selected_button = $(":focus")[0];
			var app_url = selected_button.getAttribute('data-url');
			var app_name = selected_button.getAttribute('data-app_name');
			var delete_request= navigator.mozApps.mgmt.uninstall(request.result[app_url])


			delete_request.error = function(event)
			{
				alert("error: app not unistalled")
			};

			delete_request.onsuccess = function(event)
			{
				var text = app_name+" successfully uninstalled";
				notify("App",text)
				finder();
				setTimeout(function(){
					items = document.querySelectorAll('div#app-list > div.items');
					$('div#app-list').find('div.items[tabindex=0]').focus();
				},3000); 			
			};

			}
		}
	}
	

}




//////////////////
//SHORTCUT
//////////////////


function focus_shortcut(shortcut_number)
{
	if(page == 0)
	{
		var items = document.querySelectorAll('.items');
		var targetElement = items[shortcut_number];
		targetElement.focus();
		launchApp();
	}
}





//////////////////
//Quick-Settings
//////////////////

var selected_button;
function quick_settings_toggle()
{
	if(pages_arr[page] == "quick-settings")
	{
		selected_button = $(":focus")[0];
		var quick_settings_item = selected_button.getAttribute('data-function');

		switch (true)
		{
			case (quick_settings_item == "bluetooth"):
			bluetooth_toggle("set");
			break;

			case (quick_settings_item == "wifi"):
			wifi_toggle("set");
			break;

			case (quick_settings_item == "mobile_data"):
			data_toggle("set");
			break;


			case (quick_settings_item == "tethering"):
			tethering_toggle("set");
			break;

			case (quick_settings_item == "airplane"):
			airplane_toggle("set");
			break;

			case (quick_settings_item == "sleep"):
				sleepModeState = localStorage.getItem("sleepMode")
				
				if(sleepModeState == "true")
				{
					localStorage.setItem("sleepMode","false")
				}

				if(sleepModeState == "false")
				{
					localStorage.setItem("sleepMode","true")
				}

				getAlarmState()

			break;
		}
		
	}
}



function airplan_strict(param)
{
	if(param == "on")
	{
		var lock = navigator.mozSettings.createLock();
			var result = lock.set({
			'bluetooth.enabled': true,
			'wifi.enabled': true,
			'ril.data.enabled': true,
			'ril.radio.disabled': false	


			});

			result.onsuccess = function () 
			{
				//navigator.mozBluetooth.defaultAdapter.enable();
				$("div#quick-settings div.bluetooth").css("opacity","1")
				$("div#quick-settings div.bluetooth").css("font-style","normal")
				$("div#quick-settings div.wifi").css("opacity","1")
				$("div#quick-settings div.wifi").css("font-style","normal")
				$("div#quick-settings div.mobile-data").css("opacity","1")
				$("div#quick-settings div.mobile-data").css("font-style","normal")

			}		

			result.onerror = function () 
			{
				alert("An error occure, the settings remain unchanged");
			}
	
	}

	if(param == "off")
	{
		var lock = navigator.mozSettings.createLock();
			var result = lock.set({
			'bluetooth.enabled': false,
			'wifi.enabled': false,
			'ril.data.enabled': false,
			'ril.radio.disabled': true	


			});

			result.onsuccess = function () 
			{
				//navigator.mozBluetooth.defaultAdapter.disable();
				$("div#quick-settings div.bluetooth").css("opacity","0.5")
				$("div#quick-settings div.bluetooth").css("font-style","italic")
				$("div#quick-settings div.wifi").css("opacity","0.5")
				$("div#quick-settings div.wifi").css("font-style","italic")
				$("div#quick-settings div.mobile-data").css("opacity","0.5")
				$("div#quick-settings div.mobile-data").css("font-style","italic")

			}		

			result.onerror = function () 
			{
				alert("An error occure, the settings remain unchanged");
			}
	
	}
}


///////////////
///BLUETOOTH///////
/////////////



function bluetooth_toggle(param)
{

	var lock    = navigator.mozSettings.createLock();
	var setting = lock.get('bluetooth.enabled');



	setting.onsuccess = function () 
	{


		var callback = JSON.stringify(setting.result);


		
		if(callback == '{"bluetooth.enabled":true}')
		{
			

			if(param == "set")
			{
				var lock = navigator.mozSettings.createLock();
				var result = lock.set({
				'bluetooth.enabled': false
				});

				result.onsuccess = function () 
				{
					navigator.mozBluetooth.defaultAdapter.disable();
					$("div#quick-settings div.bluetooth").css("opacity","0.5")
					$("div#quick-settings div.bluetooth").css("font-style","italic")

			}		

				result.onerror = function () 
				{
					alert("An error occure, the settings remain unchanged");
				}

			}

			if(param == "get")
			{
				airplane_mode = false;
				$("div#quick-settings div.bluetooth").css("opacity","1")
				$("div#quick-settings div.bluetooth").css("font-style","normal")

			}



		};

		if(callback == '{"bluetooth.enabled":false}')
		{
			if(param == "set")
			{
				var lock = navigator.mozSettings.createLock();
				var result = lock.set({
				'bluetooth.enabled': true
				});

				result.onsuccess = function () 
				{

					$("div#quick-settings div.bluetooth").css("opacity","1")
					$("div#quick-settings div.bluetooth").css("font-style","normal")

					$("div#quick-settings div.airplane").css("opacity","0.5")
					$("div#quick-settings div.airplane").css("font-style","italic")
					navigator.mozBluetooth.defaultAdapter.enable();

				}

				result.onerror = function () 
				{
					alert("An error occure, the settings remain unchanged");
				}

			}

			if(param == "get")
			{
				$("div#quick-settings div.bluetooth").css("opacity","0.5")
				$("div#quick-settings div.bluetooth").css("font-style","italic")

			}
		};

	}


	setting.onerror = function () 
	{
		console.warn('An error occured: ' + setting.error);
	}


}



///////////////
///WIFI///////
/////////////

function wifi_toggle(param)
{

	var lock    = navigator.mozSettings.createLock();
	var setting = lock.get('wifi.enabled');



	setting.onsuccess = function () 
	{


		var callback = JSON.stringify(setting.result);


		
		if(callback == '{"wifi.enabled":true}')
		{

			if(param == "set")
			{
				var lock = navigator.mozSettings.createLock();
				var result = lock.set({
					'wifi.enabled': false
				});

				result.onsuccess = function () 
				{
					$("div#quick-settings div.wifi").css("opacity","0.5")
					$("div#quick-settings div.wifi").css("font-style","italic")
				}

				result.onerror = function () 
				{
					alert("An error occure, the settings remain unchanged");
				}

			}

			if(param == "get")
			{
				$("div#quick-settings div.wifi").css("opacity","1")
				$("div#quick-settings div.wifi").css("font-style","normal")
				airplane_mode = false;


			}



		};

		if(callback == '{"wifi.enabled":false}')
		{

			if(param == "set")
			{
				var lock = navigator.mozSettings.createLock();
				var result = lock.set({
				'wifi.enabled': true
				});

				result.onsuccess = function () 
				{
					$("div#quick-settings div.wifi").css("opacity","1")
					$("div#quick-settings div.wifi").css("font-style","normal")

					$("div#quick-settings div.airplane").css("opacity","0.5")
					$("div#quick-settings div.airplane").css("font-style","italic")

				}

				result.onerror = function () 
				{
					alert("An error occure, the settings remain unchanged");
				}

			}

			if(param == "get")
			{
				$("div#quick-settings div.wifi").css("opacity","0.5")
				$("div#quick-settings div.wifi").css("font-style","italic")
				airplane_mode = false;


			}
		};

	}


	setting.onerror = function () 
	{
		console.warn('An error occured: ' + setting.error);
	}


}




/////////////////////////
///DATA CONNECTION///////
////////////////////////

function data_toggle(param)
{

	var lock    = navigator.mozSettings.createLock();
	var setting = lock.get('ril.data.enabled');



	setting.onsuccess = function () 
	{



		var callback = JSON.stringify(setting.result);

		
		if(callback == '{"ril.data.enabled":true}')
		{

			if(param == "set")
			{
				var lock = navigator.mozSettings.createLock();
				var result = lock.set({
				'ril.data.enabled': false
				});

				result.onsuccess = function () 
				{
					$("div#quick-settings div.mobile-data").css("opacity","0.5")
					$("div#quick-settings div.mobile-data").css("font-style","italic")
				}

				result.onerror = function () 
				{
					alert("An error occure, the settings remain unchanged");
				}

			}

			if(param == "get")
			{
				$("div#quick-settings div.mobile-data").css("opacity","1")
				$("div#quick-settings div.mobile-data").css("font-style","normal")
				airplane_mode = false;
				airplane_toggle("get");



			}



		};

		if(callback == '{"ril.data.enabled":false}')
		{
		

			if(param == "set")
			{
				var lock = navigator.mozSettings.createLock();
				var result = lock.set({
				'ril.data.enabled': true
				});

				result.onsuccess = function () 
				{
					$("div#quick-settings div.mobile-data").css("opacity","1")
					$("div#quick-settings div.mobile-data").css("font-style","normal")
					
					$("div#quick-settings div.airplane").css("opacity","0.5")
					$("div#quick-settings div.airplane").css("font-style","italic")

				}

				result.onerror = function () 
				{
					alert("An error occure, the settings remain unchanged");
				}

			}

			if(param == "get")
			{
				$("div#quick-settings div.mobile-data").css("opacity","0.5")
				$("div#quick-settings div.mobile-data").css("font-style","italic")

			}
		};

	}


	setting.onerror = function () 
	{
		console.warn('An error occured: ' + setting.error);
	}


}



function airplane_toggle(param)
{
	if(param == "get")
	{
		if(airplane_mode == true)
		{
			$("div#quick-settings div.airplane").css("opacity","1")
			$("div#quick-settings div.airplane").css("font-style","normal")

		}
		if(airplane_mode == false)
		{
			$("div#quick-settings div.airplane").css("opacity","0.5")
			$("div#quick-settings div.airplane").css("font-style","italic")

		}

	}


	if(param == "set" && airplane_mode == false)
	{

		var lock = navigator.mozSettings.createLock();
		var result = lock.set({
		'bluetooth.enabled': false,
		'wifi.enabled': false,
		'ril.data.enabled': false,
		'ril.radio.disabled': true	

		});

		result.onsuccess = function () 
		{
			$("div#quick-settings div.bluetooth").css("opacity","0.5")
			$("div#quick-settings div.bluetooth").css("font-style","italic")

			$("div#quick-settings div.wifi").css("opacity","0.5")
			$("div#quick-settings div.wifi").css("font-style","italic")

			$("div#quick-settings div.mobile-data").css("opacity","0.5")
			$("div#quick-settings div.mobile-data").css("font-style","italic")

			$("div#quick-settings div.airplane").css("opacity","1")
			$("div#quick-settings div.airplane").css("font-style","normal")

			airplane_mode = true
		}

		result.onerror = function () 
		{
			alert("An error occure, the settings remain unchanged");
		}

	}

	if(param == "set" && airplane_mode == true)
	{


		var lock = navigator.mozSettings.createLock();
		var result = lock.set({
		'bluetooth.enabled': true,
		'wifi.enabled': true,
		'ril.data.enabled': true,
		'ril.radio.disabled': false


		});

		result.onsuccess = function () 
		{
			$("div#quick-settings div.bluetooth").css("opacity","1")
			$("div#quick-settings div.bluetooth").css("font-style","normal")

			$("div#quick-settings div.wifi").css("opacity","1")
			$("div#quick-settings div.wifi").css("font-style","normal")

			$("div#quick-settings div.mobile-data").css("opacity","1")
			$("div#quick-settings div.mobile-data").css("font-style","normal")

			$("div#quick-settings div.airplane").css("opacity","0.5")
			$("div#quick-settings div.airplane").css("font-style","italic")

			airplane_mode = false
		}

		result.onerror = function () 
		{
			alert("An error occure, the settings remain unchanged");
		}

	}

	
}




///////////////////
///TETHERING///////
//////////////////

	
function tethering_toggle(param)
{

	var lock    = navigator.mozSettings.createLock();
	var setting = lock.get('tethering.wifi.enabled');






	setting.onsuccess = function () 
	{


		var callback = JSON.stringify(setting.result);

		
		if(callback == '{"tethering.wifi.enabled":true}')
		{

			if(param == "set")
			{
				var lock = navigator.mozSettings.createLock();
				var result = lock.set({
				'tethering.wifi.enabled': false
				});

				result.onsuccess = function () 
				{
					$("div#quick-settings div.tethering").css("opacity","0.5")
					$("div#quick-settings div.tethering").css("font-style","italic")
				}

				result.onerror = function () 
				{
					alert("An error occure, the settings remain unchanged");
				}

			}

			if(param == "get")
			{
				$("div#quick-settings div.tethering").css("opacity","1")
				$("div#quick-settings div.tethering").css("font-style","normal")


			}



		};

		if(callback == '{"tethering.wifi.enabled":false}')
		{

			if(param == "set")
			{
				var lock = navigator.mozSettings.createLock();
				var setting_tethering = lock.set({
				'tethering.wifi.enabled': true
				});

				setting_tethering.onsuccess = function () 
				{

					$("div#quick-settings div.tethering").css("opacity","1");
					$("div#quick-settings div.tethering").css("font-style","normal");

					//get PWD
					var getPWD = lock.get('tethering.wifi.security.password');
					getPWD.onsuccess = function () 
					{
						var stringify_result = JSON.stringify(getPWD.result)
						var callback = JSON.parse(stringify_result)

						$("div#message-box").text(callback['tethering.wifi.security.password'])
						$("div#message-box").css("display","block")


						setTimeout(function() {
							$("div#message-box").text("");
							$("div#message-box").css("display","none");
						}, 10000);

					}

				}

				setting_tethering.onerror = function () 
				{
					alert("An error occure, the settings remain unchanged");
				}

			}

			if(param == "get")
			{
				$("div#quick-settings div.tethering").css("opacity","0.5")
				$("div#quick-settings div.tethering").css("font-style","italic")

			}
		};

	}


	setting.onerror = function () 
	{
		console.warn('An error occured: ' + setting.error);
	}


}








//get status on start
wifi_toggle("get");
bluetooth_toggle("get");
data_toggle("get");
tethering_toggle("get");






////////////////////
////GEOLOCATION/////
///////////////////

function select_location()
{
	pos_focus = 0
	$('div#weather-wrapper div#locations').find('div.items[tabindex=0]').focus();

	k = -1;
	$("div#weather-wrapper div#locations").empty();

	for(var i = 0; i < locations.length; i++)
	{
		k++;
		$("div#weather-wrapper div#locations").append("<div class='items' tabindex="+k+" data-lat="+locations[i][1]+" data-long="+locations[i][2]+">"+locations[i][0]+"</div>")
	}

	if(pages_arr[page] == "weather-wrapper")
	{
	
		$("div#weather-wrapper div#locations").css("display","block")
		$("div#weather-wrapper div#location").css("display","none")
		$("div#weather-wrapper div#locations div").first().focus();
		items = document.querySelectorAll('div#weather-wrapper div#locations > div.items');

	}
}




function choice_location()
{

	if(pages_arr[page] == "weather-wrapper")
	{

		
		var selected_button = $(":focus")[0];
		current_lng = selected_button.getAttribute('data-long');
		current_lat = selected_button.getAttribute('data-lat');
		location_name = $(selected_button).text();
		$("h1#location_name").text(location_name);


		$("div#weather-wrapper div#locations").css("display","none");
		$("div#weather-wrapper div#location").css("display","block");
		weather("notgeolocation");


	}
}


function getCityName()
{

	var request_url = "https://nominatim.openstreetmap.org/reverse?format=json&lat="+current_lat+"&lon="+current_lng+"&zoom=18&addressdetails=1";
	var jqxhr = $.getJSON(request_url, function(data) {

	}).done(function(data) {
		  $.each(data.address, function(key, val) {
if(key === "town")
{
     $("h1#location_name").text(val);
 }

      });
	})
	.fail(function() {
		alert("error")
	})
	.always(function() {
	});

}



var weather_data = [];

function weather(param)
{

	weather_data.length = 0;
	
	if(param == "geolocation")
	{
		var options = {
		enableHighAccuracy: true,
		timeout: 30000,
		maximumAge: 0
		};

		function success(pos) {
		var crd = pos.coords;



			current_lng = crd.longitude;
			current_lat = crd.latitude;
			fetch_weather_data()
			getCityName()

		}

		function error(err) {
		 alert("Position not found"+err.code+":"+err.message);
		 select_location();
		}

		navigator.geolocation.getCurrentPosition(success, error, options);
	}

	else
	{
		fetch_weather_data();
		updateChart();

	}





function fetch_weather_data()
{

var request_url = "https://api.openweathermap.org/data/2.5/forecast?lat="+current_lat+"&lon="+current_lng+"&units=metric&APPID="+openweather_api;
var jqxhr = $.getJSON(request_url, function(data) {

})
  .done(function(data) {

  var wind_dir = "";
	function direction(in_val)
	{
		var degree = data.list[in_val].wind.deg;

		switch (true)
		{
			case (degree>337.5):
			wind_dir = 'N';
			break;
			case (degree>292.5):
			wind_dir = 'N';
			break; 
			case (degree>247.5):
			wind_dir = 'W';
			break; 
			case (degree>202.5):
			wind_dir = 'SW';
			break; 
			case (degree>157.5):
			wind_dir = 'S';
			break; 
			case (degree>122.5):
			wind_dir = 'SE';
			break; 
			case (degree>67.5):
			wind_dir = 'E';
			break; 
			case (degree>22.5):
			wind_dir = 'NE';
		}

	}





	//cloning elements
	$('div#weather section').not(':first').remove();
	//$("div#weather section").first().css("display","block")



	var template = $("section#forecast-0")
	var k = 0;

	for (var i = 0; i < 20; i++) 
	{ 
		k++;
		//create elements
		template.clone()
		.attr("id","forecast-"+k)
		.appendTo('div#weather');

		//add data

		
			var date_format = moment.unix(data.list[i].dt).format("ddd DD MMM HH:mm");
			var date_format_hhmm = moment.unix(data.list[i].dt).format("HH:mm");
			var temp = Math.round(data.list[i].main.temp);
			var rain_data = 0;

			
			if(data.list[i].rain != undefined)
			{
				rain_data = data.list[i].rain["3h"];
				rain_data = Number(rain_data)
			}
			else
			{
				rain_data = 0;
			}






		direction(i)
		

		$('div#location section#forecast-'+i+' div#temp').text(Math.round(data.list[i].main.temp)+"°");
		$('div#location section#forecast-'+i+' div#wind div#wind-speed div#wind-speed-val').text(data.list[i].wind.speed);
		$('div#location section#forecast-'+i+' div#wind div#wind-dir').text(wind_dir);
		$('div#location section#forecast-'+i+' div#pressure div#pressure-val').text(Math.round(data.list[i].main.pressure));
		$('div#location section#forecast-'+i+' div.title div.forecast-time').text(date_format);
		$('div#location section#forecast-'+i+' div#icon img').attr("src","https://openweathermap.org/img/w/"+data.list[i].weather[0].icon+".png");


		 weather_data.push([date_format_hhmm,temp,rain_data])
	}

	$("div#weather-wrapper div#message").css('display','none')
	$("div#location").css('display','block')
	//$("div#weather section").first().css("display","none")



		
	//chart
 	addChart()


  })
  .fail(function() {
    //alert( "error" );
  })
  .always(function() {
    //alert( "complete" );
  });
 

}

}

var mixedChart;

 function addChart()
 {
 	
	var ctx = document.getElementById('myChart');
	var ctx = document.getElementById('myChart').getContext('2d');

	mixedChart = new Chart(ctx, {
	   type: 'line',
	  data: {
	    
	    datasets: [{
	      label: 'temp',
	      yAxisID: 'id1',
	      data: [weather_data[0][1], weather_data[1][1], weather_data[2][1], weather_data[3][1]],
	      borderColor:'rgba(255,0,0,1)'
	    }, {
	      label: 'rain',
	      yAxisID: 'id2',
	      data: [weather_data[0][2],weather_data[1][2],weather_data[2][2],weather_data[3][2]],
	      borderColor:'rgba(0,0,255,1)'
	    
	    }],
	    labels: [weather_data[0][0], weather_data[1][0], weather_data[2][0], weather_data[3][0]]
	  },
	    options: {
	        legend: {
	            display: false,
	            labels: {
	              
	                position: 'bottom'
	            }
	        },
	           
	    scales: {
	      yAxes: [{
	        id: 'id1',
	        type: 'linear',
	        position: 'left',
	      }, {
	        id: 'id2',
	        type: 'linear',
	        position: 'right',
			ticks: {
				min: 0
			}

	      }]
	    }

	  
	    }
	 
	});
 }


	//update chart
	function updateChart()
	{
		mixedChart.update();
	}






var key_time
var press_time = 0;
var longpress = false;
function func_interval()
{
	longpress = false;
	press_time = 0;
	key_time = setInterval(function() { 
				press_time++

				if(press_time > 2)
				{
				longpress = true;
				}
				if(press_time < 2)
				{
				longpress = false;
				}
			
	}, 1000);
				
	
}


	//////////////////////////
	////KEYPAD TRIGGER////////////
	/////////////////////////
function handleKeyDown(evt) 

{	

	switch (evt.key) 
	{
		case 'Enter':
			func_interval();

		break;

			case 'Backspace':
			evt.preventDefault();
			
			if(dir_level == 0)
					{
						window.close();
					}
				dir_nav();
			break; 

		

	}
}



	function handleKeyUp(evt) {
			clearInterval(key_time)

		switch (evt.key) {

		case 'Enter':
			if(longpress == false)
			{
				launchApp();
				quick_settings_toggle();
				choice_location();
				
			}

			if(longpress == true)
			{	
				delete_app();
			}
		break;

		case 'Backspace':
			evt.preventDefault();
		break; 
		
		case 'ArrowDown':
			nav("+1")
		break; 

		case 'ArrowUp':
			nav("-1")
		break; 

			case 'ArrowRight':
				nav("slide_right")
			break; 

			case 'ArrowLeft':
				nav("slide_left");

			break; 

			case 'SoftLeft':
				select_location();
			break; 

			
			case '1':
			//checkUpdate();
			focus_shortcut(0)
			break; 

			case '2':
			focus_shortcut(1)
			break; 

			break; 

			case '3':
			focus_shortcut(2)
			break; 

			case '4':
			focus_shortcut(3)
			break; 

			case '5':
			focus_shortcut(4)
			break; 

			case '6':
			focus_shortcut(5)
			break; 

			case '7':
			focus_shortcut(6)
			break; 

			case '8':
			focus_shortcut(7)
			break; 

			case '9':
			focus_shortcut(8)
			break; 

			case '0':
			listApps(true);
			break; 


		}

	};



	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);


	//////////////////////////
	////BUG OUTPUT////////////
	/////////////////////////

if(debug == true)
{
	$(window).on("error", function(evt) {

	console.log("jQuery error event:", evt);
	var e = evt.originalEvent; // get the javascript event
	console.log("original event:", e);
	if (e.message) { 
	    alert("Error:\n\t" + e.message + "\nLine:\n\t" + e.lineno + "\nFile:\n\t" + e.filename);
	} else {
	    alert("Error:\n\t" + e.type + "\nElement:\n\t" + (e.srcElement || e.target));
	}
	});

}




});

