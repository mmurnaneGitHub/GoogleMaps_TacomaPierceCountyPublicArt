var gmap = null; //map
var overlay;  //to get map pixel location
var MY_MAPTYPE_ID = 'gray';  // map style
var bounds;  //map extent
var dialog;  //lightbox
var markersArray = [];  //marker array for complete removal during searches & marker clusterer
var lastID = null;  //for mouseout during Map Zoom link
var dataAll;  //data file

//Itinerary directions
var Itinerary;  //Itinerary list
var directionDisplay;
var directionsService = new google.maps.DirectionsService();
var directionsService;
var origin = null;
var destination = null;
var waypoints = [];
var markers = [];  //Itinerary marker array for easy removal
var directionsVisible = false;

//=== Set marker attributes ===
var imageRed = new google.maps.MarkerImage('images/mapIcons/red.png',
  new google.maps.Size(12, 20),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 20));
var imageYellow = new google.maps.MarkerImage('images/mapIcons/yellow.png',
  new google.maps.Size(12, 20),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 20));
var imageGreen = new google.maps.MarkerImage('images/mapIcons/green.png',
  new google.maps.Size(12, 20),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 20));
var shadow = new google.maps.MarkerImage('images/mapIcons/mm_20_shadow.png',
  new google.maps.Size(22, 20),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 20));
var shape = {
  coord: [1, 1, 1, 20, 18, 20, 18, 1],
  type: 'poly'
};
var imageOver = new google.maps.MarkerImage('images/mapIcons/highlight.png',
  new google.maps.Size(12, 20),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 20));
var myMarker = false;  //marker for mobile location

