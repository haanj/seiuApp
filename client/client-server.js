require('express')()
  .use(require('express')
  .static(__dirname + '/public'))
  .listen(8080, () => console.log('up on 8080'));
