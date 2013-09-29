Simple backbone coding test based on the [todo app](http://todomvc.com/).

### [Click here to see it in action](http://basicallydan.github.io/backbone-todos-advanced/)

### Tasks

* ~~Add a global namespace~~
* ~~Add a description field~~
 * ~~Additional input element~~
 * ~~Hidden normally~~
 * ~~Unhide somehow~~
 * ~~Make it look pretty!~~
* ~~Re-write using handlebars.js~~
* ~~Discuss why this might not work in IE~~

### Why might this not work in IE?

IE's support for the localStorage API is limited to being available in versions 8 and above. Since the storage of this app relies on localStorage, it won't work in IE if you're using anything below IE8. The most obvious solution is to use cookies to achieve this functionality, though it is a little heavy-handed for cookies. There's also IE's [userData API](http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx) which appears to be the ugliest thing ever concieved by man. Luckily, [Persist.js](http://pablotron.org/?cid=1557) has a nice abstraction available for all these things, and more hacky solutions for when localStorage isn't available for some reason.

There are a few visual features which won't work so well in older versions of IE:

* Shadows in the text areas
* Rounded corners
* using calc() in CSS for one of the elements - although, there is a fallback to a percentage width which will work fine
* There's a CSS3 Animation to fade something from green to black, it won't work below IE10 but I've made sure the element using it will be black by default

Generally, it should looks just fine.