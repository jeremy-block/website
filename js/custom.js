! function (a) {
	"use strict";
	a(".element").each(function () {
		var t = a(this);
		t.typed({
			strings: t.attr("data-elements").split(",")
			, typeSpeed: 100
			, backDelay: 3e3
			, showCursor: false
			, typeSpeed: 70
			, backDelay: 1000
		})
	})
}(jQuery);