## Store Locator

This project is an implementation of the Google Maps API. It currently uses the Walmart Database accessed through their API. The ideal case would be to use this code with a client's database and API to locate stores on the website.

#### Features
This project is based on the CleverProgrammer Javascript challenge. I followed some instructions but went beyond by adding the following features:
- App works anywhere, not just LA. It uses an external API to handle data manipulation from a database (made by Walmart).
- App asks for the users location, and will center the map on their current zipcode.
- App does not look for stores matching the users zipcode, it looks for stores **near** the user (again, through the Walmart API).
- Search bar works by pressing the key Enter as well, not just clicking on the search icon.
- App will show how far a store is from the user's location (again, throught the Walmart API).
- App is able to open a new window with directions to the store for the user by pressing on either one of two directions buttons.
- Customized the UI.

See live version here: https://hperezs.github.io/store-locator/

#### Todos
- Correctly display store availability. 
- Error handling.
