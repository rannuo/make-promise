const P = require('../index');

new P((resolve, reject) => {
  setTimeout(() => {
    reject('a')
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
  console.log('name: ', name);
  return P.reject('c')
})
.then(c => {
  console.log('then c: ', c);
})
.catch(c => {
  console.log('catched c: ', c);
})

// output: 
// err:  a
// name:  lero
// catched c:  c