Simple backbone coding test based on the [todo app](http://todomvc.com/).

### Tasks

* -Add a global namespace-
* -Add a description field-
 * -Additional input element-
 * -Hidden normally-
 * -Unhide somehow-
 * -Make it look pretty!-
* -Re-write using handlebars.js-
* -Discuss why this might not work in IE-

### Why might this not work in IE?

IE's support for the localStorage API is limited to being available in versions 8 and above. Since the storage of this app relies on localStorage, it won't work in IE if you're using anything below IE8.

There are a few visual features which won't work so well in older versions of IE:

* Shadows in the text areas
* Rounded corners
* using calc() in CSS for one of the elements - although, there is a fallback to a percentage width which will work fine

Generally, however, it should looks just fine.