function initialize() {
  //Buttons - create programmatically:
  var button = new dijit.form.Button({  //Search tab
    label: "Reset",
    title: "Reset search criteria",
    type: "reset",
    onClick: function () {
      clearSearchBox(); queryData(1);
    }
  },
    "buttonReset");

  var button = new dijit.form.Button({  //Itinerary tab
    label: "Get Directions!",
    onClick: function () {
      reset(); calcRoute();
    }
  },
    "buttonDirections");

  var button = new dijit.form.Button({  //Itinerary tab
    label: "Reset",
    onClick: function () {
      reset(); destroyAll();
    }
  },
    "buttonRemove");

  var button = new dijit.form.Button({  //Itinerary tab
    label: "Delete selected Site(s)",
    onClick: function () {
      deleteSelected();
    }
  },
    "buttonDelete");

  var myLatlng = new google.maps.LatLng(47.250138520439556, -122.47643585205077);  //Map center

  //Map style----------
  var styleGray = [
    {
      featureType: "administrative",
      elementType: "all",
      stylers: [
        { saturation: -100 }
      ]
    }, {
      featureType: "landscape",
      elementType: "all",
      stylers: [
        { saturation: -100 }
      ]
    }, {
      featureType: "poi",
      elementType: "all",
      stylers: [
        { saturation: -100 }
      ]
    }, {
      featureType: "road",
      elementType: "all",
      stylers: [
        { saturation: -100 }
      ]
    }, {
      featureType: "transit",
      elementType: "all",
      stylers: [
        { saturation: -100 }
      ]
    }, {
      featureType: "water",
      elementType: "all",
      stylers: [
        { saturation: -100 }
      ]
    }
  ];
  //end map style ------

  var myOptions = {
    zoom: 12,
    center: myLatlng,
    panControl: false,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL,
      position: google.maps.ControlPosition.RIGHT_TOP
    },
    mapTypeControl: true,
    mapTypeControlOptions: {
      mapTypeIds: [MY_MAPTYPE_ID, google.maps.MapTypeId.HYBRID]
    },
    scaleControl: true,
    streetViewControl: true,
    overviewMapControl: false,
    mapTypeId: MY_MAPTYPE_ID
  }

  gmap = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  //Map button
  var styledMapOptions = {
    name: "Map",
    alt: "Show standard map"
  };

  //Set background map  
  var GrayMapType = new google.maps.StyledMapType(styleGray, styledMapOptions);
  gmap.mapTypes.set(MY_MAPTYPE_ID, GrayMapType);

  //Add Legend image as a control------------------------
  var controlDiv = document.createElement('DIV');  //Create a div to hold the control.
  controlDiv.style.padding = '5px 5px 5px 5px';  //Offset the control from the edge of the map

  // Set CSS for the control border
  var controlUI = document.createElement('DIV');
  controlUI.style.backgroundColor = '#77C9B2';
  controlUI.style.borderStyle = 'solid';
  controlUI.style.borderWidth = '2px';
  controlUI.style.borderColor = '#b2b2b2';

  //Add logo image
  var myLogo = document.createElement("img");
  myLogo.src = "images/legend.jpg";
  myLogo.style.width = '69px';
  myLogo.style.height = '39px';
  //Append to each div
  controlUI.appendChild(myLogo);
  controlDiv.appendChild(controlUI);

  //Add logo control to map
  gmap.controls[google.maps.ControlPosition.LEFT_TOP].push(controlDiv);
  //End Legend as a control------------------------

  //Add overlay to map to get pixel location for mouse hover
  overlay = new google.maps.OverlayView();
  overlay.draw = function () { };
  overlay.setMap(gmap); //add empty OverlayView and link the map div to the overlay 

  //Update html text in tab windows -
  var tabText = "<div><b>Create your own itinerary:</b>";
  tabText += "<ul><li>Enter Starting Point information</li>";
  tabText += "<li>Click map marker</li>";
  tabText += "<li>Select <i>Add to my Itinerary</i> <br>(up to 9 sites)</li>";
  tabText += "</ul></div>";

  tabText += "<div style='border-top:1px solid #C0C0C0;background:#EEEEEE;padding:4px 4px 4px 4px;'>";
  tabText += "<b>Starting Point:</b>";
  tabText += "</div>";

  tabText += "<div style='float:right;'>Address: <input type='text' name='StartAddress1' id='StartAddress1' value='747 Market St' /></div>";
  tabText += "<div style='float:right;'>City: <input type='text' name='StartAddress2' id='StartAddress2' value='Tacoma' /><br />&nbsp;</div>";

  tabText += "<div style='clear:both;background:#EEEEEE;padding:4px 4px 4px 4px;'><b>Itinerary: </b></div>";
  tabText += "<div class='Itinerary Container' style='clear:both;width:230px;'><ol id='Itinerary Node' class='container'></ol></div>";

  dojo.byId("theItinerary1").innerHTML = tabText;
  dojo.byId("theItinerary2").innerHTML = "<i>No Sites selected.</i>";
  dojo.byId("directions1").innerHTML = "<a href='javascript:PrintContent();'>Print Directions</a>";
  dojo.byId("directions2").innerHTML = "<a href=\"javascript:togglePane('rightPane','rightTabs','ItineraryTab');\">Modify Itinerary</a>";

  //Header content
  var headerText = "<div style='float:left;color:rgb(0,0,0); font-weight:bold;'>Tacoma-Pierce County Public Art Tour</div>";
  headerText += "<div style=\"float:right;\"><input type=\"text\"  title='Search for title or artist by keyword' name='theKeywords' id='theKeywords' value=' Search by title or artist...' onmouseover=\"if (this.value==' Search by title or artist...') this.value = ''\" onmouseout=\"if (this.value=='')this.value=' Search by title or artist...';\" onkeypress=\"if(event.keyCode==13) {newKeyQuery();}\" style=\"background: white url(images/search.png) right no-repeat;padding-right: 17px;\"/></div>";
  headerText += "<div style='float:right;'><a href='#' onclick=\"javascript:dijit.byId('mapWelcome').show();\" style='color:#EEEEEE; font-weight:bold;'>Welcome - Contact Us</a> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </div>";
  dojo.byId("headerContent").innerHTML = headerText;

  //Itinerary list
  Itinerary = new dojo.dnd.Source("Itinerary Node");
  Itinerary.insertNodes(false, []);

  //Replace avatar string to make it more readable
  dojo.dnd.Avatar.prototype._generateText = function () {
    return (this.manager.copy ? "copy" : "Move to here");
  };

  //Itinerary directions
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(gmap);
  directionsDisplay.setPanel(document.getElementById("directionsPanel"));

  bounds = new google.maps.LatLngBounds();  //Update map extent to marker extent
}

