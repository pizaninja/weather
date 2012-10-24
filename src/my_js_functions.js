ticks = new Array();
s = new Array();
$(document).ready(function($) {
    var cityParam = decodeURIComponent($.urlParam('city'));
    var city = "Paris";
    if (cityParam != 0) {
        city = cityParam;
    }

    $.foo(city);

    // on search action
    $("#myForm").submit(
        function(event) {
            city = $("input[name=city]").val();
            $.foo(city)
            event.preventDefault();
        }
        );
}); 

// retrieve city from url
$.urlParam = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results) {
        return results[1];
    }
    return 0;
}

// draw results in 'chart1' div
$.graph = function(s1, ticks) {
    var plot1 = $.jqplot('chart1', [s1], {
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            rendererOptions: {
                fillToZero: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticks
            },
            yaxis: {
                pad: 1.05,
                tickOptions: {
                    formatString: '%d°C'
                }
            }
        }
    });
    plot1.redraw();
}

// process all for a new city
$.foo = function(city) {
    $.ajax({
        url : "http://api.wunderground.com/api/fdb61d8a3c1e4be4/geolookup/conditions/forecast/q/France/" + city + ".json",
        dataType : "jsonp",
        success : function(parsed_json) {
            var location = parsed_json['location'];
            if (!location) {
                alert('Nothing returned from wunderground.com')
                return;
            }
            var temp_c = parsed_json['current_observation']['temp_c'];

            // add data for graph
            ticks.push(city);
            s.push(temp_c);

            // image weather of current city
            var img = parsed_json['current_observation']['icon_url'];
            $("#weather_image").html(city + ': <img src="' + img + '">');

            // search result
            var nearby_weather_stations = location['nearby_weather_stations'];
            $('#city_list').html('');
            var city_number = 0;
            if (nearby_weather_stations) {
                var airports = nearby_weather_stations['airport'];
                if (airports) {
                    var airports_stations = airports['station'];
                    jQuery.each(airports_stations, function(i, airports_station) {
                        var stationCity = airports_station['city'];
                        stationName = "airport city " + i + ":" + stationCity;
                        stationCityEscape = encodeURIComponent(stationCity);
                        var city_id = "city_" + city_number;
                        city_number++;
                        $('#city_list').append('<a id="' + city_id + '" href="go.html?city=' + stationCityEscape + '">' + stationName + '</a><br>');
                        $('#' + city_id).click(function(event) {
                            event.preventDefault();
                            $.foo(stationCity)
                        });
                    });
                }

                var pws = nearby_weather_stations['pws'];
                if (pws) {
                    var pws_stations = pws['station'];
                    jQuery.each(pws_stations, function(i, pws_station) {
                        var stationCity = pws_station['city'];
                        stationName = "pws city " + i + ":" + stationCity;
                        stationCityEscape = encodeURIComponent(stationCity);
                        var id = "city_" + city_number;
                        city_number++;
                        $('#city_list').append('<a id="' + id + '" href="go.html?city=' + stationCityEscape + '">' + stationName + '</a><br>');
                        $('#' + id).click(function(event) {
                            event.preventDefault();
                            $.foo(stationCity)
                        });
                    });
                }
                $.graph(s, ticks);
            }
        },
        error : function(xhr) {
            alert('Error!  Status = ' + xhr.status);
        }
    });
}



