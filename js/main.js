;(function($){

	var $map, $marker, $infowindow, $coordinates, $geolocationMarker, $geocoder;

	$(function() {

		if ( typeof google !== 'underfined') {

			$coordinates = {lat: 46.486801,	lng: 30.732628};
			var $map_options = {
		        center: $coordinates,
		        zoom: 10,
		        mapTypeId: google.maps.MapTypeId.ROADMAP, //ROADMAP, HYBRID etc
				disableDefaultUI: true, //disable controls zooms icon
				scrollwheel: true, // disable map scroll
				draggable: true, // disable drag map with mouse
		    };

			var $map_div = $('#map')[0]; // [0] it is important, if you use jQuery for a map
			
			$map = new google.maps.Map($map_div, $map_options);

			// Marker
			$geolocationMarker = new google.maps.Marker({
			    map: $map, // variable of our map
			    icon: {
			    	path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, // svg icon
			    	scale: 5,
			    	strokeColor: '#669',
    				fillColor: '#669'
			    },
			    title: 'Click to show address'
			});

			// Infowindow 
			$infowindow = new google.maps.InfoWindow();

			// Show infowindow on click to marker
			google.maps.event.addListener($geolocationMarker, 'click', function() {
				$infowindow.open($map, $geolocationMarker);
			});
		
			//Direction
			$(document).on('click', '.address-form__btn', function(event) {
				event.preventDefault();
				
				var directionsDisplay = new google.maps.DirectionsRenderer(),
					directionsService = new google.maps.DirectionsService(),
					start = $('.start-route').val(),
					end = $('.end-route').val();

				var request = {
				    origin:start,
				    destination:end,
				    travelMode: google.maps.TravelMode.DRIVING
				};

				directionsDisplay.setMap($map);

				directionsService.route(request, function(result, status) {
				    if (status == google.maps.DirectionsStatus.OK) {
				      directionsDisplay.setDirections(result);
				    }
				});
			}); //end click

			//Location
			populateCountries('map-country'); // List of countries

			$(document).on('click', '.map-title', function(){
				$('.location-form').slideToggle();
			}); // end click

			// Show your location
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position){						
					$coordinates = {
						lat: position.coords.latitude, 
						lng: position.coords.longitude
					};
						
					showAddressWithGeocoder($coordinates);

				});
			}

			$(document).on('click', '.show-my-pos', function(e){
				e.preventDefault();
				if (navigator.geolocation){
					navigator.geolocation.getCurrentPosition(function(position){						
						$coordinates = {
							lat: position.coords.latitude, 
							lng: position.coords.longitude
						};

						showAddressWithGeocoder($coordinates);
						
					});
				$('.location-form').slideUp();
				}
			});

			// Show address
			$(document).on('submit', '.location-form form', function(e){
				e.preventDefault();
				var country = $('#map-country').val().trim();
				var city = $('#map-city').val().trim();
				var address = $('#map-address').val().trim();
				var zip = $('#map-zip').val().trim();
				var validated = true;
				
				if (isEmptyStr(country) || country == '-1') {
					$('#map-country').closest('.map-form-field').addClass('error');
					validated = false;
				} else {
					$('#map-country').closest('.map-form-field').removeClass('error');
				}
				
				if (isEmptyStr(city)) {
					$('#map-city').closest('.map-form-field').addClass('error');
					validated = false;
				} else {
					$('#map-city').closest('.map-form-field').removeClass('error');
				}
				
				if (isEmptyStr(address)) {
					$('#map-address').closest('.map-form-field').addClass('error');
					validated = false;
				} else {
					$('#map-address').closest('.map-form-field').removeClass('error');
				}
				
				if (isEmptyStr(zip) || zip.length != 5) {
					$('#map-zip').closest('.map-form-field').addClass('error');
					validated = false;
				} else {
					$('#map-zip').closest('.map-form-field').removeClass('error');
				}
				
				if (validated) {
					
					var requestLink = address + ' ' + city + ' ' + zip + ' ' + country;
					
					showAddressWithGeocoder(requestLink);

				    $('.location-form').slideUp();
				}
			}); // end submit
		}
		
	}); // end ready

function isEmptyStr(str){
	return (str.length == 0);
}

function showAddressWithGeocoder(requestLink) {
	geocoder = new google.maps.Geocoder();
	var address,
		latlng;

	if (typeof requestLink === 'object') {
		var m_latlng = requestLink;
	} else {
		var m_address = requestLink;
	}
	
	geocoder.geocode({
		'address': m_address,
		'location': m_latlng
	}, function(results, status) {

		if (status == google.maps.GeocoderStatus.OK) {

            $map.setCenter(results[0].geometry.location);
            $geolocationMarker.setPosition(results[0].geometry.location);
        	$map.setZoom(18);
        	$infowindow.setContent('<p>' + results[0].formatted_address + '</p>');

        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
	});
}

function getFormattedAddress(m_zip, m_country, m_city, m_address) {
	var formatted_address = m_address + ', ' + m_city + ', ' + m_zip + ', ' + m_country;
	return encodeURI(formatted_address);
}

/*function showAddress(requestLink) {
	$.post (
		requestLink, 
		{}, 
		function(response){
			if (typeof response.results != 'undefined' && response.status == 'OK'){
				$coordinates = response.results[0].geometry.location;
				$map.setZoom(18);					
				$map.setCenter($coordinates);
				$geolocationMarker.setPosition($coordinates);
				$infowindow.setContent('<p>' + response.results[0].formatted_address + '</p>');
				$('.location-form').slideUp();
			} else {
				alert('Address not found!');
			}
		}
	);
}*/

/*function showAddressWithGeocoder(requestLink) {
	geocoder = new google.maps.Geocoder();

	geocoder.geocode({
		'address': requestLink
	}, function(results, status) {

		if (status == google.maps.GeocoderStatus.OK) {

            $map.setCenter(results[0].geometry.location);
            $geolocationMarker.setPosition(results[0].geometry.location);
        	$map.setZoom(18);
        	$infowindow.setContent('<p>' + results[0].formatted_address + '</p>');

        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
	});
}*/

/*function showAddressWithGeocoderCoordinades(requestLink) {
	geocoder = new google.maps.Geocoder();
	geocoder.geocode({
		'location': requestLink
	}, function(results, status) {

		if (status == google.maps.GeocoderStatus.OK) {

            $map.setCenter(results[0].geometry.location);
            $geolocationMarker.setPosition(results[0].geometry.location);
        	$map.setZoom(18);
        	$infowindow.setContent('<p>' + results[0].formatted_address + '</p>');

        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
	});
}*/


})(jQuery);
