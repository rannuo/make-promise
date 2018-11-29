class P {

  static resolve(value) {
    return new P(resolve => resolve(value));
  }

  static reject(error) {
    return new P((resolve, reject) => reject(error));
  }

  /**
   * @type {'pending' | 'fulfilled' | 'rejected'}
   */
  // state;
  // value;
  // error;

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