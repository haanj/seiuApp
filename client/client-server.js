// simple express static server to host the site
require('express')()
  .use(require('express')
  .static(__dirname + '/public'))
  .listen(8080, () => console.log('up on 8080'));

