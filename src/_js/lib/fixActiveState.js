define(['metrics'], function(metric){
	$(function(){
	    if (metric.cache.ua.ios) {
	      document.body.addEventListener('touchstart', function () {}, false);
	    }
	});
});