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
  return 'c';
})
.then(c => {
  console.log('c: ', c);
  return new P(resolve => {
    setTimeout(() => {
      resolve('d')
    }, 300);
  })
})
.then(d => {
  console.log('d: ', d);
})


// output: 
// a:  a
// b:  b
// c:  c
// d:  d