function addMarker(Latitude, Longitude, sum, info, title, imageIcon, ID) {
  var location = new google.maps.LatLng(Latitude, Longitude);

  //Add marker to map
  var marker = new google.maps.Marker({
    position: location,
    id: ID,
    shadow: shadow,
    icon: imageIcon,
    shape: shape,
    optimized: false,  //so draggable marker can be put behind theses markers
    map: gmap
  });

  //Add marker events
  google.maps.event.addListener(marker, 'mouseover', function () {
    marker.setIcon(imageOver);

    //Map tip - summary window
    var evt = marker.getPosition();
    var containerPixel = overlay.getProjection().fromLatLngToContainerPixel(evt);

    closeDialog();  //close any open map tips

    var dialog = new dijit.TooltipDialog({
      id: "tooltipDialog",
      content: sum,
      style: "position: absolute;z-index:100"
    });

    dialog.startup();
    dojo.style(dialog.domNode, "opacity", 0.85);
    dijit.placeOnScreen(dialog.domNode, { x: containerPixel.x, y: containerPixel.y }, ["BL", "TL", "BR", "TR"], { x: 25, y: 15 });  //summary popup offset
  });

  google.maps.event.addListener(marker, 'mouseout', function () {
    marker.setIcon(imageIcon);
    closeDialog();
  });

  google.maps.event.addListener(marker, 'click', function () {
    myDialog(info, title);
  });

  markersArray.push(marker);  //Add marker to array for later removal from map
}

function closeDialog() {
  //close any open map tips
  var widget = dijit.byId("tooltipDialog");
  if (widget) {
    widget.destroy();
  }
}

function myDialog(info, title) {
  myDlg = new dijit.Dialog({
    draggable: false
  });
  //Add additional attributes...
  myDlg.titleNode.innerHTML = title;
  myDlg.attr("content", info);
  myDlg.show();

  //Close dialog when underlay (outside window) is clicked
  dojo.connect(dijit._underlay, "onClick", function (e) { myDlg.destroy(); });
}

function myLightbox(url, title) {
  dialog.show({ href: url, title: title });
}

//Start direction functions ---------------------------------------------------
function calcRoute() {
  directionsDisplay.setPanel(document.getElementById("directionsPanel"));
  origin = dojo.byId("StartAddress1").value + "," + dojo.byId("StartAddress2").value;
  //get all sites from Itinerary list - loop
  var list = dojo.byId("Itinerary Node"),
    items = list.getElementsByTagName("li");
  for (i = 0; i < items.length; i++) {
    destination = items[i].innerHTML + ",WA";  //last in list becomes destination
    if (i + 1 != items.length) {
      waypoints.push({ location: destination, stopover: true });
    }
  }
  var mode = google.maps.DirectionsTravelMode.DRIVING;
  var request = {
    origin: origin,
    destination: destination,
    waypoints: waypoints,
    travelMode: mode,
    optimizeWaypoints: document.getElementById('optimize').checked
  };
  if (items.length == 0) {
     alert("No Sites in Itinerary.");
  } else if (dojo.byId("StartAddress1").value == "") {
    alert("Please enter a Starting Point Address.");
  } else {  //get directions
    directionsService.route(request, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        togglePane('rightPane', 'rightTabs', 'DirectionsTab');  //change panel to results
      }
    });
    clearMarkers();
    directionsVisible = true;
  }
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function clearWaypoints() {
  markers = [];
  origin = null;
  destination = null;
  waypoints = [];
  directionsVisible = false;
}

function reset() {
  clearMarkers();
  clearWaypoints();
  directionsDisplay.setMap(null);
  directionsDisplay.setPanel(null);
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(gmap);
  directionsDisplay.setPanel(document.getElementById("theDirections"));
}

