$(document).ready(function() {	
	PI.init();
});

/* 
	Additional pages:
		1. Add to "pages" JSON.
		2. Add HTML to "/fragments".
		3. Duplicate index.php.
		4. Add id and name to $page_data.
*/

PI = {
	pages: {
		schema : [
			"id",
			"name",
			"file",
			"html",
			"current"
		],
		data : [
			[
			 	"what",
				"What are Privacy Icons?",
				"index.php"
			],
			[
			 	"who",
				"Who uses Privacy Icons?",
				"index.php"
			],
			[
				"icons",
				"The Icons",
				"the-icons.php"
			],
			[
				"news",
				"The News",
				"news.php"
			],
			[
				"involved",
				"Get Involved",
				"get-involved.php"
			]
		]
	},
	state: {
		page : {
			id : "what",
			num : 0,
			width: 3000,
			hash: "index.php",
			name: ""
		},
		old_page : {
			id : "",
			num: 0,
			width: 3000,
			hash: "",
			name: ""
		}
	},
	settings: {
		frame: (jQuery.browser.webkit) ? 'body' : 'html'
	},
	init: function() {		
		var self = this;
		
		if (Modernizr.history) {

			var History = window.History;
			if ( !History.enabled ) {
				return false;
			}
			else {	
			
				var self = this;
				
				self.transformPagesArray();
				
				self.loadPages();
				self.prepareNav();
	//			self.createContextualNav();
				
				History.Adapter.bind(window,'statechange',function() {
					var state = History.getState();
					History.log("Pop, pop!", state.data);
					
					if (self.isEmpty(state.data.id)) {
						var el = $("nav .what a");
					}
					else {
						var el = $("nav ." + state.data.id + " a");
					}
					
					self.updateState(el);	
				});		
			}
		}
		
		self.prepareIcons();
		self.revealFooterNav();
	},
	transformPagesArray: function() {
		// Get the array
		// Turn it into an object with child-objects
		var schema = this.pages.schema;
		var pages = this.pages.data;
		var pages_array = [];
		
		for (var i=0;i<pages.length;i++) {			
			// Create new page object
			var temp_obj = {};
			
			// Populate temp object
			for (var j=0; j<schema.length; j++) {
				temp_obj[schema[j]] = pages[i][j];				
			}
			
			// Attach page object to array of pages
			pages_array.push(temp_obj);
		}
		this.named_pages = pages_array;
	},
	loadPages: function() {
		var self = this;
		
		// Find out what page we're on.
		var page = $("body").attr("id");
		page = page.split("-page");		
		self.state.page.id = page[0];
				
		// Populate list of pages
		$.each(self.named_pages, function(index, page) {
			if (page.id == self.state.page.id) {
				page.html = $("#" + self.state.page.id);
				self.state.page.num = index;
				page.current = true;
			}
			else {
				page.html = $("<li id=\"" + page.id + "\" class=\"" + page.id + " page\"><div class='page-body'>&nbsp;</div></li>");
				page.current = false;
			}
		});
		
		// Replace existing list with new, full list.
		var $ul = $("<ul>");
		$.each(self.named_pages, function(index, page) {
			$ul.append(page.html);
		});
		$(".pages>ul").replaceWith($ul);
		
		// Position page
		self.moveSlider();
		
		// Fill pages
		$.each(self.named_pages, function(index, page) {
			if (page.current == false) {
				$.ajax({
					url: "fragments/" + page.id + ".html",
					success: function(html){
						$("#" + page.id + " .page-body").html(html);
						self.captureIconsTeaser();
						self.captureContextualNav();
					}
				});				
			}
		});		
	},
	prepareNav: function() {
		var self = this;
		
		$("nav a, .logo a").click(function(event) {
			self.updateState(this);			
			self.updateURL();
			event.preventDefault();
		});		
	},
	prepareIcons: function() {
		$(".download-link").click(function(event) {
			
			var $download_link = $(this);
			var $download = $download_link.parent();
			var $download_content = $download.find(".download-content");
			var $close = $download.find(".close");
			
			$download_link.slideUp(function() {
				$download_content.slideDown(function() {
					$download.css("position", "relative");
					$close.fadeIn();
					$close.click(function(event) {
						$close.fadeOut(function() {
							$download.css("position", "static");
							$download_content.slideUp(function() {
								$download_link.slideDown();
							});
						});
						event.preventDefault();
					});
				});
			});
			
			event.preventDefault();
		});
	},
	captureContextualNav: function() {
		var self = this;
		
		$(".contextual-nav").click(function(event) {
			self.updateState(this);
			self.updateURL();
			event.preventDefault();			
		});
	},
	captureIconsTeaser: function() {
		var self = this;
		
		$(".icons-teaser").click(function(event) {
			self.updateState(this);
			self.updateURL();
			event.preventDefault();			
		});
	},
	moveSlider: function() {
		var self = this;
	
		var transition = Modernizr.prefixed('transition');
		
		// Update duration constant
		// Number of pages to travel * 0.5
		var duration = Math.sqrt(Math.abs(self.state.page.num - self.state.old_page.num)) * 0.8;	
		
		// Translate left, right
		var offset = self.state.page.num * self.state.page.width;
		
		$(".pages>ul").css(transition, "margin " + duration + "s");
		
		$(".pages>ul").css("margin-left", "-" + offset + "px");		
		
		$(self.settings.frame).animate({
			scrollTop: 0
		}, "fast");
		
		self.fixPageHeight();
	},
	fixPageHeight: function() {
		var self = this;
		// Update height of containing element
			// Get height of new page
			var page_height = $("#" + self.state.page.id + " .page-body").outerHeight();
			// Set height of UL to that of new page		
			$(".pages>ul").height(page_height);
	},
	updateState: function(el) {
		
		var self = this;
		var num, name;
		var hash = $(el).attr("href");
		var id = $(el).attr("data-target");			
		
		$.each(self.named_pages, function(index, page) {
			if (page.id == id) {
				num = index;
				name = page.name;
			}
		});		
		
		// Save state as old state
		self.state.old_page.id = self.state.page.id;
		self.state.old_page.num = self.state.page.num;
		self.state.old_page.width = self.state.page.width;
		self.state.old_page.hash = self.state.page.hash;
		self.state.old_page.name = self.state.page.name;
		
		// Update new state
		self.state.page.id = id;
		self.state.page.num = num;
		self.state.page.hash = hash;
		self.state.page.name = name;
		
		self.moveSlider();
		self.updateBody();
		self.updateFooterNav(el);
	},
	updateBody: function() {
		var self = this;
		$("body").removeClass().addClass(self.state.page.id + "-page").attr("id", self.state.page.id + "-page");
		$("title").html(self.state.page.name + " | Privacy Icons | Mozilla");
	},
	updateFooterNav: function()  {
		var self = this;
		$("nav li").removeClass("current");
		$("nav ." + self.state.page.id).addClass("current");		
	},
	revealFooterNav: function() {
		$("footer").css("display", "none");
		$("footer nav .current a").addClass("hide-indicator")
		$("footer").slideDown("default", function() {
			$("footer nav .current a").removeClass("hide-indicator");
		});
	},
	updateURL: function() {
		var self = this;
	    History.pushState(self.state.page, "", self.state.page.hash);
	},
	isEmpty: function(obj) {
		for (var prop in obj) {
			if(obj.hasOwnProperty(prop)) {
				return false;
			}
		}
		return true;
	}
}