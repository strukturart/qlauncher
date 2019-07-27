
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
	var debug = false;
	var page = 0;
	var pos_focus = 0


	var current_lng;
	var current_lat;
	var openweather_api ="";

	var items = "";

	var airplane_mode = true;

	var pages_arr = [];

 var client = new ClientJS();

  client.getDevice();
  client.getDeviceType();
  client.getDeviceVendor();

alert( client.getDevice()+"/"+client.getDeviceType()+"/"+client.getDeviceVendor());

	$("div#window-status").text(windowOpen);


//execute weather function once 
	var once_exec = (function() {
	    var executed = false;
	    return function() {
	        if (!executed) {
	            executed = true;
	            weather()
	        }
	    };
	})();






	/////////////////////////
	function finder()
	{


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
									app_list_filter_arr[i] = item.app_name;

									openweather_api = item.owm_api_key 


									
										if(app_list_filter_arr[i] == "list all")
										{
											list_all = true;
										}


										if(openweather_api == "")
										{
											$("div#weather-wrapper").remove()
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


	}	


finder()





////////////////////////
//NAVIGATION
/////////////////////////



	function nav (move) {
			console.log(pages_arr.length)
		
		if(move == "+1" &&  pos_focus < finderNav_tabindex)
		{
			pos_focus++

			if( pos_focus <= finderNav_tabindex)
			{
				var targetElement = items[pos_focus];
				targetElement.focus();

			}
		}

		if(move == "-1" &&   pos_focus > 0)
		{
			pos_focus--
			if( pos_focus >= 0)
			{
				var targetElement = items[ pos_focus];
				targetElement.focus();

			}
		}


		if(move == "slide_right")
		{

			if(page < pages_arr.length-1)
			{
				page++

				$("div.page").css("display","none");
				$("div#"+pages_arr[page]).css("display","block");



				if(pages_arr[page] == "weather-wrapper")
				{
					//execute weather() only once
					once_exec()
				}
				

				if(pages_arr[page] == "quick-settings")
				{
					items = document.querySelectorAll('div#quick-settings > div.items');
					$('div#quick-settings').find('div.items[tabindex=0]').focus();
					pos_focus = 0;
				}

				if(pages_arr[page] == "finder")
				{
					items = document.querySelectorAll('div#app-list > div.items');
					$('div#app-list').find('div.items[tabindex=0]').focus();
					pos_focus = 0;

				}

				
			}		
		}


		if(move == "slide_left")
		{
			if(page > 0)
			{
				page--

					$("div.page").css("display","none");
					$("div#"+pages_arr[page]).css("display","block");

				if(pages_arr[page] == "quick-settings")
				{
					items = document.querySelectorAll('div#quick-settings > div.items');
					$('div#quick-settings').find('div.items[tabindex=0]').focus();
					pos_focus = 0;
				}


				if(pages_arr[page] == "finder")
				{
					items = document.querySelectorAll('div#app-list > div.items');
					$('div#app-list').find('div.items[tabindex=0]').focus();
					pos_focus = 0;
				}

			
			}
		}




		

	}



/////////////////////////
//LIST APPS
/////////////////////////





	function listApps()
	{


		var request = window.navigator.mozApps.mgmt.getAll()


		request.onsuccess = function() 
		{
			if (request.result) 
			{

			var data = request.result;



			$.each(data, function(i, item) {
				z++




		if (list_all == true)
			{
					finderNav_tabindex++;
					$("div#app-list").append('<div class="items" tabindex="'+finderNav_tabindex+'" data-url="'+z+'">'+item.manifest.name+'</div>');
			}

			else
			{

				var valid = jQuery.inArray(item.manifest.name, app_list_filter_arr)
				if(valid != -1)
				{
					finderNav_tabindex++;
					$("div#app-list").append('<div class="items" tabindex="'+finderNav_tabindex+'" data-url="'+z+'">'+item.manifest.name+'</div>');
				}

			}


			});

			//$('div#finder').find('div.items[tabindex=0]').focus();
			items = document.querySelectorAll('div#app-list > div.items');
			$('div#finder').find('div.items[tabindex=0]').focus();
			pos_focus = 0;


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





//////////////////
//LAUNCH APP
//////////////////

function launchApp()
{
	if(page == 0)
	{

	var request = window.navigator.mozApps.mgmt.getAll()


	request.onsuccess = function() {
	if (request.result) {


	var selected_button = $(":focus")[0];
	var app_url = selected_button.getAttribute('data-url');
	request.result[app_url].launch()
	}


  } 
};




}




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

			case (quick_settings_item == "airplane"):
			airplane_toggle("set");
			break;
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
		'ril.data.enabled': false

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
		'ril.data.enabled': true

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



//get status on start
wifi_toggle("get");
bluetooth_toggle("get");
data_toggle("get");






////////////////////
////GEOLOCATION/////
///////////////////


function weather()
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

}

function error(err) {
 alert(err.code+":"+err.message);
}

navigator.geolocation.getCurrentPosition(success, error, options);


function fetch_weather_data()
{

var request_url = "https://api.openweathermap.org/data/2.5/forecast?lat="+current_lat+"&lon="+current_lng+"&units=metric&APPID="+openweather_api;
// Assign handlers immediately after making the request,
// and remember the jqxhr object for this request
var jqxhr = $.getJSON(request_url, function(data) {
  //alert( "success" );

})
  .done(function(data) {
    //alert( "second success" );

    

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
	var template = $("section#forecast-0")
	var k = -1;
	for (var i = 0; i < 20; i++) 
	{ 
		k++;
		//create elements
		template.clone()
		.attr("id","forecast-"+i)
		.appendTo('div#weather');

		//add data
		var day = moment.unix(data.list[k].dt).format("DD");
			
		if(Math.ceil(day/2) == day/2)
		{
			$('div#location section#forecast-'+k).addClass('day-style-2');
		} 
		else 
		{
			$('div#location section#forecast-'+k).addClass('day-style-1');
		}
			var date_format = moment.unix(data.list[k].dt).format("ddd DD MMM HH:mm")

		direction(i)
		

		$('div#location section#forecast-'+i+' div#temp').text(Math.round(data.list[k].main.temp)+"°");
		$('div#location section#forecast-'+i+' div#wind div#wind-speed div#wind-speed-val').text(data.list[k].wind.speed);
		$('div#location section#forecast-'+i+' div#wind div#wind-dir').text(wind_dir);
		$('div#location section#forecast-'+i+' div#pressure div#pressure-val').text(Math.round(data.list[k].main.pressure));
		$('div#location section#forecast-'+i+' div.title div.forecast-time').text(date_format);
		$('div#location section#forecast-'+i+' div#icon img').attr("src","https://openweathermap.org/img/w/"+data.list[k].weather[0].icon+".png");


		
	}

$("div#weather-wrapper div#message").css('display','none')

	$("div#location").css('display','block')


  })
  .fail(function() {
    //alert( "error" );
  })
  .always(function() {
    //alert( "complete" );
  });
 

}

 }


	//////////////////////////
	////KEYPAD TRIGGER////////////
	/////////////////////////



	function handleKeyDown(evt) {


			switch (evt.key) {


	        case 'Enter':
	        launchApp();
	        quick_settings_toggle();
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
				nav("slide_left")
			break; 

			case '1':
			focus_shortcut(0)
			break; 

			case '2':
			focus_shortcut(1)
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

		}

	};



	document.addEventListener('keydown', handleKeyDown);


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





////TO DO calendar list page



/*
if (window.indexedDB) {
	  //alert("IndexedDB support is there");
	}
	else {
	   alert("Indexed DB is not supported. Where are you trying to run this ? ");
	}


var db;
// Let us open our database
var DBOpenRequest = window.indexedDB.open("b2g-calendar");
$("div#debugger").append("<h1>output</h1>");
//$("div#debugger").append([DBOpenRequest]);

DBOpenRequest.onerror = function(event) {
  // Allgemeine Fehlerbehandlung, die für alle Anfragen an die Datenbank gilt. 
  alert("error")
  $("div#debugger").append("Datenbankfehler: " + event.target.errorCode);
};

DBOpenRequest.onsuccess = function(event) {
	 //$("div#debugger").append(event.target);
	   db = DBOpenRequest.result;

	    $("div#debugger").append(db.version);

$("div#debugger").append(db.objectStoreNames[0]);

	}



DBOpenRequest.onsuccess = function(event) {

	//$("div#debugger").append(DBOpenRequest.objectStoreNames);


  db = DBOpenRequest.result;   

    //$("div#debugger").append("<li>"+[db]+"</li>");

  var transaction = db.transaction(["b2g-calendar"], "readonly");
    
   //$("div#debugger").append([transaction]);
    
  var objectStore = transaction.objectStore('Calendar');
    
    //$("div#debugger").append([objectStore]);

  objectStore.openCursor().onsuccess = function(event) {
    var cursor = event.target.result;
      //$("div#debugger").append([cursor]);
      
    if(cursor) {
     //$("div#debugger").append(cursor.value)
      
      //$("div#debugger").append(cursor.primaryKey);
      cursor.continue();
    } else {
      //$("div#debugger").append('Entries all displayed.');
    }
  };

};


*/