function clearSearchBox() {
  document.getElementById('theKeywords').value = ' Search by title or artist...'
}
function togglePane(panel, tab, tabPick) {
  //may not need panel variable!!!!!!!!!!!!!
  if (!(dijit.byId(panel)._showing)) {
    dijit.byId(tab).selectChild(tabPick);  //open panel & show tab
  } else {
    if (dijit.byId(tab).selectedChildWidget.id != tabPick) {
      dijit.byId(tab).selectChild(tabPick);  //change tab
    } else {
      dijit.byId(panel).toggle();  //close panel
    }
  }
}
//end direction functions ---------------------------------------------------

//Begin Itinerary list functions---------------------
function destroyAll() {
  dojo.empty("Itinerary Node");
  dojo.byId("theItinerary2").style.display = 'block';  //show No Sites
  //hide direction buttons
  dojo.byId("theItinerary3").style.display = 'none';
  dojo.byId("theItinerary4").style.display = 'none';
}

function addStudio(studio) {
  var exist = "No";
  var list = dojo.byId("Itinerary Node"),
    items = list.getElementsByTagName("li");
  if (items.length == 9) {
    alert("Itinerary limited to 9 Sites.  Please remove a Site from Itinerary before adding additional Sites.")
  } else {
    for (i = 0; i < items.length; i++) {
      if (items[i].innerHTML == studio) {
        exist = "Yes";
      }
    }
    if (exist == "No") {
      Itinerary.insertNodes(false, [
        studio
      ]);
    }
  }
  if (dojo.byId("theItinerary2").style.display = 'block') {
    dojo.byId("theItinerary2").style.display = 'none'  //hide No Sites
    //show direction buttons
    dojo.byId("theItinerary3").style.display = 'block';
    dojo.byId("theItinerary4").style.display = 'block';
  }

}

function deleteSelected() {
  Itinerary.deleteSelectedNodes();
}

//end Itinerary list functions ----------------------

function PrintContent() {
  var DocumentContainer = document.getElementById("directionsPanel");
  var WindowObject = window.open('', 'PrintWindow', 'width=750,height=650,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=yes');
  WindowObject.document.writeln(DocumentContainer.innerHTML);
  WindowObject.document.close();
  WindowObject.focus();
  WindowObject.print();
}

//Begin Search functions --------------------------------
function queryData(reset) {
  cleanMap();  //Clean existing markers off map
  bounds = new google.maps.LatLngBounds();  //reset map extent for new marker extents
  if (reset == 1) {
    newQuery(1);  //reset map
  } else {
    newQuery();  //update map
  }
}

function cleanMap() {
  if (markersArray) {  //remove markers
    for (i in markersArray) {
      markersArray[i].setMap(null);
    }
    markersArray = [];  //empty marker array
  }
}

function getJson() {  //retrieve json file
  dojo.xhrGet({
    url: "PubArt.txt",
    handleAs: "json",
    preventCache: true,
    load: load_handler,
    error: error_handler
  });
}

function load_handler(response) {
  dataAll = response; //Create JSON object of all data on startup | set file to variable for later queries
  var dataQuery = dojox.json.query("$.items[/Title]", dataAll);  //query all data - sort by Title
  addMarkers(dataQuery); //add data to map            
}

function error_handler(response) {
  alert("--- Error occurred. ---\n " + error.message);
}

