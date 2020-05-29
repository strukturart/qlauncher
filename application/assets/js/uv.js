function getUVIndex(lat, lng, alt, uv_api_key) {
    var param_url =
        "https://api.openuv.io/api/v1/forecast?lat=" +
        lat +
        "&lng=" +
        lng +
        "&alt=" +
        alt;

    var xhttp = new XMLHttpRequest({ mozSystem: true });

    xhttp.open("GET", param_url, true);
    xhttp.setRequestHeader("x-access-token", uv_api_key);
    xhttp.setRequestHeader("Cache-Control", "no-store");


    xhttp.onload = function() {
        if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {


            var data = JSON.parse(xhttp.response);

            var uv_value_0 = Math.round(data.result[0].uv)
            var uv_value_1 = Math.round(data.result[3].uv)
            var uv_value_2 = Math.round(data.result[9].uv)
            var uv_value_3 = Math.round(data.result[11].uv)


            function color_index(val) {


                switch (true) {
                    case (val < 3):
                        return "#558B2F";
                        break;
                    case (val <= 6 && val > 3):
                        return "#F9A825";
                        break;

                    case (val <= 7 && val > 6):
                        return "#EF6C00";
                        break;

                    case (val < 11 && val >= 8):
                        return "#B71C1C";
                        break;

                    case (val >= 11):
                        return "#6A1B9A";
                        break;

                }

            }




            $("#uv-index-0 > div.uv").text(uv_value_0);
            $("#uv-index-0 > div.uv").css("background", color_index(uv_value_0));
            $("#uv-index-0 > div.time").text(moment(data.result[0].uv_time).format("hh:mm"));


            $("#uv-index-1 > div.uv").text(uv_value_1);
            $("#uv-index-1 > div.uv").css("background", color_index(uv_value_1));
            $("#uv-index-1 > div.time").text(moment(data.result[3].uv_time).format("hh:mm"));


            $("#uv-index-2 > div.uv").text(uv_value_2);
            $("#uv-index-2 > div.uv").css("background", color_index(uv_value_2));
            $("#uv-index-2 > div.time").text(moment(data.result[6].uv_time).format("hh:mm"));

            $("#uv-index-3 > div.uv").text(uv_value_3);
            $("#uv-index-3 > div.uv").css("background", color_index(uv_value_3));
            $("#uv-index-3 > div.time").text(moment(data.result[9].uv_time).format("hh:mm"));



        }
    };

    if (xhttp.status === 403) {
        toaster("403", 4000)
        return "403";

    }

    if (xhttp.status === 404) {}

    ////Redirection
    if (xhttp.status === 301) {}

    if (xhttp.status === 0) {
        //toaster("Can't load UV-Index", 5000);
        //return "Can't load UV-Index";
    }

    xhttp.onerror = function() {};
    xhttp.send(null);
}