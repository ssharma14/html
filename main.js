/**
 * Flickr image display application. The script makes use of the 
 * Flickr App API, bootstrap, handlebars and less.
 *
 */


(function($) {

	'use strict';

	/**
     * Register Handlebar request to displays a Photos containing the tag entered by user.
     * @param {Object} data - The returned object of flickr image containing tag.
     * @param {Object} $el - The jQuery reference to the display DOM element.
     */
	function displayPhotoByTag(data, $el) {
		$('.searchImgs').empty();
		for(var i=0; i < data.photos.photo.length; i++) {
			$('.imgs').empty();
			var obj = {
	            farm: data.photos.photo[i].farm,
	            server: data.photos.photo[i].server,
	            id: data.photos.photo[i].id,
	            secret: data.photos.photo[i].secret,
	        },

	        templateSource = $("#search-template").html(),//put commas or it will give variable not defined error
	        templateFn = Handlebars.compile(templateSource);

	        $el.html(Handlebars.compile($('#search-template').html())({searchImgs: data.photos.photo}));
		}
		
		imageMouseenter();
			
	}

	/**
     * Register Handlebar request to displays a Photos user enters no tag and hit enter. Gets the recent photos added in flickr app
     * @param {Object} data - The returned object of recent flickr images.
     * @param {Object} $el - The jQuery reference to the display DOM element.
     */
	function displayPhotoBySearch(data, $el) {
		$('.imgs').empty();
		for(var i=0; i < data.photos.photo.length; i++) {
			$('.searchImgs').empty();
			var obj = {
	            farm: data.photos.photo[i].farm,
	            server: data.photos.photo[i].server,
	            id: data.photos.photo[i].id,
	            secret: data.photos.photo[i].secret,
	        },
			templateSource = $("#search-template").html(),//put commas or it will give variable not defined error
	        templateFn = Handlebars.compile(templateSource);

	        $el.html(Handlebars.compile($('#search-template').html())({imgs: data.photos.photo}));
	    }
			
			imageMouseenter();
	}

	/**
     * Displays error if something is broken.
     */
	function displayError(){
		$('.searchImgs').empty();
		$('.imgs').empty();
		$('.errors').empty();
	    $('.errors').append('Request Failed. Try again later');
	}

	/**
     * Displays the number of pages associated with the photos.
     * And if number of pages returned are more than 500 than show only 500 pages
     * While retreiving large no of pages the data display was becoming very slow
     */

	function displayPageNumber(data, $el){
		$('.pagination').empty();
		$('.pagination').append('<li class="previous"><a href="#" aria-label="Previous"><span aria-hidden="true">Previous</span></a></li>');
		$('.pagination').append('<li class="next"><a href="#" aria-label="Next"><span aria-hidden="true">Next</span></a></li>');
		if(data.photos.pages > 500) {
			for(var i=1; i<= 500; i++) {
				$('.next').before('<li><a data-index="' + i + '" href="#" >' + i + '</a></li>');
			}
		}
		else{
			for(i=1; i<= data.photos.pages; i++) {
				$('.next').before('<li><a data-index="' + i + '" href="#" >' + i + '</a></li>');	
			}	
		}
	}

	/**
     * Register Handlebar helper to displays the description associated with the selected photo.
     *
     */
	function viewDescription(data, $el, photo){
			var photoId =  photo.alt;
			var photoId = Number(photoId);

			document.querySelector('.imageFull').src = photo.src;
			document.querySelector('.imageFull').alt = photoId;
			var descriptionQuery = 'https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=e658ae9c4720bea838ecd97747b87860&photo_id=' +photoId+ '&format=json&nojsoncallback=1';
			var jqxhr = $.getJSON(descriptionQuery, function (data) {
				$('.description').addClass('jumbotron');
				var obj = {
	            realName: data.photo.owner.realname,
	            userName: data.photo.owner.username,
	            title: data.photo.title._content,
	            date: data.photo.dates.taken,
	            description : data.photo.description._content,
	        },
			templateSource = $("#description-template").html(),//put commas or it will give variable not defined error
	        templateFn = Handlebars.compile(templateSource);
	        $el.find('.details').html(templateFn(obj));
	        	$('.details').addClass('detailsStyle');
	        	if(data.photo.description._content == ""){
	            	$('.descripionText')[0].textContent = "No Description Available";
	        	}
	        	if(data.photo.title._content == ""){
	            	$('.title')[0].textContent = "No Tilte Available";
	        	}
	        	if(data.photo.owner.realname == ""){
	            	$('.realName')[0].textContent = "Owners Name not Available";
	        	}
	        	$('html, body').animate({ scrollTop: 100 }, 100);
	        	
			});

	};

		
	/**
     * Displays location of image taken via google maps if available and if not shows a message of unavailable location
     *using bootstrap tooltip
     */
	function imageMouseenter() {
		$('.image').on('mouseover', function(e){
			var FlickrMap = $(e.target).next()[0];
			var flickrMap = $(e.target).next();
			$('.overlay').tooltip().hide;
			
			var photoId = $(e.target).attr('alt');
			var photoId = Number(photoId);
			$(FlickrMap).tooltip('hide');
			var locationQuery = 'https://api.flickr.com/services/rest/?method=flickr.photos.geo.getLocation&api_key=e658ae9c4720bea838ecd97747b87860&photo_id=' +photoId+ '&format=json&nojsoncallback=1';
			var jqxhr = $.getJSON(locationQuery, function (data) {
					if(data.stat == "ok") {
						$('.overlay').tooltip('destroy');
						flickrMap.empty();
				        var uluru = {lat: Number(data.photo.location.latitude), lng: Number(data.photo.location.longitude)};
				        var map = new google.maps.Map(FlickrMap, {
				          zoom: 4,
				          center: uluru
				        });
				        var marker = new google.maps.Marker({
				          position: uluru,
				          map: map
				        });
			      }
			      else{
			      		$(FlickrMap).tooltip();
			      }
			});
		});		
	}


	// Event listener for retrieving a flickr images
	$('.frm.photo').on('submit', function(e) {
		$('.errors').empty();
		document.querySelector('.imageFull').src = "";
		document.querySelector('.imageFull').alt = "";
		$('.details').empty();
		var tag = $(e.target).find('[name=tags]').val();
		var perPage = $(e.target).find('#perPages').val();
		var jqxhr;
		perPage = Number(perPage);
		var searchQuery = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=e658ae9c4720bea838ecd97747b87860&tags=' + tag + '&per_page=' + perPage + '&format=json&nojsoncallback=1';
		var recentQuery = 'https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=e658ae9c4720bea838ecd97747b87860&per_page=' + perPage + '&format=json&nojsoncallback=1';
		
		//retreving flickr image by tag
		if(tag != "") {

			jqxhr = $.getJSON(searchQuery, function (data) {
				console.log(data);
				if ( data.photos.total == 0 ) {
			        displayError();
			    }
			    $('.description').removeClass('jumbotron');
				$('.details').removeClass('detailsStyle');
				displayPhotoByTag (data, $('.searchImgs'));
				displayPageNumber(data, $('nav'));
				$('.search').on('click', function(e) {
					var photo = $(e.target).siblings().children()[0];
					viewDescription(data, $('.description'), photo);
				});

				//event for displaying the clicked pagenumber
				$('a').click(function() {
					$('.description').removeClass('jumbotron');
					$('.details').removeClass('detailsStyle');
					var pageNumber = $(this).attr('data-index');
					pageNumber = Number(pageNumber);
					document.querySelector('.imageFull').src = "";
					document.querySelector('.imageFull').alt = "";
					$('.details').empty();
					jqxhr = $.getJSON(searchQuery + '&page=' + pageNumber, function (data) {
						console.log(data);
						displayPhotoByTag (data, $('.searchImgs'));
						$('.search').on('click', function(e) {
    						$(this).button('complete');
							var photo = $(e.target).siblings().children()[0];
							viewDescription(data, $('.description'), photo);
					});
					}).fail(function( jqxhr, textStatus, error) {
						displayError();
					});
				});
			}).fail(function( jqxhr, textStatus, error) { //calls displayerror function in case api fail to display data
				displayError();
		   });

		}

		//retreving recent flickr images
		else {
			jqxhr =  $.getJSON(recentQuery, function (data) {
				console.log(data);
				if ( data.photos.total == 0 ) { //display error if something gibberish is entered or if stat returend ok but photo are not displayed
			        displayError();
			    }
			    $('.description').removeClass('jumbotron');
				$('.details').removeClass('detailsStyle');	
				
				displayPhotoBySearch(data, $('.imgs'));
				displayPageNumber(data, $('nav'));
				$('.search').on('click', function(e) {
					var photo = $(e.target).siblings().children()[0];
					viewDescription(data, $('.description'), photo);
				});
				
				//event for displaying the clicked pagenumber
				$('a').click(function() {
					$('.description').removeClass('jumbotron');
					$('.details').removeClass('detailsStyle');
					var pageNumber = $(this).attr('data-index'); 
				  	pageNumber = Number(pageNumber);
				  	document.querySelector('.imageFull').src = "";
				  	document.querySelector('.imageFull').alt = "";
					$('.details').empty();
					jqxhr = $.getJSON(recentQuery + '&page=' + pageNumber, function (data) {	
						console.log(data);
						displayPhotoBySearch(data, $('.imgs'));
						$('.search').on('click', function(e) {
							var photo = $(e.target).siblings().children()[0];
							viewDescription(data, $('.description'), photo);
					});
					}).fail(function( jqxhr, textStatus, error) { //calls displayerror function in case api fail to display data
						displayError();
					});
					
				});
			}).fail(function(jqxhr, textStatus, error) { //calls displayerror function in case api fail to display data
				displayError();
		   });
		   	
		}
		    
		e.preventDefault();
	});


}(jQuery));