function newQuery(reset) {
  closeDialog();  //close any open map tips (summary window)
  var theLocation = "$.items[";  //begin query string
  if (reset != 1) {  //check for complete search reset
    if (dijit.byId('Category').value != 'All') {
      if (dijit.byId('Category').value == 'Mural') {
        theLocation += "?Category =\'" + dijit.byId('Category').value + "\' ";
      } else if (dijit.byId('Category').value == 'Sculpture') {
        theLocation += "?Category ='Sculpture*' ";
      } else {
        theLocation += "?Category !='Mural' & Category !='Sculpture: Outdoor' & Category !='Sculpture, Outdoor' & Category !='Sculpture, Indoor' & Category !='Sculpture' & Category !='Sculpture Indoor' & Category !='Sculpture: Indoor' ";
      }
    }
    if (dijit.byId('Location').value != 'All') {
      if (theLocation.length > 8) {
        theLocation += " & Neighborhood =\'" + dijit.byId('Location').value + "\' ";
      } else {
        theLocation += "?Neighborhood =\'" + dijit.byId('Location').value + "\' ";
      }
    }
    if (dijit.byId('Artist').value != 'All') {
      if (theLocation.length > 8) {
        theLocation += " & Artist =\'" + dijit.byId('Artist').value + "\' ";
      } else {
        theLocation += "?Artist =\'" + dijit.byId('Artist').value + "\' ";
      }
    }
  } //end search Reset check
  if (theLocation.length == 8) {  //Complete query string (sort)
    theLocation = "$.items[/Title]";
  } else {
    theLocation += "][/Title]";
  }
  var dataQuery = dojox.json.query(theLocation, dataAll);  //Query text file | query data to get json
  if (dataQuery.length == 0) {  //Check here for no records - alert message or add art to map
    alert("Sorry, no art found. Please modify search.");
    var artCnt = "<i>No artwork found</i>";
    dojo.byId("searchResults").innerHTML = "";  //remove past search summary info
  } else {
    if (dataQuery.length == 1) {  //update search count
      var artCnt = "<i>One artwork found</i>";
    } else {
      var artCnt = "<i>" + dataQuery.length + " artworks found</i>";
    }
    addMarkers(dataQuery);  //update map
  }
  dojo.byId("artCount").innerHTML = artCnt;  //update search count
}

function newKeyQuery() {  //reset map
  cleanMap();  //Clean existing markers off map
  bounds = new google.maps.LatLngBounds();  //reset map extent for new marker extents
  closeDialog();  //close any open map tips (summary window)
  var theKey1 = "*" + document.getElementById('theKeywords').value + "*";  //from search box
  var theKey = theKey1.replace("'", "\\'");  //format lightbox string for names like D'Agostino
  //Using wildcards prevents the use reference parameters ($1,$2, etc)
  var theKeySearch = "$.items[?Artist~\'" + theKey + "\' || Title~\'" + theKey + "\'][/Title]";  //dojo syntax, not case sensitive (~)
  var dataQuery = dojox.json.query(theKeySearch, dataAll);  //Query text file | query data to get json
  if (dataQuery.length == 0) {  //Check here for no records - alert message or add art to map
    alert("Sorry, no art found. Please modify search.");
    var artCnt = "<i>No artwork found</i>";
    dojo.byId("searchResults").innerHTML = "";  //remove past search summary info
  } else {
    if (dataQuery.length == 1) {  //update search count
      var artCnt = "<i>One artwork found</i>";
    } else {
      var artCnt = "<i>" + dataQuery.length + " artworks found</i><br> for keyword = " + document.getElementById('theKeywords').value;
    }
    addMarkers(dataQuery);  //update map
  }
  dojo.byId("artCount").innerHTML = artCnt;  //update search count
}

