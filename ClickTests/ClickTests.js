    //Simulate mouse clicks for testing web page

   function simulateButtonClick(element) {
     var promise = new Promise(function(resolve, reject) { // do async operation and process the result
       console.error('Clicking ...', element);
       try {
         if (element == 'Search') {
           document.getElementById('theKeywords').value = 'chihuly'; //places text in input box
           console.error('Query for chihuly ...');
           newKeyQuery();  //Query for search box value (PublicArtjs)
           setTimeout(simulateMapEvents, 4000); //Leave enough time to see the popup before closing
         } else {
           element.click(); //Simulate mouse click on element
         }
         setTimeout(function() {
           resolve('Done!'); //nothing to return
         }, 4000); //Wait 4 seconds for next DOM element to be available before moving on 
       } catch (error) {
         alert('Element ' + element + ' had the follow problem: \n' + error);
       }
     });
     return promise;
   }

   function simulateMapEvents() {
     console.error('Starting map events, resetting query criteria  ...');
     document.querySelector('[id="buttonReset_label"]').click(); //Reset button
     setTimeout(function() {
       console.error('Zooming in ...');
       gmap.setZoom(19);
       setTimeout(function() {
         console.error('Panning ...');
         gmap.panTo({
           lat: 47.2537310821999,
           lng: -122.445190516
         });
         setTimeout(function() {
           console.error('Hovering over marker ...');
           go2art(47.2537310821999, -122.445190516, 0); //Simulate marker hover (PublicArt.js)
           setTimeout(function() {
             console.error('Clicking marker ...');
             google.maps.event.trigger(markersArray[0],'mouseout'); //close mouse over summary popup
             google.maps.event.trigger(markersArray[0], "click");  //click marker
             console.error('Automated testing done!');
           }, 4000);
         }, 4000);
       }, 4000);
     }, 4000); //Wait 4 seconds for next DOM element to be available before moving on 
   }

   function processArray(array, fn) {
     var index = 0;
     function next() {
       if (index < array.length) {
         fn(array[index++]).then(next); //Promises chained together - synchronize a sequence of promises with .then, don't run the next widget test until the previous test has finished
       } else {
       	 //console.error('Testing done!');
       }
     }
     next(); //start looping through array
   }

   setTimeout(function() {
     console.error('Waiting a specific time for page to be ready ...');
     var testElementsArray = []; //Array of items by ID to click
	     testElementsArray.push(document.querySelector('[title="Cancel"]'));  //Splash page
	     testElementsArray.push(document.querySelector('[title="Show imagery with street names"]'));  //Hybrid button
	     testElementsArray.push(document.querySelector('[title="Show standard map"]'));  //Map button
	     testElementsArray.push(document.querySelector('[title="Zoom in"]'));  //Zoom In  button
	     testElementsArray.push(document.querySelector('[title="Zoom out"]'));  //Zoom Out button
	     testElementsArray.push(document.querySelector('[id="rightTabs_tablist_ItineraryTab"]'));  //Itinerary Tab
	     testElementsArray.push(document.querySelector('[id="rightTabs_tablist_DirectionsTab"]'));  //Directions Tab
	     testElementsArray.push(document.querySelector('[id="rightTabs_tablist_SearchTab"]'));  //Search Tab
	     testElementsArray.push("Search");  //Search 
     processArray(testElementsArray, simulateButtonClick); //Run a async operation on each item in array, but one at a time serially such that the next operation does not start until the previous one has finished.
   }, 10000);
