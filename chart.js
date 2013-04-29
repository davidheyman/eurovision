var votes;
var countries = [];
var values = [];
var start = 1975;
var end = 2010;
var playing;
var hover;
var names = { "GBR": "United Kingdom", "IRL": "Ireland", "SWE": "Sweden", "FRA": "France", "DEU": "Germany", "GRC": "Greece", "NOR": "Norway", "ISR": "Israel", "ESP": "Spain", "TUR": "Turkey", "DNK": "Denmark", "CHE": "Switzerland", "RUS": "Russia", "NLD": "Netherlands", "MLT": "Malta", "BEL": "Belgium", "ITA": "Italy", "CYP": "Cyprus", "ISL": "Iceland", "UKR": "Ukraine", "AUT": "Austria", "FIN": "Finland", "BIH": "Bosnia and Herzegovina", "HRV": "Croatia", "PRT": "Portugal", "LUX": "Luxembourg", "EST": "Estonia", "ROU": "Romania", "ARM": "Armenia", "LVA": "Latvia", "SRB": "Serbia", "POL": "Poland", "AZE": "Azerbaijan", "SVN": "Slovenia", "MNE": "Montenegro", "HUN": "Hungary", "MDA": "Moldova", "MCO": "Monaco", "GEO": "Georgia", "ALB": "Albania", "MKD": "Macedonia", "LTU": "Lithuania", "BLR": "Belarus", "BGR": "Bulgaria", "SVK": "Slovakia" };

$( document ).ready( function()
{
	for( var y = 1975; y <= 2010; y++ )
	{
		var t = $( document.createElement( 'div' ) )
			.attr({
				"id" : y,
				"class" : "year"
			})
			.html( y.toString().substr( -2 ) )
			.appendTo( $( "#timeline" ) )
			.mousedown( function()
			{
				$( ".year" ).removeClass( "starts ends span" );
				$( "#play" ).removeClass( "playing" );
				window.clearInterval( playing );
				
				start = parseInt( $( this ).attr( "id" ), 10 );
				end = parseInt( $( this ).attr( "id" ), 10 );
				$( this ).addClass( "starts" );
				$( ".year" ).mouseover( function()
				{
					$( ".ends" ).removeClass( "ends" );
					$( ".span" ).removeClass( "span" );
					$( this ).addClass( "ends" );
						
					end = parseInt( $( this ).attr( "id" ), 10 );
					if( end > start ){
						$( ".starts" ).nextUntil( ".ends" ).addClass( "span" );
					}
					else{
						$( ".starts" ).prevUntil( ".ends" ).addClass( "span" );
					}
					update_chart( Math.min( start, end ), Math.max( start, end ) );
				});
				$( window ).mouseup( function()
				{
					$( ".year" ).unbind( "mouseover" ).unbind( "mouseout" );
					update_chart( Math.min( start, end ), Math.max( start, end ) );
				});
			});
		if( y == 1975 || y == 2010 )
		{
			t.addClass( "starts" );
		}
		else
		{
			t.addClass( "span" );
		}
	}
	
	$( "#play" ).toggle( function(){
		$( this ).addClass( "playing" )
		end = start;
		$( ".year" ).removeClass( "starts ends span" );
		$( "#" + start ).addClass( 'starts' );
		update_chart( start, end );
		playing = window.setInterval( "playback()", 500 );
	}, function(){
		if( $( this ).hasClass( "playing" ) )
		{
			$( this ).removeClass( "playing" );
			window.clearInterval( playing );
		}
		else
		{
			$( this ).trigger( "click" );
		}
	});
	
	$( "#switch a:not(.on)" ).live( "click", function()
	{
		file = "votes.json";
		if( $( this ).html() == "geographically" )
		{
			file = "votes_geo.json";
		}
		
		$( "#switch a.on" )
			.removeClass( "on" )
			.attr( "href", "#" );
		
		$( this )
			.addClass( "on" )
			.removeAttr( "href" );
		
		$( "#grid" ).empty();
		countries = [];
		
		$.getJSON( file, function( json )
		{
			votes = json;
			init_chart();
		});
	});
	
	$.getJSON( "votes_geo.json", function( json )
	{
		votes = json;
		init_chart();
	});
});

function init_chart()
{
	$( "#grid" ).mouseout( function()
	{
		$( "#probe" ).hide();
		$( ".active" ).removeClass( "active" );
		hover = null;
	});

	for( var c in votes )
	{
		countries.push( c );
		
		$( document.createElement( 'div' ) )
			.addClass( "label top " + c )
			.html( c )
			.appendTo( $( "#grid" ) );
	}
	for( var i = 0; i < countries.length; i++ )
	{
		$( document.createElement( 'div' ) )
			.addClass( "label side " + countries[ i ] )
			.html( countries[ i ] )
			.appendTo( $( "#grid" ) );
			
		for( var j = 0; j < countries.length; j++ )
		{
			$( document.createElement( 'div' ) )
				.attr({
					"id" : countries[ i ] + "_" + countries[ j ],
					"class" : "box",
					"name" : "0"
				})
				.appendTo( $( "#grid" ) )
				.mouseover( grid_hover );
		}
	}
	$( "#grid" ).append( "<div style='clear:both'></div>" );
	update_chart( Math.min( start, end ), Math.max( start, end ) );
}

function playback(){
	if( start > 2010 ) start = end = 1975;
	$( '.starts' ).removeClass( 'starts' )
	$( "#" + start ).addClass( 'starts' );
	update_chart( start, end );
	if( hover) hover.trigger( "mouseover" );
	start++;
	end++;
}

function update_chart( start, end )
{
	$( ".inactive" ).removeClass( "inactive" );
	var max = 0;
	for( var g in votes )
	{
		var ex = true;
		for( var r in votes[ g ] )
		{
			var total = 0;
			for( var y in votes[ g ][ r ] )
			{
				var year = parseInt( y, 10 );
				if( year >= start && year <= end && votes[ g ][ r ][ y ] )
				{
					total += votes[ g ][ r ][ y ];
					ex = false;
				}
			}
			$( "#" + g + "_" + r ).attr( "name", total );
			max = Math.max( max, total );
		}
	}
	
	var b = max / 8;
	
	$( ".box:not( .inactive )" ).each( function()
	{
		var v = parseInt( $( this ).attr( "name" ), 10 );
		$( this ).attr( "class", "box c" + Math.round( v / b ) );
	})
}

function grid_hover()
{
	hover = $( this );
	$( ".active" ).removeClass( "active" );
	var id = $( this ).attr( "id" );
	$( this ).addClass( "active" );
	var a = id.split( "_" );
	$( "#" + a[ 1 ] + "_" + a[ 0 ] ).addClass( "active" );
	
	$( "#probe" )
		.show()
		.empty()
		.append( names[ a[ 0 ] ] + " &rarr; " + names[ a[ 1 ] ] + "<div class='value'>" + $( this ).attr( "name" ) + "</div><br />" + names[ a[ 1 ] ] + " &rarr; " + names[ a[ 0 ] ] + "<div class='value'>" + $( "#" + a[ 1 ] + "_" + a[ 0 ] ).attr( "name" ) + "</div>" )
		.css( $( this ).offset() );
	
}