function addMarkers(jsonData) {
  //Link between side panel & map markers using the marker array
  var markerArrayID = 0;

  //Title/Description/Search tab summary variables
  var sum_content = "";
  var detail_content = "";
  var search_content = "";

  //Format the data into html - loop through each record
  for (var i = 0; i < jsonData.length; i++) {
    if (jsonData[i].Lat != null) {  // only attempt to add markers with Latitude

      //Empty out previous descriptions
      sum_content = "";
      detail_content = "";

      //SUMMARY
      sum_content += "<div style='color:rgb(56,64,142); font-weight:bold; font-style:italic; text-align:center; '>" + jsonData[i].Title + "</div>";
      sum_content += "<div style=\"text-align:center;\"><b>" + jsonData[i].Artist + "</b>";
      //Image field value manipulation
      var sum_Image = "images/artwork/" + jsonData[i].Image.substring(jsonData[i].Image.lastIndexOf("\\"), jsonData[i].Image.lastIndexOf("#")).replace("\\", "");;
      var sum_Image2 = sum_Image.replace(".JPG", "1.JPG").replace(".jpg", "1.jpg");
      //Format lightbox string for artist names like D'Agostino  or titles like Adam's Rib
      sum_content += "<br><a href=\"javascript:myLightbox('" + sum_Image + "','" + jsonData[i].Artist.replace(/'/g, "\\'") + ": <i>" + jsonData[i].Title.replace(/'/g, "\\'") + "</i>')\"><img src=\"" + sum_Image2 + "\" style=\"max-width:100px;max-height:100px;margin:2px 5px 5px 0px;border:solid 1px #999;padding:2px\"  title='Click to enlarge photo'/></a>";
      sum_content += "<br><i>Click marker for details</i></div>";

      //DETAILED DESCRIPTIONS---------------------------------------
      //TITLE BAR
      var title_content = "<span style='color:rgb(56,64,142);'>" + jsonData[i].Title + "</span>"
      detail_content += "<div style='clear:both;width: 475px;'>";  //start address header - optimal width for IE varies screen size????
      var iAddress = jsonData[i].Location1 + ", " + jsonData[i].City;  //address for Itinerary
      detail_content += "<div style='clear:both;'>";
      detail_content += "<span style='color:rgb(56,64,142);'>" + iAddress + "</span>";
      detail_content += "&nbsp;|&nbsp;<a href=\"https://maps.google.com/maps?daddr=" + iAddress + ", WA\" target='_blank'>Get Directions</a>";
      detail_content += "&nbsp;|&nbsp;<a href=\"https://maps.google.com/?cbll=" + jsonData[i].Lat + "," + jsonData[i].Long + "&cbp=13,0,,,&layer=c&z=17\" target='_blank'>Street View</a><br>";
      //Itinerary!!!!!!!!!!!!!!!!
      var iStudio = iAddress;  //Itinerary Site Address
      detail_content += "<span style=clear:both;float:right;'><b>Add to my Itinerary?</b> <input type='radio' name='Itinerary' id='y' onclick='addStudio(\"" + iStudio + "\");togglePane(\"rightPane\",\"rightTabs\",\"ItineraryTab\");'/>Yes</span><br>";
      detail_content += "</div>";  //end address header
      //Separator - start individual artists
      detail_content += "<div style='clear:both;'><hr color='#ACB1DB'></div>";
      //Image
      detail_content += "<div style='clear:both;float:left;width:200px;'>";
      //Format lightbox string for names like D'Agostino
      detail_content += "<a href=\"javascript:myLightbox('" + sum_Image + "','" + jsonData[i].Artist.replace(/'/g, "\\'") + ": <i>" + jsonData[i].Title + "</i>')\"><img style ='float:left;margin:2px 5px 5px 5px;border:solid 1px #999;padding:2px' src='" + sum_Image2 + "' title='Click to enlarge photo' max-height='100px' max-width='100px'></a>";
      detail_content += "</div>"
      //Artist name
      detail_content += "<div style='float:right; width:275px;'>";
      detail_content += "<b>" + jsonData[i].Artist;
      detail_content += "</b><br>";
      detail_content += "<span style='color:rgb(56,64,142);'><I>Category: </span>" + jsonData[i].Category + "</I><br>";
      if (jsonData[i].Medium != '') {
        detail_content += "<span style='color:rgb(56,64,142);'><I>Medium: </span>" + jsonData[i].Medium + "</I><br>";
      }
      if (jsonData[i].Dimensions != '') {
        detail_content += "<span style='color:rgb(56,64,142);'><I>Dimensions: </span>" + jsonData[i].Dimensions + "</I><br>";
      }
      if (jsonData[i].Year != '') {
        detail_content += "<span style='color:rgb(56,64,142);'><I>Year Created: </span>" + jsonData[i].Year + "</I><br>";
      }
      if (jsonData[i].Location2 != '') {
        detail_content += "<span style='color:rgb(56,64,142);'><I>Location: </span>" + jsonData[i].Location2 + "</I><br>";
      }
      if (jsonData[i].Agency != '') {
        detail_content += "<span style='color:rgb(56,64,142);'><I>Agency: </span>" + jsonData[i].Agency + "</I><br>";
      }
      detail_content += "<p>" + jsonData[i].Description + "</p>";
      detail_content += "</div>";  //End Artist dev
      //end DETAILED DESCRIPTIONS-------------------------------------

      //Set marker color
      var imageIcon = imageGreen;  //All Other categories
      if (jsonData[i].Category.substr(0, 9) == "Sculpture") {
        imageIcon = imageRed;
      } else if (jsonData[i].Category == "Mural") {
        imageIcon = imageYellow;
      }

      addMarker(jsonData[i].Lat, jsonData[i].Long, sum_content, detail_content, title_content, imageIcon);  //Add marker to map - just one per site
      search_content += sum_content.replace("Click marker for details", "");  //Modify summary information for Search tab | remove click text

      //Add links to summary information for Search tab
      search_content += "<center><b><a title='Zoom map to artwork and highlight' href='javascript:go2art(" + jsonData[i].Lat + ", " + jsonData[i].Long + "," + markerArrayID + ")'>Zoom</a>  |";
      search_content += "  <a title='Complete artwork details' href='javascript:myBlur();closeDialog();google.maps.event.trigger(markersArray[" + markerArrayID + "],\"click\")'>Details</a>  |";
      search_content += "  <a title='Back to top of page' href='#dataQuery'>Back to Top</a></b></center>";
      search_content += "<div style='clear:both;'><hr color='#ACB1DB'></div>";  //Add divider

      bounds.extend(new google.maps.LatLng(jsonData[i].Lat, jsonData[i].Long));  //Extend map bounds for last marker
      if ((i + 1) == jsonData.length) {  //More than one marker
        gmap.fitBounds(bounds);  //Adjust map extent to all markers
        if (gmap.getZoom() > 17) {  //Adjust if below 17 scale
          gmap.setZoom(17); //minimum zoom
          gmap.setCenter(bounds.getCenter());
        }
      }
    }

    markerArrayID = markerArrayID + 1;  //add to marker array id count
  }

  dojo.byId("searchResults").innerHTML = search_content;  //Add details to Search Tab
}

function myBlur() {
  //fix for non-IE browsers jumping up to dojo search form after closing lightbox | need to move focus away from search box (keywords instead)
  document.getElementById('theKeywords').focus();
}

function go2art(lat, lon, id) {
  //Check for previously highlighted marker
  if (lastID != null) {
    google.maps.event.trigger(markersArray[lastID], 'mouseout');  //unhighlight marker & close summary info window
  }
  //New map limits
  var bounds = new google.maps.LatLngBounds();
  var point = new google.maps.LatLng(lat, lon);
  bounds.extend(point);
  gmap.setZoom(17); //minimum zoom
  gmap.setCenter(bounds.getCenter());
  google.maps.event.trigger(markersArray[id], 'mouseover');  //highlight marker & open summary info window
  lastID = id;  //save last id for mouseout next time (remove highlighted marker)
}
//End search functions -------------------------------------


//Load map & sites after dojo load
require([
  "dojo/parser",
  "dijit/layout/BorderContainer",
  "dijit/layout/TabContainer",
  "dijit/layout/ContentPane",
  "dijit/form/Form",
  "dijit/form/Button",
  "dijit/form/FilteringSelect", //pull-down
  "dojox/json/query", //json query
  "dojox/image/Lightbox", // image lightbox 
  "dijit/Dialog",  //details window
  "dijit/TooltipDialog",  //summary window
  "dojo/dnd/Source",  //Itinerary list
  "dojo/domReady!"
],

  function (parser) {
    parser.parse();  // script code that needs to run after parse
    initialize();  //Create map
    getJson();  //Put locations on map
    dialog = new dojox.image.LightboxDialog().startup();  //FF fix for lightbox
    dijit.byId('mapWelcome').show();  //Show Map Welcome
  }
);
