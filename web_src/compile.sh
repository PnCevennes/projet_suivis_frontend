#!/bin/bash

here=`dirname $0`

browserify $here/core/core.js -o $here/../web/js/core.app.js
browserify $here/chiro/chiro.js -o $here/../web/js/chiro.app.js

