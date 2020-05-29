$(document).ready(function() {


    //Global Vars
    var window_status = "";
    var i = 0;
    var app_list_filter_arr = [];
    var page = 0;
    var pos_focus = 0
    var locations = [];
    var dir_level = 0;
    var openweather_api = "";
    var items = "";
    var pages_arr = [];
    var uv_api_key = "";


    //to know how the settings was before turn on or off
    //save the data in a localStorage item


    var startTime;
    var duration_h = 0;
    var duration_m = 0;
    var sleepModeRunning
    var sleepModeState;


    var bluetoothState
    var wifiState
    var mobileDataState
    var tetheringState
    var airplaneState = "true"


    function getSettingState() {

        bluetoothState = localStorage.getItem("bluetooth")
        wifiState = localStorage.getItem("wifi")
        mobileDataState = localStorage.getItem("mobileData")
        tetheringState = localStorage.getItem("tethering")


    }

    getSettingState()




    /////////////////
    ////Sleep Mode///
    ////////////////

    function remove_alarms() {
        var request = navigator.mozAlarms.getAll();

        request.onsuccess = function() {

            this.result.forEach(function(alarm) {
                navigator.mozAlarms.remove(alarm.id);
                $('div.alarms div.time').empty();
            });
            //toaster('operation successful:' + this.result.length + 'alarms pending', 1000);
        };

        request.onerror = function() {
            toaster("An error occurred: " + this.error.name, 1000);
        };
    }


    function getAlarms() {
        var request = navigator.mozAlarms.getAll();
        request.onsuccess = function() {
            this.result.forEach(function(alarm) {
                var dateFormat = moment(alarm.date).format("DD.MM, HH:mm");
                $('div.alarms div.time').append("<div class='grid-col-100'>" + dateFormat + "</div")
            });

            if (sleepModeState == "true") {
                $('div.alarms div.time div').css("opacity", "1")
                $('div.alarms div.time div').css("font-style", "normal")
            }

            if (sleepModeState == "false") {
                $('div.alarms div.time div').css("opacity", "0.5")
                $('div.alarms div.time div').css("font-style", "italic")
            }

        };
    }

    function storeSettingsStats_alarm(param) {
        if (param == "set") {
            getSettingState()

            localStorage.setItem("sleepModeBluetooth", bluetoothState)
            localStorage.setItem("sleepModeWifi", wifiState)
            localStorage.setItem("sleepModeData", mobileDataState)


        }
        if (param == "get") {

            notify("hey", localStorage.getItem("sleepModeData"), false)

            if (localStorage.getItem("sleepModeBluetooth") == "true") {
                bluetooth_toggle("on");
            }

            if (localStorage.getItem("sleepModeWifi") == "true") {
                wifi_toggle("on");
            }

            if (localStorage.getItem("sleepModeData") == "true") {
                data_toggle("on");
            }

        }


    }



    function set_alarm(alarm_date, message_text) {
        var request = navigator.mozAlarms.add(new Date(alarm_date), "honorTimezone", { "message": message_text });
        request.onsuccess = function() {
            //toaster(this.result, 1000)
        }

        request.onerror = function() {
            toaster('operation failed: ' + this.error, 1000);
        }
    }






    function sleep() {

        getAlarms()
        sleepModeRunning = localStorage.getItem("sleepModeRunning")
        sleepModeState = localStorage.getItem("sleepMode");



        //init local storage item
        if (sleepModeState == null) {
            localStorage.setItem("sleepMode", "false");
        }

        if (sleepModeRunning == null) {
            localStorage.setItem("sleepModeRunning", "false");
        }

        navigator.mozSetMessageHandler("alarm", function(mozAlarm) {
            if (sleepModeState == "true") {
                if (mozAlarm.data["message"] == "Start") {
                    //to do
                    //store the settings state
                    storeSettingsStats_alarm("set")
                    localStorage.setItem("sleepModeRunning", "true")
                    $("div#quick-settings div#sleepMode").css("display", "block");

                    bluetooth_toggle("off");
                    wifi_toggle("off");
                    data_toggle("off");

                }
                if (mozAlarm.data["message"] == "End") {
                    //to-do
                    //turn on settings
                    storeSettingsStats_alarm("get")

                    //bluetooth_toggle("on");
                    //wifi_toggle("on");
                    //data_toggle("on");
                    localStorage.setItem("sleepModeRunning", "false")
                    $("div#quick-settings div#sleepMode").css("display", "none");
                }
            }

        });


        if (sleepModeRunning == "true") {
            $("div#quick-settings div#sleepMode").css("display", "block");
        }

        if (sleepModeRunning == "false") {
            $("div#quick-settings div#sleepMode").css("display", "none");
        }


        if (sleepModeRunning != "true") {

            //set alarm start time today or next day
            //it depends on whether the alarm time is in the future or in the past
            var today = "";
            today = moment()
            var now = moment();
            var alarmStartTime = moment(startTime, "HH:mm");

            //now < alarmStartTime ? today = moment() : today = moment().add(1, 'days');


            var today = today.format("YYYY-MM-DD");
            var time = startTime;
            var m = moment(today + "T" + time).valueOf()
                //set the alarm end
            var n = moment(m).add(duration_h, 'hours').add(duration_m, 'minute')

            function alarmInterval(startTime, endTime) {
                set_alarm(startTime, "Start", true)
                set_alarm(endTime, "End", true)
            }


            //set alarm

            //remove all alarms
            remove_alarms();
            //set alarm
            setTimeout(
                function() {
                    //set alarms
                    alarmInterval(m, n)
                    getAlarms()
                }, 3000);

        }
    }




    /////////////////////////////
    //////FINDER////////////////
    ///////////////////////////



    function finder() {
        app_list_filter_arr.length = 0;

        var finder = new Applait.Finder({ type: "sdcard", debugMode: true });


        finder.on("empty", function(needle) {
            toaster("file custom-launcher.json not found", 1000);
            return;
        });

        finder.search("custom-launcher.json");



        finder.on("fileFound", function(file, fileinfo, storageName) {

            var reader = new FileReader()


            reader.onerror = function(event) {
                toaster("can't read the file", 1000)
                reader.abort();
            };

            reader.onloadend = function(event) {

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
                    if (item.dir == undefined) {
                        app_list_filter_arr.push([item.app_name, "root"]);
                    } else {
                        app_list_filter_arr.push([item.app_name, item.dir]);

                    }




                    if (item.weather) {
                        uv_api_key = item.weather.uv_api_key;
                        openweather_api = item.weather.owm_api_key;

                        if (openweather_api == "") {
                            $("div#weather-wrapper").remove()
                        }

                        if (uv_api_key == "") {
                            $("div#uv-index").remove()
                        }



                        $.each(item.weather.location, function(k, item_location) {
                            locations.push([k, item_location.position_lat, item_location.position_long])
                        })
                    }


                    if (item.sleep_mode) {
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
        window_status = "apps";

    }


    finder()




    ////////////////////
    ////GEOLOCATION/////
    ///////////////////

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

    var current_lng;
    var current_lat;
    var current_alt;
    var openweather_api;

    function select_location() {
        window_status = "weather-location"
        bottom_bar("", "select", "close")

        pos_focus = 0
        $('div#weather-wrapper div#locations').find('div.items[tabindex=0]').focus();

        k = -1;
        $("div#weather-wrapper div#locations").empty();
        for (var i = 0; i < locations.length; i++) {
            k++;
            $("div#weather-wrapper div#locations").append("<div class='items' tabindex=" + k + " data-lat=" + locations[i][1] + " data-long=" + locations[i][2] + ">" + locations[i][0] + "</div>")
        }

        if (pages_arr[page] == "weather-wrapper") {

            $("div#weather-wrapper div#locations").css("display", "block")
            $("div#weather-wrapper div#location").css("display", "none")
            $("div#weather-wrapper div#locations div").first().focus();
            items = document.querySelectorAll('div#weather-wrapper div#locations > div.items');

        }
    }




    function choice_location() {

        if (pages_arr[page] == "weather-wrapper") {

            var selected_button = $(":focus")[0];
            current_lng = selected_button.getAttribute('data-long');
            current_lat = selected_button.getAttribute('data-lat');
            current_alt = 0;
            getUVIndex(current_lat, current_lng, current_alt, uv_api_key);

            location_name = $(selected_button).text();
            $("h1#location_name").text(location_name);
            $("div#weather-wrapper div#locations").css("display", "none");
            $("div#weather-wrapper div#location").css("display", "block");
            weather("notgeolocation");
            bottom_bar("location", "", "")
            window_status = "weather"

        }
    }


    function getCityName() {

        var request_url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + current_lat + "&lon=" + current_lng + "&zoom=18&addressdetails=1";
        var jqxhr = $.getJSON(request_url, function(data) {

            }).done(function(data) {
                $.each(data.address, function(key, val) {
                    if (key === "town") {
                        $("h1#location_name").text(val);
                    }

                });
            })
            .fail(function() {
                toaster("location name can't be loadede", 3000)
            })
            .always(function() {});

    }



    var weather_data = [];

    function weather(param) {
        weather_data.length = 0;

        if (param == "geolocation") {
            var options = {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
            };

            function success(pos) {
                var crd = pos.coords;
                current_lng = crd.longitude;
                current_lat = crd.latitude;
                current_alt = crd.altitude;

                fetch_weather_data()
                getCityName()
                getUVIndex(current_lat, current_lng, current_alt, uv_api_key);
            }

            function error(err) {
                toaster("Position not found" + err.code + ":" + err.message, 1000);
                select_location();
            }

            navigator.geolocation.getCurrentPosition(success, error, options);
        } else {
            fetch_weather_data();
            mixedChart.update();


        }


        function fetch_weather_data() {

            var request_url = "https://api.openweathermap.org/data/2.5/forecast?lat=" + current_lat + "&lon=" + current_lng + "&units=metric&APPID=" + openweather_api;
            var jqxhr = $.getJSON(request_url, function(data) {

                })
                .done(function(data) {

                    var wind_dir = "";

                    function direction(in_val) {
                        var degree = data.list[in_val].wind.deg;

                        switch (true) {
                            case (degree > 337.5):
                                wind_dir = 'N';
                                break;
                            case (degree > 292.5):
                                wind_dir = 'N';
                                break;
                            case (degree > 247.5):
                                wind_dir = 'W';
                                break;
                            case (degree > 202.5):
                                wind_dir = 'SW';
                                break;
                            case (degree > 157.5):
                                wind_dir = 'S';
                                break;
                            case (degree > 122.5):
                                wind_dir = 'SE';
                                break;
                            case (degree > 67.5):
                                wind_dir = 'E';
                                break;
                            case (degree > 22.5):
                                wind_dir = 'NE';
                        }

                    }


                    //cloning elements
                    $('div#weather section').not(':first').remove();
                    var template = $("section#forecast-0")
                    var k = 0;

                    for (var i = 0; i < 20; i++) {
                        k++;
                        //create elements
                        template.clone()
                            .attr("id", "forecast-" + k)
                            .appendTo('div#weather');

                        //add data


                        var date_format = moment.unix(data.list[i].dt).format("ddd DD MMM HH:mm");
                        var date_format_hhmm = moment.unix(data.list[i].dt).format("HH:mm");
                        var temp = Math.round(data.list[i].main.temp);
                        var rain_data = 0;


                        if (data.list[i].rain != undefined) {
                            rain_data = data.list[i].rain["3h"];
                            rain_data = Number(rain_data)
                        } else {
                            rain_data = 0;
                        }


                        direction(i)
                        $('div#location section#forecast-' + i + ' div#temp').text(Math.round(data.list[i].main.temp) + "°");
                        $('div#location section#forecast-' + i + ' div#wind div#wind-speed div#wind-speed-val').text(data.list[i].wind.speed);
                        $('div#location section#forecast-' + i + ' div#wind div#wind-dir').text(wind_dir);
                        $('div#location section#forecast-' + i + ' div#pressure div#pressure-val').text(Math.round(data.list[i].main.pressure));
                        $('div#location section#forecast-' + i + ' div.title div.forecast-time').text(date_format);
                        $('div#location section#forecast-' + i + ' div#icon img').attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");


                        weather_data.push([date_format_hhmm, temp, rain_data])
                    }

                    $("div#weather-wrapper div#message").css('display', 'none')
                    $("div#location").css('display', 'block')
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

    function addChart() {

        var ctx = document.getElementById('myChart');
        var ctx = document.getElementById('myChart').getContext('2d');

        mixedChart = new Chart(ctx, {
            type: 'line',
            data: {

                datasets: [{
                    label: 'temp',
                    yAxisID: 'id1',
                    data: [weather_data[0][1], weather_data[1][1], weather_data[2][1], weather_data[3][1]],
                    borderColor: 'rgba(255,0,0,1)'
                }, {
                    label: 'rain',
                    yAxisID: 'id2',
                    data: [weather_data[0][2], weather_data[1][2], weather_data[2][2], weather_data[3][2]],
                    borderColor: 'rgba(0,0,255,1)'

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



    ////////////////////////
    //NAVIGATION
    /////////////////////////



    function nav(move) {


        if (move == "+1") {
            pos_focus++



            if (pos_focus <= items.length) {
                $('div[tabindex=' + pos_focus + ']').focus()
            }

            if (pos_focus == items.length) {
                pos_focus = 0;
                $('div[tabindex=0]').focus()
            }


        }

        if (move == "-1") {
            pos_focus--
            if (pos_focus >= 0) {
                $('div[tabindex=' + pos_focus + ']').focus()
            }

            if (pos_focus == -1) {
                pos_focus = items.length - 1;
                $('div[tabindex=' + pos_focus + ']').focus()
            }
        }


        if (move == "slide_right") {
            pos_focus = 0;
            if (page < pages_arr.length - 1) {
                page++

                $("div.page").css("display", "none");
                $("div#" + pages_arr[page]).css("display", "block");

                if (pages_arr[page] == "quick-settings") {
                    items = document.querySelectorAll('div#quick-settings > div.items');
                    $('div#quick-settings').find('div.items[tabindex=0]').focus();
                    window_status = "quick-settings";
                }

                if (pages_arr[page] == "finder") {
                    items = document.querySelectorAll('div#app-list > div.items');
                    $('div#app-list').find('div.items[tabindex=0]').focus();
                    window_status = "apps";
                }

                if (pages_arr[page] == "weather-wrapper") {
                    items = document.querySelectorAll('div#weather-wrapper div#weather-locations > div.items');
                    once_exec()
                    bottom_bar("location", "", "")
                    window_status = "weather";
                }
            }
        }


        if (move == "slide_left") {
            pos_focus = 0;
            if (page > 0) {
                page--

                $("div.page").css("display", "none");
                $("div#" + pages_arr[page]).css("display", "block");

                if (pages_arr[page] == "quick-settings") {
                    items = document.querySelectorAll('div#quick-settings > div.items');
                    $('div#quick-settings').find('div.items[tabindex=0]').focus();
                    window_status = "quick-settings";
                }


                if (pages_arr[page] == "finder") {
                    items = document.querySelectorAll('div#app-list > div.items');
                    $('div#app-list').find('div.items[tabindex=0]').focus();
                    window_status = "apps";

                }

                if (pages_arr[page] == "weather-wrapper") {
                    items = document.querySelectorAll('div#weather-wrapper div#weather-locations > div.items');
                    bottom_bar("location", "", "")
                    window_status = "weather";
                    once_exec()
                }

            }
        }

    }


    /////////////////////////
    //LIST APPS
    /////////////////////////

    var dirs = [];

    function listApps(param) {
        z = -1
        $("div#app-list").empty();
        var request = window.navigator.mozApps.mgmt.getAll()


        request.onsuccess = function() {
            if (request.result) {

                var data = request.result;

                //list all apps
                if (param === true) {

                    $.each(data, function(i, item) {

                        $("div#app-list").append('<div class="items" tabindex="0" data-url="' + i + '">' + item.manifest.name + '</div>');
                    })

                } else {
                    for (var k = 0; k < app_list_filter_arr.length - 1; k++) {


                        $.each(data, function(i, item) {



                            if (item.manifest.name == app_list_filter_arr[k][0]) {


                                if (app_list_filter_arr[k][1] == "root") {
                                    $("div#app-list").append('<div class="items" tabindex="0" data-app_name = "' + item.manifest.name + '"data-url="' + i + '">' + item.manifest.name + '</div>');
                                }

                                if (app_list_filter_arr[k][1] != "root") {

                                    if ($.inArray(app_list_filter_arr[k][1], dirs) == -1) {
                                        dirs.push(app_list_filter_arr[k][1])
                                        $("div#app-list").append('<div class="items dir  ' + app_list_filter_arr[k][1] + '" tabindex="0" data-app_name = "' + item.manifest.name + '"data-url="' + i + '"><span class="dir-name">' + app_list_filter_arr[k][1] + '</span><span class="app-name">' + item.manifest.name + '</span></div>');

                                    }

                                    //first element of dir
                                    else {
                                        $("div#app-list").append('<div class="items dir child-of-dir ' + app_list_filter_arr[k][1] + '" tabindex="0" data-app_name = "' + item.manifest.name + '"data-url="' + i + '"><span class="dir-name">' + app_list_filter_arr[k][1] + '</span><span class="app-name">' + item.manifest.name + '</span></div>');
                                    }

                                }

                            }

                        })
                    }

                }

                items = $('div#app-list > div.items:visible');
                pos_focus = 0;
                set_tabindex()


            } else {
                toaster("No apps", 1000);
            }
        };


        request.onerror = function() {
            // Display error name from the DOMError object
            toaster("Error: " + request.error.name, 1000);
        };


    }



    function set_tabindex() {
        var items_list = $('div#finder div.items:visible');
        items = $('div#app-list > div.items:visible');

        for (var i = -1; i < items.length; i++) {
            $(items[i]).attr('tabindex', i)
            pos_focus = 0
            $('div#finder').find('div.items[tabindex=0]').focus();
        }
    }


    function dir_nav() {
        if (dir_level == 1) {
            $("div.items").css("display", "block");
            $("div.items").children('.dir-name').css('display', 'block')
            $("div.items").children('.app-name').css('display', 'none')
            $("div.child-of-dir").css("display", "none");

            $('div#finder').find('div.items[tabindex=0]').focus();
            $('div#finder div#app-list .dir').css("border-left", "4px solid silver")
            pos_focus = 0
            dir_level = 0;
            set_tabindex()
        }
    }



    //////////////////
    //LAUNCH APP
    //////////////////

    function launchApp() {
        if (page == 0) {

            var selected_button = $(":focus")[0];
            var app_url = selected_button.getAttribute('data-url');
            //if element is a dir
            if ($(selected_button).hasClass('dir') && dir_level == 0) {

                $("div.items").css("display", "none");
                var same_class = $("*:focus").eq(0).attr('class')
                var elems = document.getElementsByClassName(same_class);
                $(elems).children('.dir-name').css('display', 'none')
                $(elems).children('.app-name').css('display', 'block')
                $(elems).css("display", "block");
                pos_focus = 0
                $('div#finder').find('div.items[tabindex=0]').focus();
                dir_level = 1;
                $('div#finder div#app-list .dir').css("border", "0px solid silver")
                set_tabindex()
                return;

            }
            //if element is not a dir start app
            else {
                var request = window.navigator.mozApps.mgmt.getAll();
                request.onsuccess = function() {
                    if (request.result) {
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

    function delete_app() {
        if (page == 0) {

            var request = window.navigator.mozApps.mgmt.getAll()
            request.onsuccess = function() {
                if (request.result) {


                    var selected_button = $(":focus")[0];
                    var app_url = selected_button.getAttribute('data-url');
                    var app_name = selected_button.getAttribute('data-app_name');
                    var delete_request = navigator.mozApps.mgmt.uninstall(request.result[app_url])


                    delete_request.error = function(event) {
                        alert("error: app not unistalled")
                    };

                    delete_request.onsuccess = function(event) {
                        var text = app_name + " successfully uninstalled";
                        notify("App", text)
                        finder();
                        setTimeout(function() {
                            items = document.querySelectorAll('div#app-list > div.items');
                            $('div#app-list').find('div.items[tabindex=0]').focus();
                        }, 3000);
                    };

                }
            }
        }


    }




    //////////////////
    //SHORTCUT
    //////////////////


    function focus_shortcut(shortcut_number) {
        if (page == 0) {
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

    function quick_settings_toggle() {
        if (pages_arr[page] == "quick-settings") {
            selected_button = $(":focus")[0];
            var quick_settings_item = selected_button.getAttribute('data-function');

            switch (true) {
                case (quick_settings_item == "bluetooth"):
                    bluetooth_toggle("toggle");
                    break;

                case (quick_settings_item == "wifi"):
                    wifi_toggle("toggle");
                    break;

                case (quick_settings_item == "mobile_data"):
                    data_toggle("toggle");
                    break;


                case (quick_settings_item == "tethering"):
                    tethering_toggle("toggle");
                    break;

                case (quick_settings_item == "airplane"):
                    airplane_toggle("toggle");
                    break;

                    ///alarm on/off
                case (quick_settings_item == "sleep"):
                    sleepModeState = localStorage.getItem("sleepMode")



                    if (sleepModeState == "true") {
                        localStorage.setItem("sleepMode", "false")
                        toaster(localStorage.getItem("sleepMode"), 5000);
                        $('div.alarms div.time div').css("opacity", "0.5")
                        $('div.alarms div.time div').css("font-style", "italic")
                        return
                    }

                    if (sleepModeState == "false") {
                        localStorage.setItem("sleepMode", "true")
                        toaster(localStorage.getItem("sleepMode"), 5000);
                        $('div.alarms div.time div').css("opacity", "1")
                        $('div.alarms div.time div').css("font-style", "normal")
                    }

                    break;
            }

        }
    }




    ///////////////
    ///BLUETOOTH///////
    /////////////
    ///toggle --- toggle setting
    ///get --- to know the current state
    ///on / off ---- enable / disable strict



    function bluetooth_toggle(param) {

        //turn off
        if (param == "off") {
            var lock = navigator.mozSettings.createLock();
            var result = lock.set({
                'bluetooth.enabled': false
            });

            result.onsuccess = function() {
                navigator.mozBluetooth.defaultAdapter.disable();
                $("div#quick-settings div.bluetooth").css("opacity", "0.5")
                $("div#quick-settings div.bluetooth").css("font-style", "italic")
                localStorage.setItem("bluetooth", "false")
            }

            result.onerror = function() {
                toaster("An error occure, the settings remain unchanged", 2000);
            }
        }

        //turn on
        if (param == "on") {
            var lock = navigator.mozSettings.createLock();
            var result = lock.set({
                'bluetooth.enabled': true
            });

            result.onsuccess = function() {
                navigator.mozBluetooth.defaultAdapter.enable();
                $("div#quick-settings div.bluetooth").css("opacity", "1")
                $("div#quick-settings div.bluetooth").css("font-style", "normal")
                localStorage.setItem("bluetooth", "true")
                airplaneState = "false"
                airplane_toggle("get");
            }

            result.onerror = function() {
                toaster("An error occure, the settings remain unchanged", 2000);
            }
        }

        //get
        if (param == "get") {

            var lock = navigator.mozSettings.createLock();
            var setting = lock.get('bluetooth.enabled');

            setting.onsuccess = function() {

                var callback = JSON.stringify(setting.result);

                if (callback == '{"bluetooth.enabled":false}') {
                    $("div#quick-settings div.bluetooth").css("opacity", "0.5")
                    $("div#quick-settings div.bluetooth").css("font-style", "italic")
                    localStorage.setItem("bluetooth", "false")
                }

                if (callback == '{"bluetooth.enabled":true}') {

                    $("div#quick-settings div.bluetooth").css("opacity", "1")
                    $("div#quick-settings div.bluetooth").css("font-style", "normal")
                    localStorage.setItem("bluetooth", "true")
                    airplaneState = "false"
                }

            }

            setting.onerror = function() {
                console.warn('An error occured: ' + setting.error);
            }


        }

        //toggle
        if (param == "toggle") {

            var lock = navigator.mozSettings.createLock();
            var setting = lock.get('bluetooth.enabled');

            setting.onsuccess = function() {

                var callback = JSON.stringify(setting.result);
                if (callback == '{"bluetooth.enabled":false}') {
                    bluetooth_toggle("on");
                }

                if (callback == '{"bluetooth.enabled":true}') {
                    bluetooth_toggle("off");
                }

            }

            setting.onerror = function() {
                console.warn('An error occured: ' + setting.error);
            }
        }
    }



    ///////////////
    ///WIFI///////
    /////////////


    function wifi_toggle(param) {


        var lock = navigator.mozSettings.createLock();
        var setting = lock.get('wifi.enabled');

        setting.onsuccess = function() {
            //strict
            if (param == "on") {
                var lock = navigator.mozSettings.createLock();
                var result = lock.set({
                    'wifi.enabled': true
                });

                result.onsuccess = function() {
                    $("div#quick-settings div.wifi").css("opacity", "1")
                    $("div#quick-settings div.wifi").css("font-style", "normal")
                    localStorage.setItem("wifi", "true")
                    airplaneState = "false"
                    airplane_toggle("get");

                }

                result.onerror = function() {
                    alert("An error occure, the settings remain unchanged");
                }

            }

            if (param == "off") {
                var lock = navigator.mozSettings.createLock();
                var result = lock.set({
                    'wifi.enabled': false
                });


                result.onsuccess = function() {
                    $("div#quick-settings div.wifi").css("opacity", "0.5")
                    $("div#quick-settings div.wifi").css("font-style", "italic")
                    localStorage.setItem("wifi", "false")
                }

                result.onerror = function() {
                    alert("An error occure, the settings remain unchanged");
                }


            }



            //toogle
            var callback = JSON.stringify(setting.result);



            if (callback == '{"wifi.enabled":true}') {


                if (param == "toggle") {
                    wifi_toggle("off");

                }


                if (param == "get") {
                    $("div#quick-settings div.wifi").css("opacity", "1")
                    $("div#quick-settings div.wifi").css("font-style", "normal")
                    localStorage.setItem("wifi", "true")
                    airplaneState = "false"


                }



            };

            if (callback == '{"wifi.enabled":false}') {
                if (param == "toggle") {

                    wifi_toggle("on");

                }

                if (param == "get") {
                    $("div#quick-settings div.wifi").css("opacity", "0.5")
                    $("div#quick-settings div.wifi").css("font-style", "italic")
                    localStorage.setItem("wifi", "false")

                }


            };

        }


        setting.onerror = function() {
            console.warn('An error occured: ' + setting.error);
        }


    }





    /////////////////////////
    ///DATA CONNECTION///////
    ////////////////////////


    function data_toggle(param) {


        var lock = navigator.mozSettings.createLock();
        var setting = lock.get('ril.data.enabled');



        setting.onsuccess = function() {
            //strict
            if (param == "on") {
                var lock = navigator.mozSettings.createLock();
                var result = lock.set({
                    'ril.data.enabled': true,
                    'ril.radio.disabled': false
                });

                result.onsuccess = function() {


                    $("div#quick-settings div.mobile-data").css("opacity", "1")
                    $("div#quick-settings div.mobile-data").css("font-style", "normal")
                    localStorage.setItem("mobileData", "true")
                    airplaneState = "false"
                    airplane_toggle("get");

                }

                result.onerror = function() {
                    alert("An error occure, the settings remain unchanged");
                }

            }

            if (param == "off") {
                var lock = navigator.mozSettings.createLock();
                var result = lock.set({
                    'ril.data.enabled': false,
                    'ril.radio.disabled': true
                });


                result.onsuccess = function() {
                    $("div#quick-settings div.mobile-data").css("opacity", "0.5")
                    $("div#quick-settings div.mobile-data").css("font-style", "italic")
                    localStorage.setItem("mobileData", "false")
                }

                result.onerror = function() {
                    alert("An error occure, the settings remain unchanged");
                }


            }



            //toogle
            var callback = JSON.stringify(setting.result);



            if (callback == '{"ril.data.enabled":true}') {


                if (param == "toggle") {
                    data_toggle("off");

                }



                if (param == "get") {
                    $("div#quick-settings div.mobile-data").css("opacity", "1")
                    $("div#quick-settings div.mobile-data").css("font-style", "normal")
                    localStorage.setItem("mobileData", "true")
                    airplaneState = "false"

                }



            };

            if (callback == '{"ril.data.enabled":false}') {
                if (param == "toggle") {

                    data_toggle("on");

                }

                if (param == "get") {
                    $("div#quick-settings div.mobile-data").css("opacity", "0.5")
                    $("div#quick-settings div.mobile-data").css("font-style", "italic")
                    localStorage.setItem("mobileData", "false")

                }


            };

        }


        setting.onerror = function() {
            console.warn('An error occured: ' + setting.error);
        }


    }


    ///////////////////
    ///TETHERING///////
    //////////////////


    function tethering_toggle(param) {


        var lock = navigator.mozSettings.createLock();
        var setting = lock.get('tethering.wifi.enabled');



        setting.onsuccess = function() {
            //strict
            if (param == "on") {
                var lock = navigator.mozSettings.createLock();
                var result = lock.set({
                    'tethering.wifi.enabled': true
                });

                result.onsuccess = function() {


                    $("div#quick-settings div.tethering").css("opacity", "1")
                    $("div#quick-settings div.tethering").css("font-style", "normal")
                    localStorage.setItem("tethering", "true")

                    //get PWD
                    var getPWD = lock.get('tethering.wifi.security.password');
                    getPWD.onsuccess = function() {


                        var stringify_result = JSON.stringify(getPWD.result)
                        var callback = JSON.parse(stringify_result)
                        $("div#message-box").css("display", "block")
                        $("div#message-box").text(callback['tethering.wifi.security.password'])


                        setTimeout(function() {
                            $("div#message-box").text("");
                            $("div#message-box").css("display", "none");
                        }, 10000);

                    }

                    getPWD.onerror = function() {
                        alert("Can't show password")
                    }


                }

                result.onerror = function() {
                    alert("An error occure, the settings remain unchanged");
                }

            }

            if (param == "off") {
                var lock = navigator.mozSettings.createLock();
                var result = lock.set({
                    'tethering.wifi.enabled': false
                });


                result.onsuccess = function() {
                    $("div#quick-settings div.tethering").css("opacity", "0.5")
                    $("div#quick-settings div.tethering").css("font-style", "italic")
                    localStorage.setItem("tethering", "false")
                }

                result.onerror = function() {
                    alert("An error occure, the settings remain unchanged");
                }


            }



            //toogle
            var callback = JSON.stringify(setting.result);



            if (callback == '{"tethering.wifi.enabled":true}') {


                if (param == "toggle") {
                    tethering_toggle("off");

                }



                if (param == "get") {
                    $("div#quick-settings div.tethering").css("opacity", "1")
                    $("div#quick-settings div.tethering").css("font-style", "normal")
                    localStorage.setItem("tethering", "true")

                }



            };

            if (callback == '{"tethering.wifi.enabled":false}') {
                if (param == "toggle") {

                    tethering_toggle("on");

                }

                if (param == "get") {
                    $("div#quick-settings div.tethering").css("opacity", "0.5")
                    $("div#quick-settings div.tethering").css("font-style", "italic")
                    localStorage.setItem("tethering", "false")

                }


            };

        }


        setting.onerror = function() {
            console.warn('An error occured: ' + setting.error);
        }


    }



    /////AIRPLANE



    function airplane_toggle(param) {
        if (param == "toggle" && airplaneState == "true") {
            airplane_toggle("off")
            airplaneState = "false"
            return
        }

        if (param == "toggle" && airplaneState == "false") {
            airplane_toggle("on")
            airplaneState = "true"

        }




        if (param == "off") {
            $("div#quick-settings div.airplane").css("opacity", "0.5")
            $("div#quick-settings div.airplane").css("font-style", "italic")
            bluetooth_toggle("on")
            wifi_toggle("on")
            data_toggle("on")

        }

        if (param == "on") {
            $("div#quick-settings div.airplane").css("opacity", "1")
            $("div#quick-settings div.airplane").css("font-style", "normal")
            bluetooth_toggle("off")
            wifi_toggle("off")
            data_toggle("off")

        }

        if (param = "get") {


            if (airplaneState == "true") {
                $("div#quick-settings div.airplane").css("opacity", "1")
                $("div#quick-settings div.airplane").css("font-style", "normal")
            }

            if (airplaneState == "false") {
                $("div#quick-settings div.airplane").css("opacity", "0.5")
                $("div#quick-settings div.airplane").css("font-style", "italic")
            }
        }



    }



    //get status on start
    wifi_toggle("get");
    bluetooth_toggle("get");
    data_toggle("get");
    tethering_toggle("get");


    setTimeout(
        function() {
            airplane_toggle("get");
        }, 1000);









    //////////////////////////
    ////KEYPAD TRIGGER////////////
    /////////////////////////



    var key_time
    var press_time = 0;
    var longpress = false;

    function func_interval() {
        longpress = false;
        press_time = 0;
        key_time = setInterval(function() {
            press_time++

            if (press_time > 2) {
                longpress = true;
            }
            if (press_time < 2) {
                longpress = false;
            }

        }, 1000);
    }



    function handleKeyDown(evt) {
        switch (evt.key) {
            case 'Enter':
                func_interval();
                quick_settings_toggle();
                break;

            case 'Backspace':
                evt.preventDefault();
                if (dir_level == 0) {
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
                if (longpress === false) {
                    launchApp();
                    choice_location();
                }

                if (longpress === true) {
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
                if (window_status != "weather-location") {
                    nav("slide_right")
                }
                break;

            case 'ArrowLeft':
                if (window_status != "weather-location") {
                    nav("slide_left");
                }

                break;

            case 'SoftRight':
                if (window_status == "weather-location") {
                    $("div#weather-wrapper div#locations").css("display", "none");
                    $("div#weather-wrapper div#location").css("display", "block");
                    bottom_bar("location", "", "")
                    window_status = "weather";
                }

                break;


            case 'SoftLeft':
                select_location();
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

            case '0':
                //listApps(true);
                storeSettingsStats_alarm("get")
                break;


        }

    };



    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);


});