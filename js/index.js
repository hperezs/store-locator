var map;
var markers = [];
var infoWindow;
var data;
var storesData = [];

window.onload = async () => {
  /*
    Get the users location
  */
  try {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        startPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
        usersLocation = startPosition;
        initMap(startPosition);
        zipcodeToLocation(startPosition).then((currentZipcode => searchStores(currentZipcode)));
      });
    } else {
      console.log('Geolocation is not supported by this browser. Setting default location');
    }
  } catch (error) {
    console.log(error);
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("User denied the request for Geolocation. Setting to location to default");
        initMap({ lat: 43.81564, lng: -111.78523 });
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location unavailable");
        break;
      case error.TIMEOUT:
        console.log("Request timed out.");
        break;
      case error.UNKNOWN_ERROR:
        console.log("Unknown error.");
        break;
    }
  }

  /*
    Listen for the Enter key on the search input element
  */
  let inputElement = document.getElementById('zipcode-input');
  inputElement.addEventListener("keyup", function (event) {
    if (event.key === 'Enter') {
      searchStores();
    }
  })


}

/*
    Gets the users Zipcode based on their location using the Geocode API by Google Maps
*/
async function zipcodeToLocation(startPosition) {
  let response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${startPosition.lat},${startPosition.lng}&key=AIzaSyAIl6t-gF46avf4eUVisoM4AQtLceHqtWE`).then((res) => {
    return res;
  });
  let data = await response.json();
  let currentZipcode = data.results[0]['address_components'].filter(component => {
    return component.types[0] === 'postal_code';
  })[0]['long_name'];
  return currentZipcode;
}

/*
  Initialize map
*/
function initMap(startPosition = { lat: 43.81564, lng: -111.78523 }) {
  map = new google.maps.Map(document.getElementById('map'), {
    center: startPosition,
    zoom: 11,
    mapTypeId: 'roadmap',
    mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU }
  });
  infoWindow = new google.maps.InfoWindow();
}

/*
  Get stores data from the Walmart API using the current zipcode
*/
async function searchStores(currentZipcode) {
  let input = document.getElementById('zipcode-input').value;
  if (input != '') { currentZipcode = input };
  let response = await fetch(`https://cors-anywhere.herokuapp.com/https://www.walmart.com/store/finder/electrode/api/stores?singleLineAddr=${currentZipcode}&distance=20`, {
    method: 'GET',
  }).then((res) => res);

  let data = await response.json();
  storesData = data.payload.storesData.stores;
  clearLocations();
  displayStores(storesData);
  displayStoreMarkers(storesData);
  setOnClickListener();
}

/*
  Clears all previous markers on map
*/
function clearLocations(){
  infoWindow.close();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers.length = 0;
}

/*
  Display list of stores
*/
function displayStores(storesData) {
  var html = '';
  var index = 1;
  storesData.map(store => {
    html += `
      <div class="store-list-item">
        <div class="store-info">
            <div class="store-name">
              <h4>${store.displayName}<h4>
            </div>
            <div class="store-address">
                <h5>
                    ${store.address.address} 
                </h5>
                <h5>
                    ${store.address.city}, ${store.address.state} ${store.address.postalCode}
                </h5>
            </div>
            <div class="store-phone-number">
                <p class="text-secondary">
                    ${store.phone}
                </p>
            </div>
        </div>
        <div class="distance-to-container">
            <i class="fas fa-directions" onClick="getDirections('${store.address.address}')"></i>
            <p>${store.distance} mi</p>
        </div>
      </div>
  `;
    index += 1;
  });

  document.querySelector('.stores-list-container').innerHTML = html;

}

/*
  Display the markers on the map
*/
function displayStoreMarkers(storesData) {
  var bounds = new google.maps.LatLngBounds();
  var index = 1;
  storesData.map(store => {
    let latlng = new google.maps.LatLng(store.geoPoint.latitude, store.geoPoint.longitude);
    let name = store.displayName;
    let address = store.address.address;
    let phone = store.phone;
    bounds.extend(latlng);
    createMarker(latlng, name, address, phone, index);
    index += 1;
  });

  map.fitBounds(bounds);
}

/*
  Creates an individual map marker
*/
function createMarker(latlng, name, address, phone, index) {
  var html = `<div class="store-info-window">
                <h4>${name}</h4>
                <span class="open-until-text">Open until 9 pm</span> <br><hr>
                <h6><i class="fas fa-map-marked-alt info-window-icon" onClick="getDirections('${address}')"></i>${address}</h6>
                <h6><i class="fas fa-phone-alt info-window-icon"></i>${phone}</h6>
              </div>
  `;
  var marker = new google.maps.Marker({
    map: map,
    position: latlng
  });
  google.maps.event.addListener(marker, 'click', function () {
    infoWindow.setContent(html);
    infoWindow.open(map, marker);
  });
  markers.push(marker);
}

/*
  Add an onclick listener for each list item
*/
function setOnClickListener() {
  var storeElements = document.querySelectorAll('.store-list-item');
  storeElements.forEach(function (elem, index) {
    elem.addEventListener('click', function () {
      new google.maps.event.trigger(markers[index], 'click');
    })
  })
}

/*
  Simply opens a new tab with directions to the clicked store
*/
function getDirections(address) {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, "_blank");
}