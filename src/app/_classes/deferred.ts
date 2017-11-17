export class Deferred<T> {
  private _resolve: (val?: T) => void;
  private _reject: (err?: any) => void;
  private _promise = new Promise<T>((res: (val?: T) => void, rej: (err?: any) => void) => {
    this._resolve = res;
    this._reject = rej;
  });

  public get promise() {
    return this._promise;
  }

  public resolve(val?: T) {
    val ? this._resolve(val) : this._resolve();
  }

  public reject(err: any) {
    err ? this._reject(err) : this._reject(err);
  }
}
