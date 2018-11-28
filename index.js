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
    fun(this.resolve.bind(this), this.reject.bind(this));
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

  then(fun1, fun2) {
    if (this.state === 'fulfilled') {
      let ret;
      try {
        ret = fun1(this.value);
      } catch (error) {
        return P.reject(error);
      }
      if (ret instanceof P) {
        return ret;
      } else {
        return P.resolve(ret);
      }
    }
    if (this.state === 'rejected') {
      if(!fun2) return P.reject(this.error);
      let ret;
      try {
        ret = fun2(this.error);
      } catch (error) {
        return P.reject(error)     
      }
      if (ret instanceof P) {
        return ret;
      } else {
        return P.resolve(ret);
      }
    } 
    if (this.state === 'pending') {
      return new P((resolve, reject) => {
        this.thenFunc = (value) => {
          let ret;
          try {
            ret = fun1(value);
          } catch (error) {
            return reject(error);
          }
          if (ret instanceof P) {
            ret.then(resolve, reject)
          } else {
            resolve(ret);
          }
        }
        this.catchFunc = (err) => {
          if (!fun2) {
            return reject(err);
          }
          let ret;
          try {
            ret = fun2(err);
          } catch (error) {
            return reject(error);
          }
          if (ret instanceof P) {
            ret.then(resolve, reject)
          } else {
            resolve(ret);
          }
        }
      })
    }
  }

  catch(fun) {
    if (this.state === 'rejected') {
      let ret;
      try {
        ret = fun(this.error);
      } catch (error) {
        return P.reject(error);
      }
      if (ret instanceof P) {
        return ret;
      } else {
        return P.resolve(ret);
      }
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
          let ret;
          try {
            ret = fun(err)
          } catch (error) {
            return reject(error);
          }
          if (ret instanceof P) {
            ret.then(resolve, reject)
          } else {
            resolve(ret);
          }
        }
      })
    }
  }
}

module.exports = P;