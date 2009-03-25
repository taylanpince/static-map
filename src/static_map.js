/*
*	Static Map
*	A JS class for rendering static Google Maps and loading dynamic maps on the fly
*	
*	Requires jQuery library (http://www.jquery.com),
*   jQuery.Class plug-in (http://github.com/taylanpince/jquery-class)
*	
*	Taylan Pince (taylanpince at gmail dot com) - October 24, 2008
*/

$.namespace("core.StaticMap");

core.StaticMap = $.Class.extend({
    
    url_template : "http://maps.google.com/staticmap?key=%(api_key)&amp;center=%(center)&amp;markers=%(markers)&amp;size=%(size)&amp;format=png8",
    api_template : "http://www.google.com/jsapi?key=%(api_key)",
    marker_template : "%(media_path)static_map/images/markers/%(number).png",
    image_template : '<a href="javascript:void(0);" title="%(launch_copy)"><img src="%(map_url)" alt="Static Map" /><span class="map-link">%(launch_copy)</span></a>',
    loader_template : '<div class="map-loader"><img src="%(media_path)static_map/images/loader.gif" alt="Map Loader" /></div>',
    info_template : '<h3>%(title)</h3>%(description)',
    
    launch_copy : "Launch Interactive Map",
    
    selector : "",
    size : [300, 300],
    center : [0, 0],
    zoom : 14,
    markers : [],
    media_path : "",
    
    render_template : function(template, values) {
        for (val in values) {
            var re = new RegExp("%\\(" + val + "\\)", "g");
            
            template = template.replace(re, values[val]);
        }
        
        return template;
    },
    
    clean_variable : function(val, delimiter) {
        if (val.charAt(val.length - 1) == delimiter) {
            val = val.substring(0, (val.length - 1));
        }
        
        return val;
    },
    
    build_url : function() {
        var center = this.center[0] + "," + this.center[1];
        
        var markers = "";
        
        if (this.markers.length > 0) {
            for (var m in this.markers) {
                markers += this.markers[m].coordinates;
            
                if (this.markers.length > 1 || center != this.markers[m].coordinates) {
                    markers += ",red" + (parseInt(m) + 1) + "|";
                }
            }
        }
        
        var url = this.render_template(this.url_template, {
            "api_key" : this.api_key,
            "size" : this.size[0] + "x" + this.size[1],
            "center" : center,
            "markers" : this.clean_variable(markers, "|")
        });
        
        url += "&amp;zoom=" + this.zoom;
        
        return url;
    },
    
    draw_static_map : function() {
        $(this.selector).html(this.render_template(this.image_template, {
            "map_url" : this.build_url(),
            "launch_copy" : this.launch_copy
        })).find("a").click(this.launch_interactive_map.bind(this));
    },
    
    draw_interactive_map : function() {
        var gmap = new google.maps.Map2($(this.selector).get(0));
        var gcenter = new google.maps.LatLng(this.center[0], this.center[1]);
        var gbounds = new google.maps.LatLngBounds();
        
        gbounds.extend(gcenter);
        gmap.setCenter(gcenter);
        gmap.addControl(new google.maps.SmallMapControl());
        
        for (var m = 0; m < this.markers.length; m++) {
            var gpoint = new google.maps.LatLng(this.markers[m].coordinates[0], this.markers[m].coordinates[1]);
            var gmarker = new google.maps.Marker(gpoint, {
                "icon" : new google.maps.Icon(google.maps.DEFAULT_ICON, this.render_template(this.marker_template, {
                    "media_path": this.media_path,
                    "number": ((this.markers.length == 1 && gcenter.equals(gpoint)) ? "dot" : (parseInt(m) + 1))
                }))
            });
            
            if (typeof this.markers[m].title || typeof this.markers[m].description) {
                gmarker.bindInfoWindowHtml(this.render_template(this.info_template, {
                    "title" : this.markers[m].title,
                    "description" : this.markers[m].description
                }), {
                    "maxWidth" : (parseInt(this.size[0]) - 100)
                });
            }
            
            gmap.addOverlay(gmarker);
            gbounds.extend(gpoint);
        }
        
        gmap.setZoom(gmap.getBoundsZoomLevel(gbounds) - 1);
    },
    
    load_interactive_map : function() {
        if (typeof google == "object") {
            google.load("maps", "2", {
                "callback" : this.draw_interactive_map.bind(this)
            });
        } else {
            this.draw_static_map();
            
            alert("There was an error while loading the interactive map. We are sorry for the inconvenience.");
        }
    },
    
    launch_interactive_map : function() {
        this.show_loader();
        
        if (typeof google == "object") {
            this.load_interactive_map();
        } else {
            $.getScript(this.render_template(this.api_template, {
                "api_key": this.api_key
            }), this.load_interactive_map.bind(this));
        }
        
        return false;
    },
    
    show_loader : function() {
        $(this.selector).append(this.render_template(this.loader_template, {
            "media_path": this.media_path
        }));
    },
    
    hide_loader : function() {
        $(this.selector).find(".map-loader").remove();
    },
    
    init : function(selector, options) {
        this.selector = selector;
        
        $(this.selector).addClass("static-map");
        
        if (options) {
            for (opt in options) {
                this[opt] = options[opt];
            }
        }
        
        this.draw_static_map();
    }
    
});
