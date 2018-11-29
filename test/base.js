const P = require('../index');

new P((resolve, reject) => {
  setTimeout(() => {
    resolve('a')
  }, 1000)
})
.then(a => {
  console.log('a: ', a)
  return P.resolve('b');
})
.then(b => {
  console.log('b: ', b);
  throw 'error';
})
.catch(err => {
  console.log('err: ', err)
  return 'lero'
})
.then(name => {
  console.log('name: ',name)
  return 'c';
})
.then(c => {
  console.log('c: ', c)
})

// output: 
// a:  a
// b:  b
// err:  error
// name:  lero
// c:  c