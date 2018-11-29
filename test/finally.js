const P = require('../index');

let isLoading = true;

P.resolve({
  ok: false,
})
.then(function(res) {
  if (res.ok) {
    return {data: 'data'}
  }
  throw new TypeError("Oops, we haven't got JSON!");
})
.then(function(json) { console.log('json: ', json)})
.catch(function(error) { console.log(error); })
.finally(function() {
  isLoading = false; 
  console.log("isLoading: ", isLoading)
});