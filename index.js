class P {

  static resolve(value) {
    return new P(resolve => resolve(value));
  }

  static reject(error) {
    return new P((resolve, reject) => reject(error));
  }
  /**
   * 
   * @param {P[]} ps 
   */
  static all(ps) {
    if (ps.length <= 0) {
      return P.resolve([])
    }
    return new P((resolve, reject) => {
      const length = ps.length;
      const result = new Array(length);
      let count = 0;
      let hasSettled = false;

      function settle(v, i) {
        if (!hasSettled) {
          count++;
          result[i] = v;
          if (count === length) {
            hasSettled = true;
            resolve(result);
          }
        }
      }
      for (let i = 0; i < length; i++) {
        const p = ps[i];
        if (p instanceof P) {
          p
          .then(v => {
            settle(v, i);
          })
          .catch(e => {
            if (!hasSettled) {
              hasSettled = true;
              reject(e);
            }
          });
        } else {
          settle(p, i);
        }
      }
    });
  }

  /**
   * 
   * @param {P[]} ps 
   */
  static race(ps) {
    return new Promise((resolve, reject) => {
      let settled = false;
      function settle(v, rfunc) {
        if (!settled) {
          settled = true;
          rfunc(v);
        }
      }
      for (let i = 0, length = ps.length; i < length; i++) {
        const p = ps[i];
        p
        .then(v => {
          settle(v, resolve);
        })
        .catch(e => {
          settle(e, reject);
        });
      }
    })
  }

  /**
   * @type {'pending' | 'fulfilled' | 'rejected'}
   */
  // state;
  // 值
  // value;
  // 错误
  // error;

  // 两个回调
  // thenFunc
  // catchFunc

  constructor(fun) {
    this.state = 'pending';
    try {
      fun(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error)
    }
  }

  resolve(value) {
    this.state = 'fulfilled';
    this.value = value;
    if (this.thenFunc) {
      this.thenFunc(this.value);
    }
  }

  reject(error) {
    this.state = 'rejected';
    this.error = error;
    if (this.catchFunc) {
      this.catchFunc(this.error);
    }
  }

  _settle(fun, data) {
    let ret;
    try {
      ret = fun(data);
    } catch (error) {
      return P.reject(error);
    }
    if (ret instanceof P) {
      return ret;
    } else {
      return P.resolve(ret);
    }
  }

  _settleFromPending(fun, data, resolve, reject) {
    let ret;
    try {
      ret = fun(data);
    } catch (error) {
      return reject(error);
    }
    if (ret instanceof P) {
      ret.then(resolve, reject)
    } else {
      resolve(ret);
    }
  }

  then(fun1, fun2) {
    if (this.state === 'fulfilled') {
      return this._settle(fun1, this.value);
    }
    if (this.state === 'rejected') {
      if(!fun2) return P.reject(this.error);
      return this._settle(fun2, this.error);
    } 
    if (this.state === 'pending') {
      return new P((resolve, reject) => {
        this.thenFunc = (value) => {
          this._settleFromPending(fun1, value, resolve, reject);
        }
        this.catchFunc = (err) => {
          if (!fun2) {
            return reject(err);
          }
          this._settleFromPending(fun2, err, resolve, reject)
        }
      })
    }
  }

  catch(fun) {
    if (this.state === 'rejected') {
      return this._settle(fun, this.error);
    }
    if (this.state === 'fulfilled') {
      return P.resolve(this.value);
    }
    if (this.state === 'pending') {
      return new P((resolve, reject) => {
        this.thenFunc = (value) => {
          resolve(value);
        }
        this.catchFunc = (err) => {
          return this._settleFromPending(fun, err, resolve, reject);
        }
      })
    }
  }
}

module.exports = P;