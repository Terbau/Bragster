
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Receipt
 * 
 */
export type Receipt = $Result.DefaultSelection<Prisma.$ReceiptPayload>
/**
 * Model ReceiptItemGroup
 * 
 */
export type ReceiptItemGroup = $Result.DefaultSelection<Prisma.$ReceiptItemGroupPayload>
/**
 * Model ReceiptItem
 * 
 */
export type ReceiptItem = $Result.DefaultSelection<Prisma.$ReceiptItemPayload>
/**
 * Model ReceiptItemSupplement
 * 
 */
export type ReceiptItemSupplement = $Result.DefaultSelection<Prisma.$ReceiptItemSupplementPayload>
/**
 * Model ReceiptItemGroupTranslation
 * 
 */
export type ReceiptItemGroupTranslation = $Result.DefaultSelection<Prisma.$ReceiptItemGroupTranslationPayload>
/**
 * Model ReceiptItemSupplementTranslation
 * 
 */
export type ReceiptItemSupplementTranslation = $Result.DefaultSelection<Prisma.$ReceiptItemSupplementTranslationPayload>
/**
 * Model SmartReceipt
 * 
 */
export type SmartReceipt = $Result.DefaultSelection<Prisma.$SmartReceiptPayload>
/**
 * Model SmartReceiptPayment
 * 
 */
export type SmartReceiptPayment = $Result.DefaultSelection<Prisma.$SmartReceiptPaymentPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.receipt`: Exposes CRUD operations for the **Receipt** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Receipts
    * const receipts = await prisma.receipt.findMany()
    * ```
    */
  get receipt(): Prisma.ReceiptDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.receiptItemGroup`: Exposes CRUD operations for the **ReceiptItemGroup** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReceiptItemGroups
    * const receiptItemGroups = await prisma.receiptItemGroup.findMany()
    * ```
    */
  get receiptItemGroup(): Prisma.ReceiptItemGroupDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.receiptItem`: Exposes CRUD operations for the **ReceiptItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReceiptItems
    * const receiptItems = await prisma.receiptItem.findMany()
    * ```
    */
  get receiptItem(): Prisma.ReceiptItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.receiptItemSupplement`: Exposes CRUD operations for the **ReceiptItemSupplement** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReceiptItemSupplements
    * const receiptItemSupplements = await prisma.receiptItemSupplement.findMany()
    * ```
    */
  get receiptItemSupplement(): Prisma.ReceiptItemSupplementDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.receiptItemGroupTranslation`: Exposes CRUD operations for the **ReceiptItemGroupTranslation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReceiptItemGroupTranslations
    * const receiptItemGroupTranslations = await prisma.receiptItemGroupTranslation.findMany()
    * ```
    */
  get receiptItemGroupTranslation(): Prisma.ReceiptItemGroupTranslationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.receiptItemSupplementTranslation`: Exposes CRUD operations for the **ReceiptItemSupplementTranslation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReceiptItemSupplementTranslations
    * const receiptItemSupplementTranslations = await prisma.receiptItemSupplementTranslation.findMany()
    * ```
    */
  get receiptItemSupplementTranslation(): Prisma.ReceiptItemSupplementTranslationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.smartReceipt`: Exposes CRUD operations for the **SmartReceipt** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SmartReceipts
    * const smartReceipts = await prisma.smartReceipt.findMany()
    * ```
    */
  get smartReceipt(): Prisma.SmartReceiptDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.smartReceiptPayment`: Exposes CRUD operations for the **SmartReceiptPayment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SmartReceiptPayments
    * const smartReceiptPayments = await prisma.smartReceiptPayment.findMany()
    * ```
    */
  get smartReceiptPayment(): Prisma.SmartReceiptPaymentDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.8.2
   * Query Engine version: 2060c79ba17c6bb9f5823312b6f6b7f4a845738e
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Receipt: 'Receipt',
    ReceiptItemGroup: 'ReceiptItemGroup',
    ReceiptItem: 'ReceiptItem',
    ReceiptItemSupplement: 'ReceiptItemSupplement',
    ReceiptItemGroupTranslation: 'ReceiptItemGroupTranslation',
    ReceiptItemSupplementTranslation: 'ReceiptItemSupplementTranslation',
    SmartReceipt: 'SmartReceipt',
    SmartReceiptPayment: 'SmartReceiptPayment'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "receipt" | "receiptItemGroup" | "receiptItem" | "receiptItemSupplement" | "receiptItemGroupTranslation" | "receiptItemSupplementTranslation" | "smartReceipt" | "smartReceiptPayment"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Receipt: {
        payload: Prisma.$ReceiptPayload<ExtArgs>
        fields: Prisma.ReceiptFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReceiptFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReceiptFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptPayload>
          }
          findFirst: {
            args: Prisma.ReceiptFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReceiptFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptPayload>
          }
          findMany: {
            args: Prisma.ReceiptFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptPayload>[]
          }
          create: {
            args: Prisma.ReceiptCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptPayload>
          }
          createMany: {
            args: Prisma.ReceiptCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReceiptCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptPayload>[]
          }
          delete: {
            args: Prisma.ReceiptDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptPayload>
          }
          update: {
            args: Prisma.ReceiptUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptPayload>
          }
          deleteMany: {
            args: Prisma.ReceiptDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReceiptUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReceiptUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptPayload>[]
          }
          upsert: {
            args: Prisma.ReceiptUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptPayload>
          }
          aggregate: {
            args: Prisma.ReceiptAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReceipt>
          }
          groupBy: {
            args: Prisma.ReceiptGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReceiptGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReceiptCountArgs<ExtArgs>
            result: $Utils.Optional<ReceiptCountAggregateOutputType> | number
          }
        }
      }
      ReceiptItemGroup: {
        payload: Prisma.$ReceiptItemGroupPayload<ExtArgs>
        fields: Prisma.ReceiptItemGroupFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReceiptItemGroupFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReceiptItemGroupFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupPayload>
          }
          findFirst: {
            args: Prisma.ReceiptItemGroupFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReceiptItemGroupFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupPayload>
          }
          findMany: {
            args: Prisma.ReceiptItemGroupFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupPayload>[]
          }
          create: {
            args: Prisma.ReceiptItemGroupCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupPayload>
          }
          createMany: {
            args: Prisma.ReceiptItemGroupCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReceiptItemGroupCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupPayload>[]
          }
          delete: {
            args: Prisma.ReceiptItemGroupDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupPayload>
          }
          update: {
            args: Prisma.ReceiptItemGroupUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupPayload>
          }
          deleteMany: {
            args: Prisma.ReceiptItemGroupDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReceiptItemGroupUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReceiptItemGroupUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupPayload>[]
          }
          upsert: {
            args: Prisma.ReceiptItemGroupUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupPayload>
          }
          aggregate: {
            args: Prisma.ReceiptItemGroupAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReceiptItemGroup>
          }
          groupBy: {
            args: Prisma.ReceiptItemGroupGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReceiptItemGroupGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReceiptItemGroupCountArgs<ExtArgs>
            result: $Utils.Optional<ReceiptItemGroupCountAggregateOutputType> | number
          }
        }
      }
      ReceiptItem: {
        payload: Prisma.$ReceiptItemPayload<ExtArgs>
        fields: Prisma.ReceiptItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReceiptItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReceiptItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemPayload>
          }
          findFirst: {
            args: Prisma.ReceiptItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReceiptItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemPayload>
          }
          findMany: {
            args: Prisma.ReceiptItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemPayload>[]
          }
          create: {
            args: Prisma.ReceiptItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemPayload>
          }
          createMany: {
            args: Prisma.ReceiptItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReceiptItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemPayload>[]
          }
          delete: {
            args: Prisma.ReceiptItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemPayload>
          }
          update: {
            args: Prisma.ReceiptItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemPayload>
          }
          deleteMany: {
            args: Prisma.ReceiptItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReceiptItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReceiptItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemPayload>[]
          }
          upsert: {
            args: Prisma.ReceiptItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemPayload>
          }
          aggregate: {
            args: Prisma.ReceiptItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReceiptItem>
          }
          groupBy: {
            args: Prisma.ReceiptItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReceiptItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReceiptItemCountArgs<ExtArgs>
            result: $Utils.Optional<ReceiptItemCountAggregateOutputType> | number
          }
        }
      }
      ReceiptItemSupplement: {
        payload: Prisma.$ReceiptItemSupplementPayload<ExtArgs>
        fields: Prisma.ReceiptItemSupplementFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReceiptItemSupplementFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReceiptItemSupplementFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementPayload>
          }
          findFirst: {
            args: Prisma.ReceiptItemSupplementFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReceiptItemSupplementFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementPayload>
          }
          findMany: {
            args: Prisma.ReceiptItemSupplementFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementPayload>[]
          }
          create: {
            args: Prisma.ReceiptItemSupplementCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementPayload>
          }
          createMany: {
            args: Prisma.ReceiptItemSupplementCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReceiptItemSupplementCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementPayload>[]
          }
          delete: {
            args: Prisma.ReceiptItemSupplementDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementPayload>
          }
          update: {
            args: Prisma.ReceiptItemSupplementUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementPayload>
          }
          deleteMany: {
            args: Prisma.ReceiptItemSupplementDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReceiptItemSupplementUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReceiptItemSupplementUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementPayload>[]
          }
          upsert: {
            args: Prisma.ReceiptItemSupplementUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementPayload>
          }
          aggregate: {
            args: Prisma.ReceiptItemSupplementAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReceiptItemSupplement>
          }
          groupBy: {
            args: Prisma.ReceiptItemSupplementGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReceiptItemSupplementGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReceiptItemSupplementCountArgs<ExtArgs>
            result: $Utils.Optional<ReceiptItemSupplementCountAggregateOutputType> | number
          }
        }
      }
      ReceiptItemGroupTranslation: {
        payload: Prisma.$ReceiptItemGroupTranslationPayload<ExtArgs>
        fields: Prisma.ReceiptItemGroupTranslationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReceiptItemGroupTranslationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupTranslationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReceiptItemGroupTranslationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupTranslationPayload>
          }
          findFirst: {
            args: Prisma.ReceiptItemGroupTranslationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupTranslationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReceiptItemGroupTranslationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupTranslationPayload>
          }
          findMany: {
            args: Prisma.ReceiptItemGroupTranslationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupTranslationPayload>[]
          }
          create: {
            args: Prisma.ReceiptItemGroupTranslationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupTranslationPayload>
          }
          createMany: {
            args: Prisma.ReceiptItemGroupTranslationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReceiptItemGroupTranslationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupTranslationPayload>[]
          }
          delete: {
            args: Prisma.ReceiptItemGroupTranslationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupTranslationPayload>
          }
          update: {
            args: Prisma.ReceiptItemGroupTranslationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupTranslationPayload>
          }
          deleteMany: {
            args: Prisma.ReceiptItemGroupTranslationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReceiptItemGroupTranslationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReceiptItemGroupTranslationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupTranslationPayload>[]
          }
          upsert: {
            args: Prisma.ReceiptItemGroupTranslationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemGroupTranslationPayload>
          }
          aggregate: {
            args: Prisma.ReceiptItemGroupTranslationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReceiptItemGroupTranslation>
          }
          groupBy: {
            args: Prisma.ReceiptItemGroupTranslationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReceiptItemGroupTranslationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReceiptItemGroupTranslationCountArgs<ExtArgs>
            result: $Utils.Optional<ReceiptItemGroupTranslationCountAggregateOutputType> | number
          }
        }
      }
      ReceiptItemSupplementTranslation: {
        payload: Prisma.$ReceiptItemSupplementTranslationPayload<ExtArgs>
        fields: Prisma.ReceiptItemSupplementTranslationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReceiptItemSupplementTranslationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementTranslationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReceiptItemSupplementTranslationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementTranslationPayload>
          }
          findFirst: {
            args: Prisma.ReceiptItemSupplementTranslationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementTranslationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReceiptItemSupplementTranslationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementTranslationPayload>
          }
          findMany: {
            args: Prisma.ReceiptItemSupplementTranslationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementTranslationPayload>[]
          }
          create: {
            args: Prisma.ReceiptItemSupplementTranslationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementTranslationPayload>
          }
          createMany: {
            args: Prisma.ReceiptItemSupplementTranslationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReceiptItemSupplementTranslationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementTranslationPayload>[]
          }
          delete: {
            args: Prisma.ReceiptItemSupplementTranslationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementTranslationPayload>
          }
          update: {
            args: Prisma.ReceiptItemSupplementTranslationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementTranslationPayload>
          }
          deleteMany: {
            args: Prisma.ReceiptItemSupplementTranslationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReceiptItemSupplementTranslationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReceiptItemSupplementTranslationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementTranslationPayload>[]
          }
          upsert: {
            args: Prisma.ReceiptItemSupplementTranslationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiptItemSupplementTranslationPayload>
          }
          aggregate: {
            args: Prisma.ReceiptItemSupplementTranslationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReceiptItemSupplementTranslation>
          }
          groupBy: {
            args: Prisma.ReceiptItemSupplementTranslationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReceiptItemSupplementTranslationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReceiptItemSupplementTranslationCountArgs<ExtArgs>
            result: $Utils.Optional<ReceiptItemSupplementTranslationCountAggregateOutputType> | number
          }
        }
      }
      SmartReceipt: {
        payload: Prisma.$SmartReceiptPayload<ExtArgs>
        fields: Prisma.SmartReceiptFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SmartReceiptFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SmartReceiptFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPayload>
          }
          findFirst: {
            args: Prisma.SmartReceiptFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SmartReceiptFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPayload>
          }
          findMany: {
            args: Prisma.SmartReceiptFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPayload>[]
          }
          create: {
            args: Prisma.SmartReceiptCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPayload>
          }
          createMany: {
            args: Prisma.SmartReceiptCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SmartReceiptCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPayload>[]
          }
          delete: {
            args: Prisma.SmartReceiptDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPayload>
          }
          update: {
            args: Prisma.SmartReceiptUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPayload>
          }
          deleteMany: {
            args: Prisma.SmartReceiptDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SmartReceiptUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SmartReceiptUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPayload>[]
          }
          upsert: {
            args: Prisma.SmartReceiptUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPayload>
          }
          aggregate: {
            args: Prisma.SmartReceiptAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSmartReceipt>
          }
          groupBy: {
            args: Prisma.SmartReceiptGroupByArgs<ExtArgs>
            result: $Utils.Optional<SmartReceiptGroupByOutputType>[]
          }
          count: {
            args: Prisma.SmartReceiptCountArgs<ExtArgs>
            result: $Utils.Optional<SmartReceiptCountAggregateOutputType> | number
          }
        }
      }
      SmartReceiptPayment: {
        payload: Prisma.$SmartReceiptPaymentPayload<ExtArgs>
        fields: Prisma.SmartReceiptPaymentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SmartReceiptPaymentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPaymentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SmartReceiptPaymentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPaymentPayload>
          }
          findFirst: {
            args: Prisma.SmartReceiptPaymentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPaymentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SmartReceiptPaymentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPaymentPayload>
          }
          findMany: {
            args: Prisma.SmartReceiptPaymentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPaymentPayload>[]
          }
          create: {
            args: Prisma.SmartReceiptPaymentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPaymentPayload>
          }
          createMany: {
            args: Prisma.SmartReceiptPaymentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SmartReceiptPaymentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPaymentPayload>[]
          }
          delete: {
            args: Prisma.SmartReceiptPaymentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPaymentPayload>
          }
          update: {
            args: Prisma.SmartReceiptPaymentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPaymentPayload>
          }
          deleteMany: {
            args: Prisma.SmartReceiptPaymentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SmartReceiptPaymentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SmartReceiptPaymentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPaymentPayload>[]
          }
          upsert: {
            args: Prisma.SmartReceiptPaymentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SmartReceiptPaymentPayload>
          }
          aggregate: {
            args: Prisma.SmartReceiptPaymentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSmartReceiptPayment>
          }
          groupBy: {
            args: Prisma.SmartReceiptPaymentGroupByArgs<ExtArgs>
            result: $Utils.Optional<SmartReceiptPaymentGroupByOutputType>[]
          }
          count: {
            args: Prisma.SmartReceiptPaymentCountArgs<ExtArgs>
            result: $Utils.Optional<SmartReceiptPaymentCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    receipt?: ReceiptOmit
    receiptItemGroup?: ReceiptItemGroupOmit
    receiptItem?: ReceiptItemOmit
    receiptItemSupplement?: ReceiptItemSupplementOmit
    receiptItemGroupTranslation?: ReceiptItemGroupTranslationOmit
    receiptItemSupplementTranslation?: ReceiptItemSupplementTranslationOmit
    smartReceipt?: SmartReceiptOmit
    smartReceiptPayment?: SmartReceiptPaymentOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    receipts: number
    payments: number
    smartReceipts: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receipts?: boolean | UserCountOutputTypeCountReceiptsArgs
    payments?: boolean | UserCountOutputTypeCountPaymentsArgs
    smartReceipts?: boolean | UserCountOutputTypeCountSmartReceiptsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountReceiptsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceiptWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPaymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SmartReceiptPaymentWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSmartReceiptsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SmartReceiptWhereInput
  }


  /**
   * Count Type ReceiptCountOutputType
   */

  export type ReceiptCountOutputType = {
    itemGroups: number
    smartReceipts: number
  }

  export type ReceiptCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    itemGroups?: boolean | ReceiptCountOutputTypeCountItemGroupsArgs
    smartReceipts?: boolean | ReceiptCountOutputTypeCountSmartReceiptsArgs
  }

  // Custom InputTypes
  /**
   * ReceiptCountOutputType without action
   */
  export type ReceiptCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptCountOutputType
     */
    select?: ReceiptCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ReceiptCountOutputType without action
   */
  export type ReceiptCountOutputTypeCountItemGroupsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceiptItemGroupWhereInput
  }

  /**
   * ReceiptCountOutputType without action
   */
  export type ReceiptCountOutputTypeCountSmartReceiptsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SmartReceiptWhereInput
  }


  /**
   * Count Type ReceiptItemGroupCountOutputType
   */

  export type ReceiptItemGroupCountOutputType = {
    items: number
    translations: number
  }

  export type ReceiptItemGroupCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | ReceiptItemGroupCountOutputTypeCountItemsArgs
    translations?: boolean | ReceiptItemGroupCountOutputTypeCountTranslationsArgs
  }

  // Custom InputTypes
  /**
   * ReceiptItemGroupCountOutputType without action
   */
  export type ReceiptItemGroupCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroupCountOutputType
     */
    select?: ReceiptItemGroupCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ReceiptItemGroupCountOutputType without action
   */
  export type ReceiptItemGroupCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceiptItemWhereInput
  }

  /**
   * ReceiptItemGroupCountOutputType without action
   */
  export type ReceiptItemGroupCountOutputTypeCountTranslationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceiptItemGroupTranslationWhereInput
  }


  /**
   * Count Type ReceiptItemCountOutputType
   */

  export type ReceiptItemCountOutputType = {
    supplements: number
    smartPayments: number
  }

  export type ReceiptItemCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    supplements?: boolean | ReceiptItemCountOutputTypeCountSupplementsArgs
    smartPayments?: boolean | ReceiptItemCountOutputTypeCountSmartPaymentsArgs
  }

  // Custom InputTypes
  /**
   * ReceiptItemCountOutputType without action
   */
  export type ReceiptItemCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemCountOutputType
     */
    select?: ReceiptItemCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ReceiptItemCountOutputType without action
   */
  export type ReceiptItemCountOutputTypeCountSupplementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceiptItemSupplementWhereInput
  }

  /**
   * ReceiptItemCountOutputType without action
   */
  export type ReceiptItemCountOutputTypeCountSmartPaymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SmartReceiptPaymentWhereInput
  }


  /**
   * Count Type ReceiptItemSupplementCountOutputType
   */

  export type ReceiptItemSupplementCountOutputType = {
    translations: number
  }

  export type ReceiptItemSupplementCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    translations?: boolean | ReceiptItemSupplementCountOutputTypeCountTranslationsArgs
  }

  // Custom InputTypes
  /**
   * ReceiptItemSupplementCountOutputType without action
   */
  export type ReceiptItemSupplementCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplementCountOutputType
     */
    select?: ReceiptItemSupplementCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ReceiptItemSupplementCountOutputType without action
   */
  export type ReceiptItemSupplementCountOutputTypeCountTranslationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceiptItemSupplementTranslationWhereInput
  }


  /**
   * Count Type SmartReceiptCountOutputType
   */

  export type SmartReceiptCountOutputType = {
    users: number
    payments: number
  }

  export type SmartReceiptCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | SmartReceiptCountOutputTypeCountUsersArgs
    payments?: boolean | SmartReceiptCountOutputTypeCountPaymentsArgs
  }

  // Custom InputTypes
  /**
   * SmartReceiptCountOutputType without action
   */
  export type SmartReceiptCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptCountOutputType
     */
    select?: SmartReceiptCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SmartReceiptCountOutputType without action
   */
  export type SmartReceiptCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * SmartReceiptCountOutputType without action
   */
  export type SmartReceiptCountOutputTypeCountPaymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SmartReceiptPaymentWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    createdAt: Date | null
    avatarUrl: string | null
    admin: boolean | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    createdAt: Date | null
    avatarUrl: string | null
    admin: boolean | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    createdAt: number
    avatarUrl: number
    admin: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    createdAt?: true
    avatarUrl?: true
    admin?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    createdAt?: true
    avatarUrl?: true
    admin?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    createdAt?: true
    avatarUrl?: true
    admin?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    createdAt: Date
    avatarUrl: string | null
    admin: boolean
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    createdAt?: boolean
    avatarUrl?: boolean
    admin?: boolean
    receipts?: boolean | User$receiptsArgs<ExtArgs>
    payments?: boolean | User$paymentsArgs<ExtArgs>
    smartReceipts?: boolean | User$smartReceiptsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    createdAt?: boolean
    avatarUrl?: boolean
    admin?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    createdAt?: boolean
    avatarUrl?: boolean
    admin?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    createdAt?: boolean
    avatarUrl?: boolean
    admin?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "createdAt" | "avatarUrl" | "admin", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receipts?: boolean | User$receiptsArgs<ExtArgs>
    payments?: boolean | User$paymentsArgs<ExtArgs>
    smartReceipts?: boolean | User$smartReceiptsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      receipts: Prisma.$ReceiptPayload<ExtArgs>[]
      payments: Prisma.$SmartReceiptPaymentPayload<ExtArgs>[]
      smartReceipts: Prisma.$SmartReceiptPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      createdAt: Date
      avatarUrl: string | null
      admin: boolean
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    receipts<T extends User$receiptsArgs<ExtArgs> = {}>(args?: Subset<T, User$receiptsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    payments<T extends User$paymentsArgs<ExtArgs> = {}>(args?: Subset<T, User$paymentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SmartReceiptPaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    smartReceipts<T extends User$smartReceiptsArgs<ExtArgs> = {}>(args?: Subset<T, User$smartReceiptsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SmartReceiptPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly avatarUrl: FieldRef<"User", 'String'>
    readonly admin: FieldRef<"User", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.receipts
   */
  export type User$receiptsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receipt
     */
    select?: ReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receipt
     */
    omit?: ReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptInclude<ExtArgs> | null
    where?: ReceiptWhereInput
    orderBy?: ReceiptOrderByWithRelationInput | ReceiptOrderByWithRelationInput[]
    cursor?: ReceiptWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReceiptScalarFieldEnum | ReceiptScalarFieldEnum[]
  }

  /**
   * User.payments
   */
  export type User$paymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentInclude<ExtArgs> | null
    where?: SmartReceiptPaymentWhereInput
    orderBy?: SmartReceiptPaymentOrderByWithRelationInput | SmartReceiptPaymentOrderByWithRelationInput[]
    cursor?: SmartReceiptPaymentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SmartReceiptPaymentScalarFieldEnum | SmartReceiptPaymentScalarFieldEnum[]
  }

  /**
   * User.smartReceipts
   */
  export type User$smartReceiptsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptInclude<ExtArgs> | null
    where?: SmartReceiptWhereInput
    orderBy?: SmartReceiptOrderByWithRelationInput | SmartReceiptOrderByWithRelationInput[]
    cursor?: SmartReceiptWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SmartReceiptScalarFieldEnum | SmartReceiptScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Receipt
   */

  export type AggregateReceipt = {
    _count: ReceiptCountAggregateOutputType | null
    _avg: ReceiptAvgAggregateOutputType | null
    _sum: ReceiptSumAggregateOutputType | null
    _min: ReceiptMinAggregateOutputType | null
    _max: ReceiptMaxAggregateOutputType | null
  }

  export type ReceiptAvgAggregateOutputType = {
    totalPrice: number | null
  }

  export type ReceiptSumAggregateOutputType = {
    totalPrice: number | null
  }

  export type ReceiptMinAggregateOutputType = {
    id: string | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    merchantName: string | null
    receiptType: string | null
    receiptDate: Date | null
    totalPrice: number | null
    currencyCode: string | null
  }

  export type ReceiptMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    merchantName: string | null
    receiptType: string | null
    receiptDate: Date | null
    totalPrice: number | null
    currencyCode: string | null
  }

  export type ReceiptCountAggregateOutputType = {
    id: number
    userId: number
    createdAt: number
    updatedAt: number
    merchantName: number
    receiptType: number
    receiptDate: number
    totalPrice: number
    currencyCode: number
    _all: number
  }


  export type ReceiptAvgAggregateInputType = {
    totalPrice?: true
  }

  export type ReceiptSumAggregateInputType = {
    totalPrice?: true
  }

  export type ReceiptMinAggregateInputType = {
    id?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
    merchantName?: true
    receiptType?: true
    receiptDate?: true
    totalPrice?: true
    currencyCode?: true
  }

  export type ReceiptMaxAggregateInputType = {
    id?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
    merchantName?: true
    receiptType?: true
    receiptDate?: true
    totalPrice?: true
    currencyCode?: true
  }

  export type ReceiptCountAggregateInputType = {
    id?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
    merchantName?: true
    receiptType?: true
    receiptDate?: true
    totalPrice?: true
    currencyCode?: true
    _all?: true
  }

  export type ReceiptAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Receipt to aggregate.
     */
    where?: ReceiptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Receipts to fetch.
     */
    orderBy?: ReceiptOrderByWithRelationInput | ReceiptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReceiptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Receipts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Receipts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Receipts
    **/
    _count?: true | ReceiptCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReceiptAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReceiptSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReceiptMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReceiptMaxAggregateInputType
  }

  export type GetReceiptAggregateType<T extends ReceiptAggregateArgs> = {
        [P in keyof T & keyof AggregateReceipt]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReceipt[P]>
      : GetScalarType<T[P], AggregateReceipt[P]>
  }




  export type ReceiptGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceiptWhereInput
    orderBy?: ReceiptOrderByWithAggregationInput | ReceiptOrderByWithAggregationInput[]
    by: ReceiptScalarFieldEnum[] | ReceiptScalarFieldEnum
    having?: ReceiptScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReceiptCountAggregateInputType | true
    _avg?: ReceiptAvgAggregateInputType
    _sum?: ReceiptSumAggregateInputType
    _min?: ReceiptMinAggregateInputType
    _max?: ReceiptMaxAggregateInputType
  }

  export type ReceiptGroupByOutputType = {
    id: string
    userId: string
    createdAt: Date
    updatedAt: Date
    merchantName: string
    receiptType: string | null
    receiptDate: Date | null
    totalPrice: number
    currencyCode: string | null
    _count: ReceiptCountAggregateOutputType | null
    _avg: ReceiptAvgAggregateOutputType | null
    _sum: ReceiptSumAggregateOutputType | null
    _min: ReceiptMinAggregateOutputType | null
    _max: ReceiptMaxAggregateOutputType | null
  }

  type GetReceiptGroupByPayload<T extends ReceiptGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReceiptGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReceiptGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReceiptGroupByOutputType[P]>
            : GetScalarType<T[P], ReceiptGroupByOutputType[P]>
        }
      >
    >


  export type ReceiptSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    merchantName?: boolean
    receiptType?: boolean
    receiptDate?: boolean
    totalPrice?: boolean
    currencyCode?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    itemGroups?: boolean | Receipt$itemGroupsArgs<ExtArgs>
    smartReceipts?: boolean | Receipt$smartReceiptsArgs<ExtArgs>
    _count?: boolean | ReceiptCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receipt"]>

  export type ReceiptSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    merchantName?: boolean
    receiptType?: boolean
    receiptDate?: boolean
    totalPrice?: boolean
    currencyCode?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receipt"]>

  export type ReceiptSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    merchantName?: boolean
    receiptType?: boolean
    receiptDate?: boolean
    totalPrice?: boolean
    currencyCode?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receipt"]>

  export type ReceiptSelectScalar = {
    id?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    merchantName?: boolean
    receiptType?: boolean
    receiptDate?: boolean
    totalPrice?: boolean
    currencyCode?: boolean
  }

  export type ReceiptOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "createdAt" | "updatedAt" | "merchantName" | "receiptType" | "receiptDate" | "totalPrice" | "currencyCode", ExtArgs["result"]["receipt"]>
  export type ReceiptInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    itemGroups?: boolean | Receipt$itemGroupsArgs<ExtArgs>
    smartReceipts?: boolean | Receipt$smartReceiptsArgs<ExtArgs>
    _count?: boolean | ReceiptCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ReceiptIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ReceiptIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ReceiptPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Receipt"
    objects: {
      createdBy: Prisma.$UserPayload<ExtArgs>
      itemGroups: Prisma.$ReceiptItemGroupPayload<ExtArgs>[]
      smartReceipts: Prisma.$SmartReceiptPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      createdAt: Date
      updatedAt: Date
      merchantName: string
      receiptType: string | null
      receiptDate: Date | null
      totalPrice: number
      currencyCode: string | null
    }, ExtArgs["result"]["receipt"]>
    composites: {}
  }

  type ReceiptGetPayload<S extends boolean | null | undefined | ReceiptDefaultArgs> = $Result.GetResult<Prisma.$ReceiptPayload, S>

  type ReceiptCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReceiptFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReceiptCountAggregateInputType | true
    }

  export interface ReceiptDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Receipt'], meta: { name: 'Receipt' } }
    /**
     * Find zero or one Receipt that matches the filter.
     * @param {ReceiptFindUniqueArgs} args - Arguments to find a Receipt
     * @example
     * // Get one Receipt
     * const receipt = await prisma.receipt.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReceiptFindUniqueArgs>(args: SelectSubset<T, ReceiptFindUniqueArgs<ExtArgs>>): Prisma__ReceiptClient<$Result.GetResult<Prisma.$ReceiptPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Receipt that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReceiptFindUniqueOrThrowArgs} args - Arguments to find a Receipt
     * @example
     * // Get one Receipt
     * const receipt = await prisma.receipt.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReceiptFindUniqueOrThrowArgs>(args: SelectSubset<T, ReceiptFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReceiptClient<$Result.GetResult<Prisma.$ReceiptPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Receipt that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptFindFirstArgs} args - Arguments to find a Receipt
     * @example
     * // Get one Receipt
     * const receipt = await prisma.receipt.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReceiptFindFirstArgs>(args?: SelectSubset<T, ReceiptFindFirstArgs<ExtArgs>>): Prisma__ReceiptClient<$Result.GetResult<Prisma.$ReceiptPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Receipt that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptFindFirstOrThrowArgs} args - Arguments to find a Receipt
     * @example
     * // Get one Receipt
     * const receipt = await prisma.receipt.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReceiptFindFirstOrThrowArgs>(args?: SelectSubset<T, ReceiptFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReceiptClient<$Result.GetResult<Prisma.$ReceiptPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Receipts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Receipts
     * const receipts = await prisma.receipt.findMany()
     * 
     * // Get first 10 Receipts
     * const receipts = await prisma.receipt.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const receiptWithIdOnly = await prisma.receipt.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReceiptFindManyArgs>(args?: SelectSubset<T, ReceiptFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Receipt.
     * @param {ReceiptCreateArgs} args - Arguments to create a Receipt.
     * @example
     * // Create one Receipt
     * const Receipt = await prisma.receipt.create({
     *   data: {
     *     // ... data to create a Receipt
     *   }
     * })
     * 
     */
    create<T extends ReceiptCreateArgs>(args: SelectSubset<T, ReceiptCreateArgs<ExtArgs>>): Prisma__ReceiptClient<$Result.GetResult<Prisma.$ReceiptPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Receipts.
     * @param {ReceiptCreateManyArgs} args - Arguments to create many Receipts.
     * @example
     * // Create many Receipts
     * const receipt = await prisma.receipt.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReceiptCreateManyArgs>(args?: SelectSubset<T, ReceiptCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Receipts and returns the data saved in the database.
     * @param {ReceiptCreateManyAndReturnArgs} args - Arguments to create many Receipts.
     * @example
     * // Create many Receipts
     * const receipt = await prisma.receipt.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Receipts and only return the `id`
     * const receiptWithIdOnly = await prisma.receipt.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReceiptCreateManyAndReturnArgs>(args?: SelectSubset<T, ReceiptCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Receipt.
     * @param {ReceiptDeleteArgs} args - Arguments to delete one Receipt.
     * @example
     * // Delete one Receipt
     * const Receipt = await prisma.receipt.delete({
     *   where: {
     *     // ... filter to delete one Receipt
     *   }
     * })
     * 
     */
    delete<T extends ReceiptDeleteArgs>(args: SelectSubset<T, ReceiptDeleteArgs<ExtArgs>>): Prisma__ReceiptClient<$Result.GetResult<Prisma.$ReceiptPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Receipt.
     * @param {ReceiptUpdateArgs} args - Arguments to update one Receipt.
     * @example
     * // Update one Receipt
     * const receipt = await prisma.receipt.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReceiptUpdateArgs>(args: SelectSubset<T, ReceiptUpdateArgs<ExtArgs>>): Prisma__ReceiptClient<$Result.GetResult<Prisma.$ReceiptPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Receipts.
     * @param {ReceiptDeleteManyArgs} args - Arguments to filter Receipts to delete.
     * @example
     * // Delete a few Receipts
     * const { count } = await prisma.receipt.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReceiptDeleteManyArgs>(args?: SelectSubset<T, ReceiptDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Receipts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Receipts
     * const receipt = await prisma.receipt.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReceiptUpdateManyArgs>(args: SelectSubset<T, ReceiptUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Receipts and returns the data updated in the database.
     * @param {ReceiptUpdateManyAndReturnArgs} args - Arguments to update many Receipts.
     * @example
     * // Update many Receipts
     * const receipt = await prisma.receipt.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Receipts and only return the `id`
     * const receiptWithIdOnly = await prisma.receipt.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReceiptUpdateManyAndReturnArgs>(args: SelectSubset<T, ReceiptUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Receipt.
     * @param {ReceiptUpsertArgs} args - Arguments to update or create a Receipt.
     * @example
     * // Update or create a Receipt
     * const receipt = await prisma.receipt.upsert({
     *   create: {
     *     // ... data to create a Receipt
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Receipt we want to update
     *   }
     * })
     */
    upsert<T extends ReceiptUpsertArgs>(args: SelectSubset<T, ReceiptUpsertArgs<ExtArgs>>): Prisma__ReceiptClient<$Result.GetResult<Prisma.$ReceiptPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Receipts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptCountArgs} args - Arguments to filter Receipts to count.
     * @example
     * // Count the number of Receipts
     * const count = await prisma.receipt.count({
     *   where: {
     *     // ... the filter for the Receipts we want to count
     *   }
     * })
    **/
    count<T extends ReceiptCountArgs>(
      args?: Subset<T, ReceiptCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReceiptCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Receipt.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReceiptAggregateArgs>(args: Subset<T, ReceiptAggregateArgs>): Prisma.PrismaPromise<GetReceiptAggregateType<T>>

    /**
     * Group by Receipt.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReceiptGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReceiptGroupByArgs['orderBy'] }
        : { orderBy?: ReceiptGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReceiptGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReceiptGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Receipt model
   */
  readonly fields: ReceiptFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Receipt.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReceiptClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    createdBy<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    itemGroups<T extends Receipt$itemGroupsArgs<ExtArgs> = {}>(args?: Subset<T, Receipt$itemGroupsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemGroupPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    smartReceipts<T extends Receipt$smartReceiptsArgs<ExtArgs> = {}>(args?: Subset<T, Receipt$smartReceiptsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SmartReceiptPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Receipt model
   */
  interface ReceiptFieldRefs {
    readonly id: FieldRef<"Receipt", 'String'>
    readonly userId: FieldRef<"Receipt", 'String'>
    readonly createdAt: FieldRef<"Receipt", 'DateTime'>
    readonly updatedAt: FieldRef<"Receipt", 'DateTime'>
    readonly merchantName: FieldRef<"Receipt", 'String'>
    readonly receiptType: FieldRef<"Receipt", 'String'>
    readonly receiptDate: FieldRef<"Receipt", 'DateTime'>
    readonly totalPrice: FieldRef<"Receipt", 'Float'>
    readonly currencyCode: FieldRef<"Receipt", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Receipt findUnique
   */
  export type ReceiptFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receipt
     */
    select?: ReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receipt
     */
    omit?: ReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptInclude<ExtArgs> | null
    /**
     * Filter, which Receipt to fetch.
     */
    where: ReceiptWhereUniqueInput
  }

  /**
   * Receipt findUniqueOrThrow
   */
  export type ReceiptFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receipt
     */
    select?: ReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receipt
     */
    omit?: ReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptInclude<ExtArgs> | null
    /**
     * Filter, which Receipt to fetch.
     */
    where: ReceiptWhereUniqueInput
  }

  /**
   * Receipt findFirst
   */
  export type ReceiptFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receipt
     */
    select?: ReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receipt
     */
    omit?: ReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptInclude<ExtArgs> | null
    /**
     * Filter, which Receipt to fetch.
     */
    where?: ReceiptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Receipts to fetch.
     */
    orderBy?: ReceiptOrderByWithRelationInput | ReceiptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Receipts.
     */
    cursor?: ReceiptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Receipts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Receipts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Receipts.
     */
    distinct?: ReceiptScalarFieldEnum | ReceiptScalarFieldEnum[]
  }

  /**
   * Receipt findFirstOrThrow
   */
  export type ReceiptFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receipt
     */
    select?: ReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receipt
     */
    omit?: ReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptInclude<ExtArgs> | null
    /**
     * Filter, which Receipt to fetch.
     */
    where?: ReceiptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Receipts to fetch.
     */
    orderBy?: ReceiptOrderByWithRelationInput | ReceiptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Receipts.
     */
    cursor?: ReceiptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Receipts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Receipts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Receipts.
     */
    distinct?: ReceiptScalarFieldEnum | ReceiptScalarFieldEnum[]
  }

  /**
   * Receipt findMany
   */
  export type ReceiptFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receipt
     */
    select?: ReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receipt
     */
    omit?: ReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptInclude<ExtArgs> | null
    /**
     * Filter, which Receipts to fetch.
     */
    where?: ReceiptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Receipts to fetch.
     */
    orderBy?: ReceiptOrderByWithRelationInput | ReceiptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Receipts.
     */
    cursor?: ReceiptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Receipts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Receipts.
     */
    skip?: number
    distinct?: ReceiptScalarFieldEnum | ReceiptScalarFieldEnum[]
  }

  /**
   * Receipt create
   */
  export type ReceiptCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receipt
     */
    select?: ReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receipt
     */
    omit?: ReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptInclude<ExtArgs> | null
    /**
     * The data needed to create a Receipt.
     */
    data: XOR<ReceiptCreateInput, ReceiptUncheckedCreateInput>
  }

  /**
   * Receipt createMany
   */
  export type ReceiptCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Receipts.
     */
    data: ReceiptCreateManyInput | ReceiptCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Receipt createManyAndReturn
   */
  export type ReceiptCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receipt
     */
    select?: ReceiptSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Receipt
     */
    omit?: ReceiptOmit<ExtArgs> | null
    /**
     * The data used to create many Receipts.
     */
    data: ReceiptCreateManyInput | ReceiptCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Receipt update
   */
  export type ReceiptUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receipt
     */
    select?: ReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receipt
     */
    omit?: ReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptInclude<ExtArgs> | null
    /**
     * The data needed to update a Receipt.
     */
    data: XOR<ReceiptUpdateInput, ReceiptUncheckedUpdateInput>
    /**
     * Choose, which Receipt to update.
     */
    where: ReceiptWhereUniqueInput
  }

  /**
   * Receipt updateMany
   */
  export type ReceiptUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Receipts.
     */
    data: XOR<ReceiptUpdateManyMutationInput, ReceiptUncheckedUpdateManyInput>
    /**
     * Filter which Receipts to update
     */
    where?: ReceiptWhereInput
    /**
     * Limit how many Receipts to update.
     */
    limit?: number
  }

  /**
   * Receipt updateManyAndReturn
   */
  export type ReceiptUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receipt
     */
    select?: ReceiptSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Receipt
     */
    omit?: ReceiptOmit<ExtArgs> | null
    /**
     * The data used to update Receipts.
     */
    data: XOR<ReceiptUpdateManyMutationInput, ReceiptUncheckedUpdateManyInput>
    /**
     * Filter which Receipts to update
     */
    where?: ReceiptWhereInput
    /**
     * Limit how many Receipts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Receipt upsert
   */
  export type ReceiptUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receipt
     */
    select?: ReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receipt
     */
    omit?: ReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptInclude<ExtArgs> | null
    /**
     * The filter to search for the Receipt to update in case it exists.
     */
    where: ReceiptWhereUniqueInput
    /**
     * In case the Receipt found by the `where` argument doesn't exist, create a new Receipt with this data.
     */
    create: XOR<ReceiptCreateInput, ReceiptUncheckedCreateInput>
    /**
     * In case the Receipt was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReceiptUpdateInput, ReceiptUncheckedUpdateInput>
  }

  /**
   * Receipt delete
   */
  export type ReceiptDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receipt
     */
    select?: ReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receipt
     */
    omit?: ReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptInclude<ExtArgs> | null
    /**
     * Filter which Receipt to delete.
     */
    where: ReceiptWhereUniqueInput
  }

  /**
   * Receipt deleteMany
   */
  export type ReceiptDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Receipts to delete
     */
    where?: ReceiptWhereInput
    /**
     * Limit how many Receipts to delete.
     */
    limit?: number
  }

  /**
   * Receipt.itemGroups
   */
  export type Receipt$itemGroupsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroup
     */
    select?: ReceiptItemGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroup
     */
    omit?: ReceiptItemGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupInclude<ExtArgs> | null
    where?: ReceiptItemGroupWhereInput
    orderBy?: ReceiptItemGroupOrderByWithRelationInput | ReceiptItemGroupOrderByWithRelationInput[]
    cursor?: ReceiptItemGroupWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReceiptItemGroupScalarFieldEnum | ReceiptItemGroupScalarFieldEnum[]
  }

  /**
   * Receipt.smartReceipts
   */
  export type Receipt$smartReceiptsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptInclude<ExtArgs> | null
    where?: SmartReceiptWhereInput
    orderBy?: SmartReceiptOrderByWithRelationInput | SmartReceiptOrderByWithRelationInput[]
    cursor?: SmartReceiptWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SmartReceiptScalarFieldEnum | SmartReceiptScalarFieldEnum[]
  }

  /**
   * Receipt without action
   */
  export type ReceiptDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receipt
     */
    select?: ReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receipt
     */
    omit?: ReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptInclude<ExtArgs> | null
  }


  /**
   * Model ReceiptItemGroup
   */

  export type AggregateReceiptItemGroup = {
    _count: ReceiptItemGroupCountAggregateOutputType | null
    _avg: ReceiptItemGroupAvgAggregateOutputType | null
    _sum: ReceiptItemGroupSumAggregateOutputType | null
    _min: ReceiptItemGroupMinAggregateOutputType | null
    _max: ReceiptItemGroupMaxAggregateOutputType | null
  }

  export type ReceiptItemGroupAvgAggregateOutputType = {
    price: number | null
    quantity: number | null
    unitPrice: number | null
  }

  export type ReceiptItemGroupSumAggregateOutputType = {
    price: number | null
    quantity: number | null
    unitPrice: number | null
  }

  export type ReceiptItemGroupMinAggregateOutputType = {
    id: string | null
    receiptId: string | null
    description: string | null
    price: number | null
    createdAt: Date | null
    updatedAt: Date | null
    quantity: number | null
    quantityUnit: string | null
    unitPrice: number | null
  }

  export type ReceiptItemGroupMaxAggregateOutputType = {
    id: string | null
    receiptId: string | null
    description: string | null
    price: number | null
    createdAt: Date | null
    updatedAt: Date | null
    quantity: number | null
    quantityUnit: string | null
    unitPrice: number | null
  }

  export type ReceiptItemGroupCountAggregateOutputType = {
    id: number
    receiptId: number
    description: number
    price: number
    createdAt: number
    updatedAt: number
    quantity: number
    quantityUnit: number
    unitPrice: number
    _all: number
  }


  export type ReceiptItemGroupAvgAggregateInputType = {
    price?: true
    quantity?: true
    unitPrice?: true
  }

  export type ReceiptItemGroupSumAggregateInputType = {
    price?: true
    quantity?: true
    unitPrice?: true
  }

  export type ReceiptItemGroupMinAggregateInputType = {
    id?: true
    receiptId?: true
    description?: true
    price?: true
    createdAt?: true
    updatedAt?: true
    quantity?: true
    quantityUnit?: true
    unitPrice?: true
  }

  export type ReceiptItemGroupMaxAggregateInputType = {
    id?: true
    receiptId?: true
    description?: true
    price?: true
    createdAt?: true
    updatedAt?: true
    quantity?: true
    quantityUnit?: true
    unitPrice?: true
  }

  export type ReceiptItemGroupCountAggregateInputType = {
    id?: true
    receiptId?: true
    description?: true
    price?: true
    createdAt?: true
    updatedAt?: true
    quantity?: true
    quantityUnit?: true
    unitPrice?: true
    _all?: true
  }

  export type ReceiptItemGroupAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReceiptItemGroup to aggregate.
     */
    where?: ReceiptItemGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemGroups to fetch.
     */
    orderBy?: ReceiptItemGroupOrderByWithRelationInput | ReceiptItemGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReceiptItemGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemGroups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReceiptItemGroups
    **/
    _count?: true | ReceiptItemGroupCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReceiptItemGroupAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReceiptItemGroupSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReceiptItemGroupMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReceiptItemGroupMaxAggregateInputType
  }

  export type GetReceiptItemGroupAggregateType<T extends ReceiptItemGroupAggregateArgs> = {
        [P in keyof T & keyof AggregateReceiptItemGroup]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReceiptItemGroup[P]>
      : GetScalarType<T[P], AggregateReceiptItemGroup[P]>
  }




  export type ReceiptItemGroupGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceiptItemGroupWhereInput
    orderBy?: ReceiptItemGroupOrderByWithAggregationInput | ReceiptItemGroupOrderByWithAggregationInput[]
    by: ReceiptItemGroupScalarFieldEnum[] | ReceiptItemGroupScalarFieldEnum
    having?: ReceiptItemGroupScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReceiptItemGroupCountAggregateInputType | true
    _avg?: ReceiptItemGroupAvgAggregateInputType
    _sum?: ReceiptItemGroupSumAggregateInputType
    _min?: ReceiptItemGroupMinAggregateInputType
    _max?: ReceiptItemGroupMaxAggregateInputType
  }

  export type ReceiptItemGroupGroupByOutputType = {
    id: string
    receiptId: string
    description: string
    price: number
    createdAt: Date
    updatedAt: Date
    quantity: number
    quantityUnit: string | null
    unitPrice: number
    _count: ReceiptItemGroupCountAggregateOutputType | null
    _avg: ReceiptItemGroupAvgAggregateOutputType | null
    _sum: ReceiptItemGroupSumAggregateOutputType | null
    _min: ReceiptItemGroupMinAggregateOutputType | null
    _max: ReceiptItemGroupMaxAggregateOutputType | null
  }

  type GetReceiptItemGroupGroupByPayload<T extends ReceiptItemGroupGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReceiptItemGroupGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReceiptItemGroupGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReceiptItemGroupGroupByOutputType[P]>
            : GetScalarType<T[P], ReceiptItemGroupGroupByOutputType[P]>
        }
      >
    >


  export type ReceiptItemGroupSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    receiptId?: boolean
    description?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    quantity?: boolean
    quantityUnit?: boolean
    unitPrice?: boolean
    receipt?: boolean | ReceiptDefaultArgs<ExtArgs>
    items?: boolean | ReceiptItemGroup$itemsArgs<ExtArgs>
    translations?: boolean | ReceiptItemGroup$translationsArgs<ExtArgs>
    _count?: boolean | ReceiptItemGroupCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItemGroup"]>

  export type ReceiptItemGroupSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    receiptId?: boolean
    description?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    quantity?: boolean
    quantityUnit?: boolean
    unitPrice?: boolean
    receipt?: boolean | ReceiptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItemGroup"]>

  export type ReceiptItemGroupSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    receiptId?: boolean
    description?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    quantity?: boolean
    quantityUnit?: boolean
    unitPrice?: boolean
    receipt?: boolean | ReceiptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItemGroup"]>

  export type ReceiptItemGroupSelectScalar = {
    id?: boolean
    receiptId?: boolean
    description?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    quantity?: boolean
    quantityUnit?: boolean
    unitPrice?: boolean
  }

  export type ReceiptItemGroupOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "receiptId" | "description" | "price" | "createdAt" | "updatedAt" | "quantity" | "quantityUnit" | "unitPrice", ExtArgs["result"]["receiptItemGroup"]>
  export type ReceiptItemGroupInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receipt?: boolean | ReceiptDefaultArgs<ExtArgs>
    items?: boolean | ReceiptItemGroup$itemsArgs<ExtArgs>
    translations?: boolean | ReceiptItemGroup$translationsArgs<ExtArgs>
    _count?: boolean | ReceiptItemGroupCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ReceiptItemGroupIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receipt?: boolean | ReceiptDefaultArgs<ExtArgs>
  }
  export type ReceiptItemGroupIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receipt?: boolean | ReceiptDefaultArgs<ExtArgs>
  }

  export type $ReceiptItemGroupPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReceiptItemGroup"
    objects: {
      receipt: Prisma.$ReceiptPayload<ExtArgs>
      items: Prisma.$ReceiptItemPayload<ExtArgs>[]
      translations: Prisma.$ReceiptItemGroupTranslationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      receiptId: string
      description: string
      price: number
      createdAt: Date
      updatedAt: Date
      quantity: number
      quantityUnit: string | null
      unitPrice: number
    }, ExtArgs["result"]["receiptItemGroup"]>
    composites: {}
  }

  type ReceiptItemGroupGetPayload<S extends boolean | null | undefined | ReceiptItemGroupDefaultArgs> = $Result.GetResult<Prisma.$ReceiptItemGroupPayload, S>

  type ReceiptItemGroupCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReceiptItemGroupFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReceiptItemGroupCountAggregateInputType | true
    }

  export interface ReceiptItemGroupDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReceiptItemGroup'], meta: { name: 'ReceiptItemGroup' } }
    /**
     * Find zero or one ReceiptItemGroup that matches the filter.
     * @param {ReceiptItemGroupFindUniqueArgs} args - Arguments to find a ReceiptItemGroup
     * @example
     * // Get one ReceiptItemGroup
     * const receiptItemGroup = await prisma.receiptItemGroup.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReceiptItemGroupFindUniqueArgs>(args: SelectSubset<T, ReceiptItemGroupFindUniqueArgs<ExtArgs>>): Prisma__ReceiptItemGroupClient<$Result.GetResult<Prisma.$ReceiptItemGroupPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReceiptItemGroup that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReceiptItemGroupFindUniqueOrThrowArgs} args - Arguments to find a ReceiptItemGroup
     * @example
     * // Get one ReceiptItemGroup
     * const receiptItemGroup = await prisma.receiptItemGroup.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReceiptItemGroupFindUniqueOrThrowArgs>(args: SelectSubset<T, ReceiptItemGroupFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReceiptItemGroupClient<$Result.GetResult<Prisma.$ReceiptItemGroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReceiptItemGroup that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupFindFirstArgs} args - Arguments to find a ReceiptItemGroup
     * @example
     * // Get one ReceiptItemGroup
     * const receiptItemGroup = await prisma.receiptItemGroup.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReceiptItemGroupFindFirstArgs>(args?: SelectSubset<T, ReceiptItemGroupFindFirstArgs<ExtArgs>>): Prisma__ReceiptItemGroupClient<$Result.GetResult<Prisma.$ReceiptItemGroupPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReceiptItemGroup that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupFindFirstOrThrowArgs} args - Arguments to find a ReceiptItemGroup
     * @example
     * // Get one ReceiptItemGroup
     * const receiptItemGroup = await prisma.receiptItemGroup.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReceiptItemGroupFindFirstOrThrowArgs>(args?: SelectSubset<T, ReceiptItemGroupFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReceiptItemGroupClient<$Result.GetResult<Prisma.$ReceiptItemGroupPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReceiptItemGroups that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReceiptItemGroups
     * const receiptItemGroups = await prisma.receiptItemGroup.findMany()
     * 
     * // Get first 10 ReceiptItemGroups
     * const receiptItemGroups = await prisma.receiptItemGroup.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const receiptItemGroupWithIdOnly = await prisma.receiptItemGroup.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReceiptItemGroupFindManyArgs>(args?: SelectSubset<T, ReceiptItemGroupFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemGroupPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReceiptItemGroup.
     * @param {ReceiptItemGroupCreateArgs} args - Arguments to create a ReceiptItemGroup.
     * @example
     * // Create one ReceiptItemGroup
     * const ReceiptItemGroup = await prisma.receiptItemGroup.create({
     *   data: {
     *     // ... data to create a ReceiptItemGroup
     *   }
     * })
     * 
     */
    create<T extends ReceiptItemGroupCreateArgs>(args: SelectSubset<T, ReceiptItemGroupCreateArgs<ExtArgs>>): Prisma__ReceiptItemGroupClient<$Result.GetResult<Prisma.$ReceiptItemGroupPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReceiptItemGroups.
     * @param {ReceiptItemGroupCreateManyArgs} args - Arguments to create many ReceiptItemGroups.
     * @example
     * // Create many ReceiptItemGroups
     * const receiptItemGroup = await prisma.receiptItemGroup.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReceiptItemGroupCreateManyArgs>(args?: SelectSubset<T, ReceiptItemGroupCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReceiptItemGroups and returns the data saved in the database.
     * @param {ReceiptItemGroupCreateManyAndReturnArgs} args - Arguments to create many ReceiptItemGroups.
     * @example
     * // Create many ReceiptItemGroups
     * const receiptItemGroup = await prisma.receiptItemGroup.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReceiptItemGroups and only return the `id`
     * const receiptItemGroupWithIdOnly = await prisma.receiptItemGroup.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReceiptItemGroupCreateManyAndReturnArgs>(args?: SelectSubset<T, ReceiptItemGroupCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemGroupPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ReceiptItemGroup.
     * @param {ReceiptItemGroupDeleteArgs} args - Arguments to delete one ReceiptItemGroup.
     * @example
     * // Delete one ReceiptItemGroup
     * const ReceiptItemGroup = await prisma.receiptItemGroup.delete({
     *   where: {
     *     // ... filter to delete one ReceiptItemGroup
     *   }
     * })
     * 
     */
    delete<T extends ReceiptItemGroupDeleteArgs>(args: SelectSubset<T, ReceiptItemGroupDeleteArgs<ExtArgs>>): Prisma__ReceiptItemGroupClient<$Result.GetResult<Prisma.$ReceiptItemGroupPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReceiptItemGroup.
     * @param {ReceiptItemGroupUpdateArgs} args - Arguments to update one ReceiptItemGroup.
     * @example
     * // Update one ReceiptItemGroup
     * const receiptItemGroup = await prisma.receiptItemGroup.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReceiptItemGroupUpdateArgs>(args: SelectSubset<T, ReceiptItemGroupUpdateArgs<ExtArgs>>): Prisma__ReceiptItemGroupClient<$Result.GetResult<Prisma.$ReceiptItemGroupPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReceiptItemGroups.
     * @param {ReceiptItemGroupDeleteManyArgs} args - Arguments to filter ReceiptItemGroups to delete.
     * @example
     * // Delete a few ReceiptItemGroups
     * const { count } = await prisma.receiptItemGroup.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReceiptItemGroupDeleteManyArgs>(args?: SelectSubset<T, ReceiptItemGroupDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReceiptItemGroups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReceiptItemGroups
     * const receiptItemGroup = await prisma.receiptItemGroup.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReceiptItemGroupUpdateManyArgs>(args: SelectSubset<T, ReceiptItemGroupUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReceiptItemGroups and returns the data updated in the database.
     * @param {ReceiptItemGroupUpdateManyAndReturnArgs} args - Arguments to update many ReceiptItemGroups.
     * @example
     * // Update many ReceiptItemGroups
     * const receiptItemGroup = await prisma.receiptItemGroup.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ReceiptItemGroups and only return the `id`
     * const receiptItemGroupWithIdOnly = await prisma.receiptItemGroup.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReceiptItemGroupUpdateManyAndReturnArgs>(args: SelectSubset<T, ReceiptItemGroupUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemGroupPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ReceiptItemGroup.
     * @param {ReceiptItemGroupUpsertArgs} args - Arguments to update or create a ReceiptItemGroup.
     * @example
     * // Update or create a ReceiptItemGroup
     * const receiptItemGroup = await prisma.receiptItemGroup.upsert({
     *   create: {
     *     // ... data to create a ReceiptItemGroup
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReceiptItemGroup we want to update
     *   }
     * })
     */
    upsert<T extends ReceiptItemGroupUpsertArgs>(args: SelectSubset<T, ReceiptItemGroupUpsertArgs<ExtArgs>>): Prisma__ReceiptItemGroupClient<$Result.GetResult<Prisma.$ReceiptItemGroupPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReceiptItemGroups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupCountArgs} args - Arguments to filter ReceiptItemGroups to count.
     * @example
     * // Count the number of ReceiptItemGroups
     * const count = await prisma.receiptItemGroup.count({
     *   where: {
     *     // ... the filter for the ReceiptItemGroups we want to count
     *   }
     * })
    **/
    count<T extends ReceiptItemGroupCountArgs>(
      args?: Subset<T, ReceiptItemGroupCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReceiptItemGroupCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReceiptItemGroup.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReceiptItemGroupAggregateArgs>(args: Subset<T, ReceiptItemGroupAggregateArgs>): Prisma.PrismaPromise<GetReceiptItemGroupAggregateType<T>>

    /**
     * Group by ReceiptItemGroup.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReceiptItemGroupGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReceiptItemGroupGroupByArgs['orderBy'] }
        : { orderBy?: ReceiptItemGroupGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReceiptItemGroupGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReceiptItemGroupGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReceiptItemGroup model
   */
  readonly fields: ReceiptItemGroupFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReceiptItemGroup.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReceiptItemGroupClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    receipt<T extends ReceiptDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReceiptDefaultArgs<ExtArgs>>): Prisma__ReceiptClient<$Result.GetResult<Prisma.$ReceiptPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    items<T extends ReceiptItemGroup$itemsArgs<ExtArgs> = {}>(args?: Subset<T, ReceiptItemGroup$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    translations<T extends ReceiptItemGroup$translationsArgs<ExtArgs> = {}>(args?: Subset<T, ReceiptItemGroup$translationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemGroupTranslationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReceiptItemGroup model
   */
  interface ReceiptItemGroupFieldRefs {
    readonly id: FieldRef<"ReceiptItemGroup", 'String'>
    readonly receiptId: FieldRef<"ReceiptItemGroup", 'String'>
    readonly description: FieldRef<"ReceiptItemGroup", 'String'>
    readonly price: FieldRef<"ReceiptItemGroup", 'Float'>
    readonly createdAt: FieldRef<"ReceiptItemGroup", 'DateTime'>
    readonly updatedAt: FieldRef<"ReceiptItemGroup", 'DateTime'>
    readonly quantity: FieldRef<"ReceiptItemGroup", 'Float'>
    readonly quantityUnit: FieldRef<"ReceiptItemGroup", 'String'>
    readonly unitPrice: FieldRef<"ReceiptItemGroup", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * ReceiptItemGroup findUnique
   */
  export type ReceiptItemGroupFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroup
     */
    select?: ReceiptItemGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroup
     */
    omit?: ReceiptItemGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemGroup to fetch.
     */
    where: ReceiptItemGroupWhereUniqueInput
  }

  /**
   * ReceiptItemGroup findUniqueOrThrow
   */
  export type ReceiptItemGroupFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroup
     */
    select?: ReceiptItemGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroup
     */
    omit?: ReceiptItemGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemGroup to fetch.
     */
    where: ReceiptItemGroupWhereUniqueInput
  }

  /**
   * ReceiptItemGroup findFirst
   */
  export type ReceiptItemGroupFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroup
     */
    select?: ReceiptItemGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroup
     */
    omit?: ReceiptItemGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemGroup to fetch.
     */
    where?: ReceiptItemGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemGroups to fetch.
     */
    orderBy?: ReceiptItemGroupOrderByWithRelationInput | ReceiptItemGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReceiptItemGroups.
     */
    cursor?: ReceiptItemGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemGroups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReceiptItemGroups.
     */
    distinct?: ReceiptItemGroupScalarFieldEnum | ReceiptItemGroupScalarFieldEnum[]
  }

  /**
   * ReceiptItemGroup findFirstOrThrow
   */
  export type ReceiptItemGroupFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroup
     */
    select?: ReceiptItemGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroup
     */
    omit?: ReceiptItemGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemGroup to fetch.
     */
    where?: ReceiptItemGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemGroups to fetch.
     */
    orderBy?: ReceiptItemGroupOrderByWithRelationInput | ReceiptItemGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReceiptItemGroups.
     */
    cursor?: ReceiptItemGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemGroups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReceiptItemGroups.
     */
    distinct?: ReceiptItemGroupScalarFieldEnum | ReceiptItemGroupScalarFieldEnum[]
  }

  /**
   * ReceiptItemGroup findMany
   */
  export type ReceiptItemGroupFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroup
     */
    select?: ReceiptItemGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroup
     */
    omit?: ReceiptItemGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemGroups to fetch.
     */
    where?: ReceiptItemGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemGroups to fetch.
     */
    orderBy?: ReceiptItemGroupOrderByWithRelationInput | ReceiptItemGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReceiptItemGroups.
     */
    cursor?: ReceiptItemGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemGroups.
     */
    skip?: number
    distinct?: ReceiptItemGroupScalarFieldEnum | ReceiptItemGroupScalarFieldEnum[]
  }

  /**
   * ReceiptItemGroup create
   */
  export type ReceiptItemGroupCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroup
     */
    select?: ReceiptItemGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroup
     */
    omit?: ReceiptItemGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupInclude<ExtArgs> | null
    /**
     * The data needed to create a ReceiptItemGroup.
     */
    data: XOR<ReceiptItemGroupCreateInput, ReceiptItemGroupUncheckedCreateInput>
  }

  /**
   * ReceiptItemGroup createMany
   */
  export type ReceiptItemGroupCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReceiptItemGroups.
     */
    data: ReceiptItemGroupCreateManyInput | ReceiptItemGroupCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReceiptItemGroup createManyAndReturn
   */
  export type ReceiptItemGroupCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroup
     */
    select?: ReceiptItemGroupSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroup
     */
    omit?: ReceiptItemGroupOmit<ExtArgs> | null
    /**
     * The data used to create many ReceiptItemGroups.
     */
    data: ReceiptItemGroupCreateManyInput | ReceiptItemGroupCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReceiptItemGroup update
   */
  export type ReceiptItemGroupUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroup
     */
    select?: ReceiptItemGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroup
     */
    omit?: ReceiptItemGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupInclude<ExtArgs> | null
    /**
     * The data needed to update a ReceiptItemGroup.
     */
    data: XOR<ReceiptItemGroupUpdateInput, ReceiptItemGroupUncheckedUpdateInput>
    /**
     * Choose, which ReceiptItemGroup to update.
     */
    where: ReceiptItemGroupWhereUniqueInput
  }

  /**
   * ReceiptItemGroup updateMany
   */
  export type ReceiptItemGroupUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReceiptItemGroups.
     */
    data: XOR<ReceiptItemGroupUpdateManyMutationInput, ReceiptItemGroupUncheckedUpdateManyInput>
    /**
     * Filter which ReceiptItemGroups to update
     */
    where?: ReceiptItemGroupWhereInput
    /**
     * Limit how many ReceiptItemGroups to update.
     */
    limit?: number
  }

  /**
   * ReceiptItemGroup updateManyAndReturn
   */
  export type ReceiptItemGroupUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroup
     */
    select?: ReceiptItemGroupSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroup
     */
    omit?: ReceiptItemGroupOmit<ExtArgs> | null
    /**
     * The data used to update ReceiptItemGroups.
     */
    data: XOR<ReceiptItemGroupUpdateManyMutationInput, ReceiptItemGroupUncheckedUpdateManyInput>
    /**
     * Filter which ReceiptItemGroups to update
     */
    where?: ReceiptItemGroupWhereInput
    /**
     * Limit how many ReceiptItemGroups to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReceiptItemGroup upsert
   */
  export type ReceiptItemGroupUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroup
     */
    select?: ReceiptItemGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroup
     */
    omit?: ReceiptItemGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupInclude<ExtArgs> | null
    /**
     * The filter to search for the ReceiptItemGroup to update in case it exists.
     */
    where: ReceiptItemGroupWhereUniqueInput
    /**
     * In case the ReceiptItemGroup found by the `where` argument doesn't exist, create a new ReceiptItemGroup with this data.
     */
    create: XOR<ReceiptItemGroupCreateInput, ReceiptItemGroupUncheckedCreateInput>
    /**
     * In case the ReceiptItemGroup was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReceiptItemGroupUpdateInput, ReceiptItemGroupUncheckedUpdateInput>
  }

  /**
   * ReceiptItemGroup delete
   */
  export type ReceiptItemGroupDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroup
     */
    select?: ReceiptItemGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroup
     */
    omit?: ReceiptItemGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupInclude<ExtArgs> | null
    /**
     * Filter which ReceiptItemGroup to delete.
     */
    where: ReceiptItemGroupWhereUniqueInput
  }

  /**
   * ReceiptItemGroup deleteMany
   */
  export type ReceiptItemGroupDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReceiptItemGroups to delete
     */
    where?: ReceiptItemGroupWhereInput
    /**
     * Limit how many ReceiptItemGroups to delete.
     */
    limit?: number
  }

  /**
   * ReceiptItemGroup.items
   */
  export type ReceiptItemGroup$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItem
     */
    select?: ReceiptItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItem
     */
    omit?: ReceiptItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemInclude<ExtArgs> | null
    where?: ReceiptItemWhereInput
    orderBy?: ReceiptItemOrderByWithRelationInput | ReceiptItemOrderByWithRelationInput[]
    cursor?: ReceiptItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReceiptItemScalarFieldEnum | ReceiptItemScalarFieldEnum[]
  }

  /**
   * ReceiptItemGroup.translations
   */
  export type ReceiptItemGroup$translationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroupTranslation
     */
    select?: ReceiptItemGroupTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroupTranslation
     */
    omit?: ReceiptItemGroupTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupTranslationInclude<ExtArgs> | null
    where?: ReceiptItemGroupTranslationWhereInput
    orderBy?: ReceiptItemGroupTranslationOrderByWithRelationInput | ReceiptItemGroupTranslationOrderByWithRelationInput[]
    cursor?: ReceiptItemGroupTranslationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReceiptItemGroupTranslationScalarFieldEnum | ReceiptItemGroupTranslationScalarFieldEnum[]
  }

  /**
   * ReceiptItemGroup without action
   */
  export type ReceiptItemGroupDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroup
     */
    select?: ReceiptItemGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroup
     */
    omit?: ReceiptItemGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupInclude<ExtArgs> | null
  }


  /**
   * Model ReceiptItem
   */

  export type AggregateReceiptItem = {
    _count: ReceiptItemCountAggregateOutputType | null
    _avg: ReceiptItemAvgAggregateOutputType | null
    _sum: ReceiptItemSumAggregateOutputType | null
    _min: ReceiptItemMinAggregateOutputType | null
    _max: ReceiptItemMaxAggregateOutputType | null
  }

  export type ReceiptItemAvgAggregateOutputType = {
    price: number | null
  }

  export type ReceiptItemSumAggregateOutputType = {
    price: number | null
  }

  export type ReceiptItemMinAggregateOutputType = {
    id: string | null
    itemGroupId: string | null
    price: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReceiptItemMaxAggregateOutputType = {
    id: string | null
    itemGroupId: string | null
    price: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReceiptItemCountAggregateOutputType = {
    id: number
    itemGroupId: number
    price: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ReceiptItemAvgAggregateInputType = {
    price?: true
  }

  export type ReceiptItemSumAggregateInputType = {
    price?: true
  }

  export type ReceiptItemMinAggregateInputType = {
    id?: true
    itemGroupId?: true
    price?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReceiptItemMaxAggregateInputType = {
    id?: true
    itemGroupId?: true
    price?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReceiptItemCountAggregateInputType = {
    id?: true
    itemGroupId?: true
    price?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ReceiptItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReceiptItem to aggregate.
     */
    where?: ReceiptItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItems to fetch.
     */
    orderBy?: ReceiptItemOrderByWithRelationInput | ReceiptItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReceiptItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReceiptItems
    **/
    _count?: true | ReceiptItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReceiptItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReceiptItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReceiptItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReceiptItemMaxAggregateInputType
  }

  export type GetReceiptItemAggregateType<T extends ReceiptItemAggregateArgs> = {
        [P in keyof T & keyof AggregateReceiptItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReceiptItem[P]>
      : GetScalarType<T[P], AggregateReceiptItem[P]>
  }




  export type ReceiptItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceiptItemWhereInput
    orderBy?: ReceiptItemOrderByWithAggregationInput | ReceiptItemOrderByWithAggregationInput[]
    by: ReceiptItemScalarFieldEnum[] | ReceiptItemScalarFieldEnum
    having?: ReceiptItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReceiptItemCountAggregateInputType | true
    _avg?: ReceiptItemAvgAggregateInputType
    _sum?: ReceiptItemSumAggregateInputType
    _min?: ReceiptItemMinAggregateInputType
    _max?: ReceiptItemMaxAggregateInputType
  }

  export type ReceiptItemGroupByOutputType = {
    id: string
    itemGroupId: string
    price: number
    createdAt: Date
    updatedAt: Date
    _count: ReceiptItemCountAggregateOutputType | null
    _avg: ReceiptItemAvgAggregateOutputType | null
    _sum: ReceiptItemSumAggregateOutputType | null
    _min: ReceiptItemMinAggregateOutputType | null
    _max: ReceiptItemMaxAggregateOutputType | null
  }

  type GetReceiptItemGroupByPayload<T extends ReceiptItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReceiptItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReceiptItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReceiptItemGroupByOutputType[P]>
            : GetScalarType<T[P], ReceiptItemGroupByOutputType[P]>
        }
      >
    >


  export type ReceiptItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemGroupId?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    itemGroup?: boolean | ReceiptItemGroupDefaultArgs<ExtArgs>
    supplements?: boolean | ReceiptItem$supplementsArgs<ExtArgs>
    smartPayments?: boolean | ReceiptItem$smartPaymentsArgs<ExtArgs>
    _count?: boolean | ReceiptItemCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItem"]>

  export type ReceiptItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemGroupId?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    itemGroup?: boolean | ReceiptItemGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItem"]>

  export type ReceiptItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemGroupId?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    itemGroup?: boolean | ReceiptItemGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItem"]>

  export type ReceiptItemSelectScalar = {
    id?: boolean
    itemGroupId?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ReceiptItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "itemGroupId" | "price" | "createdAt" | "updatedAt", ExtArgs["result"]["receiptItem"]>
  export type ReceiptItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    itemGroup?: boolean | ReceiptItemGroupDefaultArgs<ExtArgs>
    supplements?: boolean | ReceiptItem$supplementsArgs<ExtArgs>
    smartPayments?: boolean | ReceiptItem$smartPaymentsArgs<ExtArgs>
    _count?: boolean | ReceiptItemCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ReceiptItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    itemGroup?: boolean | ReceiptItemGroupDefaultArgs<ExtArgs>
  }
  export type ReceiptItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    itemGroup?: boolean | ReceiptItemGroupDefaultArgs<ExtArgs>
  }

  export type $ReceiptItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReceiptItem"
    objects: {
      itemGroup: Prisma.$ReceiptItemGroupPayload<ExtArgs>
      supplements: Prisma.$ReceiptItemSupplementPayload<ExtArgs>[]
      smartPayments: Prisma.$SmartReceiptPaymentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      itemGroupId: string
      price: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["receiptItem"]>
    composites: {}
  }

  type ReceiptItemGetPayload<S extends boolean | null | undefined | ReceiptItemDefaultArgs> = $Result.GetResult<Prisma.$ReceiptItemPayload, S>

  type ReceiptItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReceiptItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReceiptItemCountAggregateInputType | true
    }

  export interface ReceiptItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReceiptItem'], meta: { name: 'ReceiptItem' } }
    /**
     * Find zero or one ReceiptItem that matches the filter.
     * @param {ReceiptItemFindUniqueArgs} args - Arguments to find a ReceiptItem
     * @example
     * // Get one ReceiptItem
     * const receiptItem = await prisma.receiptItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReceiptItemFindUniqueArgs>(args: SelectSubset<T, ReceiptItemFindUniqueArgs<ExtArgs>>): Prisma__ReceiptItemClient<$Result.GetResult<Prisma.$ReceiptItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReceiptItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReceiptItemFindUniqueOrThrowArgs} args - Arguments to find a ReceiptItem
     * @example
     * // Get one ReceiptItem
     * const receiptItem = await prisma.receiptItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReceiptItemFindUniqueOrThrowArgs>(args: SelectSubset<T, ReceiptItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReceiptItemClient<$Result.GetResult<Prisma.$ReceiptItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReceiptItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemFindFirstArgs} args - Arguments to find a ReceiptItem
     * @example
     * // Get one ReceiptItem
     * const receiptItem = await prisma.receiptItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReceiptItemFindFirstArgs>(args?: SelectSubset<T, ReceiptItemFindFirstArgs<ExtArgs>>): Prisma__ReceiptItemClient<$Result.GetResult<Prisma.$ReceiptItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReceiptItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemFindFirstOrThrowArgs} args - Arguments to find a ReceiptItem
     * @example
     * // Get one ReceiptItem
     * const receiptItem = await prisma.receiptItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReceiptItemFindFirstOrThrowArgs>(args?: SelectSubset<T, ReceiptItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReceiptItemClient<$Result.GetResult<Prisma.$ReceiptItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReceiptItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReceiptItems
     * const receiptItems = await prisma.receiptItem.findMany()
     * 
     * // Get first 10 ReceiptItems
     * const receiptItems = await prisma.receiptItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const receiptItemWithIdOnly = await prisma.receiptItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReceiptItemFindManyArgs>(args?: SelectSubset<T, ReceiptItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReceiptItem.
     * @param {ReceiptItemCreateArgs} args - Arguments to create a ReceiptItem.
     * @example
     * // Create one ReceiptItem
     * const ReceiptItem = await prisma.receiptItem.create({
     *   data: {
     *     // ... data to create a ReceiptItem
     *   }
     * })
     * 
     */
    create<T extends ReceiptItemCreateArgs>(args: SelectSubset<T, ReceiptItemCreateArgs<ExtArgs>>): Prisma__ReceiptItemClient<$Result.GetResult<Prisma.$ReceiptItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReceiptItems.
     * @param {ReceiptItemCreateManyArgs} args - Arguments to create many ReceiptItems.
     * @example
     * // Create many ReceiptItems
     * const receiptItem = await prisma.receiptItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReceiptItemCreateManyArgs>(args?: SelectSubset<T, ReceiptItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReceiptItems and returns the data saved in the database.
     * @param {ReceiptItemCreateManyAndReturnArgs} args - Arguments to create many ReceiptItems.
     * @example
     * // Create many ReceiptItems
     * const receiptItem = await prisma.receiptItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReceiptItems and only return the `id`
     * const receiptItemWithIdOnly = await prisma.receiptItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReceiptItemCreateManyAndReturnArgs>(args?: SelectSubset<T, ReceiptItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ReceiptItem.
     * @param {ReceiptItemDeleteArgs} args - Arguments to delete one ReceiptItem.
     * @example
     * // Delete one ReceiptItem
     * const ReceiptItem = await prisma.receiptItem.delete({
     *   where: {
     *     // ... filter to delete one ReceiptItem
     *   }
     * })
     * 
     */
    delete<T extends ReceiptItemDeleteArgs>(args: SelectSubset<T, ReceiptItemDeleteArgs<ExtArgs>>): Prisma__ReceiptItemClient<$Result.GetResult<Prisma.$ReceiptItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReceiptItem.
     * @param {ReceiptItemUpdateArgs} args - Arguments to update one ReceiptItem.
     * @example
     * // Update one ReceiptItem
     * const receiptItem = await prisma.receiptItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReceiptItemUpdateArgs>(args: SelectSubset<T, ReceiptItemUpdateArgs<ExtArgs>>): Prisma__ReceiptItemClient<$Result.GetResult<Prisma.$ReceiptItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReceiptItems.
     * @param {ReceiptItemDeleteManyArgs} args - Arguments to filter ReceiptItems to delete.
     * @example
     * // Delete a few ReceiptItems
     * const { count } = await prisma.receiptItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReceiptItemDeleteManyArgs>(args?: SelectSubset<T, ReceiptItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReceiptItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReceiptItems
     * const receiptItem = await prisma.receiptItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReceiptItemUpdateManyArgs>(args: SelectSubset<T, ReceiptItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReceiptItems and returns the data updated in the database.
     * @param {ReceiptItemUpdateManyAndReturnArgs} args - Arguments to update many ReceiptItems.
     * @example
     * // Update many ReceiptItems
     * const receiptItem = await prisma.receiptItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ReceiptItems and only return the `id`
     * const receiptItemWithIdOnly = await prisma.receiptItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReceiptItemUpdateManyAndReturnArgs>(args: SelectSubset<T, ReceiptItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ReceiptItem.
     * @param {ReceiptItemUpsertArgs} args - Arguments to update or create a ReceiptItem.
     * @example
     * // Update or create a ReceiptItem
     * const receiptItem = await prisma.receiptItem.upsert({
     *   create: {
     *     // ... data to create a ReceiptItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReceiptItem we want to update
     *   }
     * })
     */
    upsert<T extends ReceiptItemUpsertArgs>(args: SelectSubset<T, ReceiptItemUpsertArgs<ExtArgs>>): Prisma__ReceiptItemClient<$Result.GetResult<Prisma.$ReceiptItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReceiptItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemCountArgs} args - Arguments to filter ReceiptItems to count.
     * @example
     * // Count the number of ReceiptItems
     * const count = await prisma.receiptItem.count({
     *   where: {
     *     // ... the filter for the ReceiptItems we want to count
     *   }
     * })
    **/
    count<T extends ReceiptItemCountArgs>(
      args?: Subset<T, ReceiptItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReceiptItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReceiptItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReceiptItemAggregateArgs>(args: Subset<T, ReceiptItemAggregateArgs>): Prisma.PrismaPromise<GetReceiptItemAggregateType<T>>

    /**
     * Group by ReceiptItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReceiptItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReceiptItemGroupByArgs['orderBy'] }
        : { orderBy?: ReceiptItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReceiptItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReceiptItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReceiptItem model
   */
  readonly fields: ReceiptItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReceiptItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReceiptItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    itemGroup<T extends ReceiptItemGroupDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReceiptItemGroupDefaultArgs<ExtArgs>>): Prisma__ReceiptItemGroupClient<$Result.GetResult<Prisma.$ReceiptItemGroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    supplements<T extends ReceiptItem$supplementsArgs<ExtArgs> = {}>(args?: Subset<T, ReceiptItem$supplementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemSupplementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    smartPayments<T extends ReceiptItem$smartPaymentsArgs<ExtArgs> = {}>(args?: Subset<T, ReceiptItem$smartPaymentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SmartReceiptPaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReceiptItem model
   */
  interface ReceiptItemFieldRefs {
    readonly id: FieldRef<"ReceiptItem", 'String'>
    readonly itemGroupId: FieldRef<"ReceiptItem", 'String'>
    readonly price: FieldRef<"ReceiptItem", 'Float'>
    readonly createdAt: FieldRef<"ReceiptItem", 'DateTime'>
    readonly updatedAt: FieldRef<"ReceiptItem", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ReceiptItem findUnique
   */
  export type ReceiptItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItem
     */
    select?: ReceiptItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItem
     */
    omit?: ReceiptItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItem to fetch.
     */
    where: ReceiptItemWhereUniqueInput
  }

  /**
   * ReceiptItem findUniqueOrThrow
   */
  export type ReceiptItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItem
     */
    select?: ReceiptItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItem
     */
    omit?: ReceiptItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItem to fetch.
     */
    where: ReceiptItemWhereUniqueInput
  }

  /**
   * ReceiptItem findFirst
   */
  export type ReceiptItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItem
     */
    select?: ReceiptItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItem
     */
    omit?: ReceiptItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItem to fetch.
     */
    where?: ReceiptItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItems to fetch.
     */
    orderBy?: ReceiptItemOrderByWithRelationInput | ReceiptItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReceiptItems.
     */
    cursor?: ReceiptItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReceiptItems.
     */
    distinct?: ReceiptItemScalarFieldEnum | ReceiptItemScalarFieldEnum[]
  }

  /**
   * ReceiptItem findFirstOrThrow
   */
  export type ReceiptItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItem
     */
    select?: ReceiptItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItem
     */
    omit?: ReceiptItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItem to fetch.
     */
    where?: ReceiptItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItems to fetch.
     */
    orderBy?: ReceiptItemOrderByWithRelationInput | ReceiptItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReceiptItems.
     */
    cursor?: ReceiptItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReceiptItems.
     */
    distinct?: ReceiptItemScalarFieldEnum | ReceiptItemScalarFieldEnum[]
  }

  /**
   * ReceiptItem findMany
   */
  export type ReceiptItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItem
     */
    select?: ReceiptItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItem
     */
    omit?: ReceiptItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItems to fetch.
     */
    where?: ReceiptItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItems to fetch.
     */
    orderBy?: ReceiptItemOrderByWithRelationInput | ReceiptItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReceiptItems.
     */
    cursor?: ReceiptItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItems.
     */
    skip?: number
    distinct?: ReceiptItemScalarFieldEnum | ReceiptItemScalarFieldEnum[]
  }

  /**
   * ReceiptItem create
   */
  export type ReceiptItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItem
     */
    select?: ReceiptItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItem
     */
    omit?: ReceiptItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemInclude<ExtArgs> | null
    /**
     * The data needed to create a ReceiptItem.
     */
    data: XOR<ReceiptItemCreateInput, ReceiptItemUncheckedCreateInput>
  }

  /**
   * ReceiptItem createMany
   */
  export type ReceiptItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReceiptItems.
     */
    data: ReceiptItemCreateManyInput | ReceiptItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReceiptItem createManyAndReturn
   */
  export type ReceiptItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItem
     */
    select?: ReceiptItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItem
     */
    omit?: ReceiptItemOmit<ExtArgs> | null
    /**
     * The data used to create many ReceiptItems.
     */
    data: ReceiptItemCreateManyInput | ReceiptItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReceiptItem update
   */
  export type ReceiptItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItem
     */
    select?: ReceiptItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItem
     */
    omit?: ReceiptItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemInclude<ExtArgs> | null
    /**
     * The data needed to update a ReceiptItem.
     */
    data: XOR<ReceiptItemUpdateInput, ReceiptItemUncheckedUpdateInput>
    /**
     * Choose, which ReceiptItem to update.
     */
    where: ReceiptItemWhereUniqueInput
  }

  /**
   * ReceiptItem updateMany
   */
  export type ReceiptItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReceiptItems.
     */
    data: XOR<ReceiptItemUpdateManyMutationInput, ReceiptItemUncheckedUpdateManyInput>
    /**
     * Filter which ReceiptItems to update
     */
    where?: ReceiptItemWhereInput
    /**
     * Limit how many ReceiptItems to update.
     */
    limit?: number
  }

  /**
   * ReceiptItem updateManyAndReturn
   */
  export type ReceiptItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItem
     */
    select?: ReceiptItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItem
     */
    omit?: ReceiptItemOmit<ExtArgs> | null
    /**
     * The data used to update ReceiptItems.
     */
    data: XOR<ReceiptItemUpdateManyMutationInput, ReceiptItemUncheckedUpdateManyInput>
    /**
     * Filter which ReceiptItems to update
     */
    where?: ReceiptItemWhereInput
    /**
     * Limit how many ReceiptItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReceiptItem upsert
   */
  export type ReceiptItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItem
     */
    select?: ReceiptItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItem
     */
    omit?: ReceiptItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemInclude<ExtArgs> | null
    /**
     * The filter to search for the ReceiptItem to update in case it exists.
     */
    where: ReceiptItemWhereUniqueInput
    /**
     * In case the ReceiptItem found by the `where` argument doesn't exist, create a new ReceiptItem with this data.
     */
    create: XOR<ReceiptItemCreateInput, ReceiptItemUncheckedCreateInput>
    /**
     * In case the ReceiptItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReceiptItemUpdateInput, ReceiptItemUncheckedUpdateInput>
  }

  /**
   * ReceiptItem delete
   */
  export type ReceiptItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItem
     */
    select?: ReceiptItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItem
     */
    omit?: ReceiptItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemInclude<ExtArgs> | null
    /**
     * Filter which ReceiptItem to delete.
     */
    where: ReceiptItemWhereUniqueInput
  }

  /**
   * ReceiptItem deleteMany
   */
  export type ReceiptItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReceiptItems to delete
     */
    where?: ReceiptItemWhereInput
    /**
     * Limit how many ReceiptItems to delete.
     */
    limit?: number
  }

  /**
   * ReceiptItem.supplements
   */
  export type ReceiptItem$supplementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplement
     */
    select?: ReceiptItemSupplementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplement
     */
    omit?: ReceiptItemSupplementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementInclude<ExtArgs> | null
    where?: ReceiptItemSupplementWhereInput
    orderBy?: ReceiptItemSupplementOrderByWithRelationInput | ReceiptItemSupplementOrderByWithRelationInput[]
    cursor?: ReceiptItemSupplementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReceiptItemSupplementScalarFieldEnum | ReceiptItemSupplementScalarFieldEnum[]
  }

  /**
   * ReceiptItem.smartPayments
   */
  export type ReceiptItem$smartPaymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentInclude<ExtArgs> | null
    where?: SmartReceiptPaymentWhereInput
    orderBy?: SmartReceiptPaymentOrderByWithRelationInput | SmartReceiptPaymentOrderByWithRelationInput[]
    cursor?: SmartReceiptPaymentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SmartReceiptPaymentScalarFieldEnum | SmartReceiptPaymentScalarFieldEnum[]
  }

  /**
   * ReceiptItem without action
   */
  export type ReceiptItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItem
     */
    select?: ReceiptItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItem
     */
    omit?: ReceiptItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemInclude<ExtArgs> | null
  }


  /**
   * Model ReceiptItemSupplement
   */

  export type AggregateReceiptItemSupplement = {
    _count: ReceiptItemSupplementCountAggregateOutputType | null
    _avg: ReceiptItemSupplementAvgAggregateOutputType | null
    _sum: ReceiptItemSupplementSumAggregateOutputType | null
    _min: ReceiptItemSupplementMinAggregateOutputType | null
    _max: ReceiptItemSupplementMaxAggregateOutputType | null
  }

  export type ReceiptItemSupplementAvgAggregateOutputType = {
    price: number | null
  }

  export type ReceiptItemSupplementSumAggregateOutputType = {
    price: number | null
  }

  export type ReceiptItemSupplementMinAggregateOutputType = {
    id: string | null
    itemId: string | null
    description: string | null
    price: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReceiptItemSupplementMaxAggregateOutputType = {
    id: string | null
    itemId: string | null
    description: string | null
    price: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReceiptItemSupplementCountAggregateOutputType = {
    id: number
    itemId: number
    description: number
    price: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ReceiptItemSupplementAvgAggregateInputType = {
    price?: true
  }

  export type ReceiptItemSupplementSumAggregateInputType = {
    price?: true
  }

  export type ReceiptItemSupplementMinAggregateInputType = {
    id?: true
    itemId?: true
    description?: true
    price?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReceiptItemSupplementMaxAggregateInputType = {
    id?: true
    itemId?: true
    description?: true
    price?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReceiptItemSupplementCountAggregateInputType = {
    id?: true
    itemId?: true
    description?: true
    price?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ReceiptItemSupplementAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReceiptItemSupplement to aggregate.
     */
    where?: ReceiptItemSupplementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemSupplements to fetch.
     */
    orderBy?: ReceiptItemSupplementOrderByWithRelationInput | ReceiptItemSupplementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReceiptItemSupplementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemSupplements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemSupplements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReceiptItemSupplements
    **/
    _count?: true | ReceiptItemSupplementCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReceiptItemSupplementAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReceiptItemSupplementSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReceiptItemSupplementMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReceiptItemSupplementMaxAggregateInputType
  }

  export type GetReceiptItemSupplementAggregateType<T extends ReceiptItemSupplementAggregateArgs> = {
        [P in keyof T & keyof AggregateReceiptItemSupplement]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReceiptItemSupplement[P]>
      : GetScalarType<T[P], AggregateReceiptItemSupplement[P]>
  }




  export type ReceiptItemSupplementGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceiptItemSupplementWhereInput
    orderBy?: ReceiptItemSupplementOrderByWithAggregationInput | ReceiptItemSupplementOrderByWithAggregationInput[]
    by: ReceiptItemSupplementScalarFieldEnum[] | ReceiptItemSupplementScalarFieldEnum
    having?: ReceiptItemSupplementScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReceiptItemSupplementCountAggregateInputType | true
    _avg?: ReceiptItemSupplementAvgAggregateInputType
    _sum?: ReceiptItemSupplementSumAggregateInputType
    _min?: ReceiptItemSupplementMinAggregateInputType
    _max?: ReceiptItemSupplementMaxAggregateInputType
  }

  export type ReceiptItemSupplementGroupByOutputType = {
    id: string
    itemId: string
    description: string
    price: number
    createdAt: Date
    updatedAt: Date
    _count: ReceiptItemSupplementCountAggregateOutputType | null
    _avg: ReceiptItemSupplementAvgAggregateOutputType | null
    _sum: ReceiptItemSupplementSumAggregateOutputType | null
    _min: ReceiptItemSupplementMinAggregateOutputType | null
    _max: ReceiptItemSupplementMaxAggregateOutputType | null
  }

  type GetReceiptItemSupplementGroupByPayload<T extends ReceiptItemSupplementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReceiptItemSupplementGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReceiptItemSupplementGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReceiptItemSupplementGroupByOutputType[P]>
            : GetScalarType<T[P], ReceiptItemSupplementGroupByOutputType[P]>
        }
      >
    >


  export type ReceiptItemSupplementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    description?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    item?: boolean | ReceiptItemDefaultArgs<ExtArgs>
    translations?: boolean | ReceiptItemSupplement$translationsArgs<ExtArgs>
    _count?: boolean | ReceiptItemSupplementCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItemSupplement"]>

  export type ReceiptItemSupplementSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    description?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    item?: boolean | ReceiptItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItemSupplement"]>

  export type ReceiptItemSupplementSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    description?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    item?: boolean | ReceiptItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItemSupplement"]>

  export type ReceiptItemSupplementSelectScalar = {
    id?: boolean
    itemId?: boolean
    description?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ReceiptItemSupplementOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "itemId" | "description" | "price" | "createdAt" | "updatedAt", ExtArgs["result"]["receiptItemSupplement"]>
  export type ReceiptItemSupplementInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | ReceiptItemDefaultArgs<ExtArgs>
    translations?: boolean | ReceiptItemSupplement$translationsArgs<ExtArgs>
    _count?: boolean | ReceiptItemSupplementCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ReceiptItemSupplementIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | ReceiptItemDefaultArgs<ExtArgs>
  }
  export type ReceiptItemSupplementIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | ReceiptItemDefaultArgs<ExtArgs>
  }

  export type $ReceiptItemSupplementPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReceiptItemSupplement"
    objects: {
      item: Prisma.$ReceiptItemPayload<ExtArgs>
      translations: Prisma.$ReceiptItemSupplementTranslationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      itemId: string
      description: string
      price: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["receiptItemSupplement"]>
    composites: {}
  }

  type ReceiptItemSupplementGetPayload<S extends boolean | null | undefined | ReceiptItemSupplementDefaultArgs> = $Result.GetResult<Prisma.$ReceiptItemSupplementPayload, S>

  type ReceiptItemSupplementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReceiptItemSupplementFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReceiptItemSupplementCountAggregateInputType | true
    }

  export interface ReceiptItemSupplementDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReceiptItemSupplement'], meta: { name: 'ReceiptItemSupplement' } }
    /**
     * Find zero or one ReceiptItemSupplement that matches the filter.
     * @param {ReceiptItemSupplementFindUniqueArgs} args - Arguments to find a ReceiptItemSupplement
     * @example
     * // Get one ReceiptItemSupplement
     * const receiptItemSupplement = await prisma.receiptItemSupplement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReceiptItemSupplementFindUniqueArgs>(args: SelectSubset<T, ReceiptItemSupplementFindUniqueArgs<ExtArgs>>): Prisma__ReceiptItemSupplementClient<$Result.GetResult<Prisma.$ReceiptItemSupplementPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReceiptItemSupplement that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReceiptItemSupplementFindUniqueOrThrowArgs} args - Arguments to find a ReceiptItemSupplement
     * @example
     * // Get one ReceiptItemSupplement
     * const receiptItemSupplement = await prisma.receiptItemSupplement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReceiptItemSupplementFindUniqueOrThrowArgs>(args: SelectSubset<T, ReceiptItemSupplementFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReceiptItemSupplementClient<$Result.GetResult<Prisma.$ReceiptItemSupplementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReceiptItemSupplement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemSupplementFindFirstArgs} args - Arguments to find a ReceiptItemSupplement
     * @example
     * // Get one ReceiptItemSupplement
     * const receiptItemSupplement = await prisma.receiptItemSupplement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReceiptItemSupplementFindFirstArgs>(args?: SelectSubset<T, ReceiptItemSupplementFindFirstArgs<ExtArgs>>): Prisma__ReceiptItemSupplementClient<$Result.GetResult<Prisma.$ReceiptItemSupplementPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReceiptItemSupplement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemSupplementFindFirstOrThrowArgs} args - Arguments to find a ReceiptItemSupplement
     * @example
     * // Get one ReceiptItemSupplement
     * const receiptItemSupplement = await prisma.receiptItemSupplement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReceiptItemSupplementFindFirstOrThrowArgs>(args?: SelectSubset<T, ReceiptItemSupplementFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReceiptItemSupplementClient<$Result.GetResult<Prisma.$ReceiptItemSupplementPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReceiptItemSupplements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemSupplementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReceiptItemSupplements
     * const receiptItemSupplements = await prisma.receiptItemSupplement.findMany()
     * 
     * // Get first 10 ReceiptItemSupplements
     * const receiptItemSupplements = await prisma.receiptItemSupplement.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const receiptItemSupplementWithIdOnly = await prisma.receiptItemSupplement.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReceiptItemSupplementFindManyArgs>(args?: SelectSubset<T, ReceiptItemSupplementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemSupplementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReceiptItemSupplement.
     * @param {ReceiptItemSupplementCreateArgs} args - Arguments to create a ReceiptItemSupplement.
     * @example
     * // Create one ReceiptItemSupplement
     * const ReceiptItemSupplement = await prisma.receiptItemSupplement.create({
     *   data: {
     *     // ... data to create a ReceiptItemSupplement
     *   }
     * })
     * 
     */
    create<T extends ReceiptItemSupplementCreateArgs>(args: SelectSubset<T, ReceiptItemSupplementCreateArgs<ExtArgs>>): Prisma__ReceiptItemSupplementClient<$Result.GetResult<Prisma.$ReceiptItemSupplementPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReceiptItemSupplements.
     * @param {ReceiptItemSupplementCreateManyArgs} args - Arguments to create many ReceiptItemSupplements.
     * @example
     * // Create many ReceiptItemSupplements
     * const receiptItemSupplement = await prisma.receiptItemSupplement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReceiptItemSupplementCreateManyArgs>(args?: SelectSubset<T, ReceiptItemSupplementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReceiptItemSupplements and returns the data saved in the database.
     * @param {ReceiptItemSupplementCreateManyAndReturnArgs} args - Arguments to create many ReceiptItemSupplements.
     * @example
     * // Create many ReceiptItemSupplements
     * const receiptItemSupplement = await prisma.receiptItemSupplement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReceiptItemSupplements and only return the `id`
     * const receiptItemSupplementWithIdOnly = await prisma.receiptItemSupplement.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReceiptItemSupplementCreateManyAndReturnArgs>(args?: SelectSubset<T, ReceiptItemSupplementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemSupplementPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ReceiptItemSupplement.
     * @param {ReceiptItemSupplementDeleteArgs} args - Arguments to delete one ReceiptItemSupplement.
     * @example
     * // Delete one ReceiptItemSupplement
     * const ReceiptItemSupplement = await prisma.receiptItemSupplement.delete({
     *   where: {
     *     // ... filter to delete one ReceiptItemSupplement
     *   }
     * })
     * 
     */
    delete<T extends ReceiptItemSupplementDeleteArgs>(args: SelectSubset<T, ReceiptItemSupplementDeleteArgs<ExtArgs>>): Prisma__ReceiptItemSupplementClient<$Result.GetResult<Prisma.$ReceiptItemSupplementPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReceiptItemSupplement.
     * @param {ReceiptItemSupplementUpdateArgs} args - Arguments to update one ReceiptItemSupplement.
     * @example
     * // Update one ReceiptItemSupplement
     * const receiptItemSupplement = await prisma.receiptItemSupplement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReceiptItemSupplementUpdateArgs>(args: SelectSubset<T, ReceiptItemSupplementUpdateArgs<ExtArgs>>): Prisma__ReceiptItemSupplementClient<$Result.GetResult<Prisma.$ReceiptItemSupplementPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReceiptItemSupplements.
     * @param {ReceiptItemSupplementDeleteManyArgs} args - Arguments to filter ReceiptItemSupplements to delete.
     * @example
     * // Delete a few ReceiptItemSupplements
     * const { count } = await prisma.receiptItemSupplement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReceiptItemSupplementDeleteManyArgs>(args?: SelectSubset<T, ReceiptItemSupplementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReceiptItemSupplements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemSupplementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReceiptItemSupplements
     * const receiptItemSupplement = await prisma.receiptItemSupplement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReceiptItemSupplementUpdateManyArgs>(args: SelectSubset<T, ReceiptItemSupplementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReceiptItemSupplements and returns the data updated in the database.
     * @param {ReceiptItemSupplementUpdateManyAndReturnArgs} args - Arguments to update many ReceiptItemSupplements.
     * @example
     * // Update many ReceiptItemSupplements
     * const receiptItemSupplement = await prisma.receiptItemSupplement.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ReceiptItemSupplements and only return the `id`
     * const receiptItemSupplementWithIdOnly = await prisma.receiptItemSupplement.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReceiptItemSupplementUpdateManyAndReturnArgs>(args: SelectSubset<T, ReceiptItemSupplementUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemSupplementPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ReceiptItemSupplement.
     * @param {ReceiptItemSupplementUpsertArgs} args - Arguments to update or create a ReceiptItemSupplement.
     * @example
     * // Update or create a ReceiptItemSupplement
     * const receiptItemSupplement = await prisma.receiptItemSupplement.upsert({
     *   create: {
     *     // ... data to create a ReceiptItemSupplement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReceiptItemSupplement we want to update
     *   }
     * })
     */
    upsert<T extends ReceiptItemSupplementUpsertArgs>(args: SelectSubset<T, ReceiptItemSupplementUpsertArgs<ExtArgs>>): Prisma__ReceiptItemSupplementClient<$Result.GetResult<Prisma.$ReceiptItemSupplementPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReceiptItemSupplements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemSupplementCountArgs} args - Arguments to filter ReceiptItemSupplements to count.
     * @example
     * // Count the number of ReceiptItemSupplements
     * const count = await prisma.receiptItemSupplement.count({
     *   where: {
     *     // ... the filter for the ReceiptItemSupplements we want to count
     *   }
     * })
    **/
    count<T extends ReceiptItemSupplementCountArgs>(
      args?: Subset<T, ReceiptItemSupplementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReceiptItemSupplementCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReceiptItemSupplement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemSupplementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReceiptItemSupplementAggregateArgs>(args: Subset<T, ReceiptItemSupplementAggregateArgs>): Prisma.PrismaPromise<GetReceiptItemSupplementAggregateType<T>>

    /**
     * Group by ReceiptItemSupplement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemSupplementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReceiptItemSupplementGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReceiptItemSupplementGroupByArgs['orderBy'] }
        : { orderBy?: ReceiptItemSupplementGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReceiptItemSupplementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReceiptItemSupplementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReceiptItemSupplement model
   */
  readonly fields: ReceiptItemSupplementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReceiptItemSupplement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReceiptItemSupplementClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    item<T extends ReceiptItemDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReceiptItemDefaultArgs<ExtArgs>>): Prisma__ReceiptItemClient<$Result.GetResult<Prisma.$ReceiptItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    translations<T extends ReceiptItemSupplement$translationsArgs<ExtArgs> = {}>(args?: Subset<T, ReceiptItemSupplement$translationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemSupplementTranslationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReceiptItemSupplement model
   */
  interface ReceiptItemSupplementFieldRefs {
    readonly id: FieldRef<"ReceiptItemSupplement", 'String'>
    readonly itemId: FieldRef<"ReceiptItemSupplement", 'String'>
    readonly description: FieldRef<"ReceiptItemSupplement", 'String'>
    readonly price: FieldRef<"ReceiptItemSupplement", 'Float'>
    readonly createdAt: FieldRef<"ReceiptItemSupplement", 'DateTime'>
    readonly updatedAt: FieldRef<"ReceiptItemSupplement", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ReceiptItemSupplement findUnique
   */
  export type ReceiptItemSupplementFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplement
     */
    select?: ReceiptItemSupplementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplement
     */
    omit?: ReceiptItemSupplementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemSupplement to fetch.
     */
    where: ReceiptItemSupplementWhereUniqueInput
  }

  /**
   * ReceiptItemSupplement findUniqueOrThrow
   */
  export type ReceiptItemSupplementFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplement
     */
    select?: ReceiptItemSupplementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplement
     */
    omit?: ReceiptItemSupplementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemSupplement to fetch.
     */
    where: ReceiptItemSupplementWhereUniqueInput
  }

  /**
   * ReceiptItemSupplement findFirst
   */
  export type ReceiptItemSupplementFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplement
     */
    select?: ReceiptItemSupplementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplement
     */
    omit?: ReceiptItemSupplementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemSupplement to fetch.
     */
    where?: ReceiptItemSupplementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemSupplements to fetch.
     */
    orderBy?: ReceiptItemSupplementOrderByWithRelationInput | ReceiptItemSupplementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReceiptItemSupplements.
     */
    cursor?: ReceiptItemSupplementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemSupplements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemSupplements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReceiptItemSupplements.
     */
    distinct?: ReceiptItemSupplementScalarFieldEnum | ReceiptItemSupplementScalarFieldEnum[]
  }

  /**
   * ReceiptItemSupplement findFirstOrThrow
   */
  export type ReceiptItemSupplementFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplement
     */
    select?: ReceiptItemSupplementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplement
     */
    omit?: ReceiptItemSupplementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemSupplement to fetch.
     */
    where?: ReceiptItemSupplementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemSupplements to fetch.
     */
    orderBy?: ReceiptItemSupplementOrderByWithRelationInput | ReceiptItemSupplementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReceiptItemSupplements.
     */
    cursor?: ReceiptItemSupplementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemSupplements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemSupplements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReceiptItemSupplements.
     */
    distinct?: ReceiptItemSupplementScalarFieldEnum | ReceiptItemSupplementScalarFieldEnum[]
  }

  /**
   * ReceiptItemSupplement findMany
   */
  export type ReceiptItemSupplementFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplement
     */
    select?: ReceiptItemSupplementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplement
     */
    omit?: ReceiptItemSupplementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemSupplements to fetch.
     */
    where?: ReceiptItemSupplementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemSupplements to fetch.
     */
    orderBy?: ReceiptItemSupplementOrderByWithRelationInput | ReceiptItemSupplementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReceiptItemSupplements.
     */
    cursor?: ReceiptItemSupplementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemSupplements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemSupplements.
     */
    skip?: number
    distinct?: ReceiptItemSupplementScalarFieldEnum | ReceiptItemSupplementScalarFieldEnum[]
  }

  /**
   * ReceiptItemSupplement create
   */
  export type ReceiptItemSupplementCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplement
     */
    select?: ReceiptItemSupplementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplement
     */
    omit?: ReceiptItemSupplementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementInclude<ExtArgs> | null
    /**
     * The data needed to create a ReceiptItemSupplement.
     */
    data: XOR<ReceiptItemSupplementCreateInput, ReceiptItemSupplementUncheckedCreateInput>
  }

  /**
   * ReceiptItemSupplement createMany
   */
  export type ReceiptItemSupplementCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReceiptItemSupplements.
     */
    data: ReceiptItemSupplementCreateManyInput | ReceiptItemSupplementCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReceiptItemSupplement createManyAndReturn
   */
  export type ReceiptItemSupplementCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplement
     */
    select?: ReceiptItemSupplementSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplement
     */
    omit?: ReceiptItemSupplementOmit<ExtArgs> | null
    /**
     * The data used to create many ReceiptItemSupplements.
     */
    data: ReceiptItemSupplementCreateManyInput | ReceiptItemSupplementCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReceiptItemSupplement update
   */
  export type ReceiptItemSupplementUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplement
     */
    select?: ReceiptItemSupplementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplement
     */
    omit?: ReceiptItemSupplementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementInclude<ExtArgs> | null
    /**
     * The data needed to update a ReceiptItemSupplement.
     */
    data: XOR<ReceiptItemSupplementUpdateInput, ReceiptItemSupplementUncheckedUpdateInput>
    /**
     * Choose, which ReceiptItemSupplement to update.
     */
    where: ReceiptItemSupplementWhereUniqueInput
  }

  /**
   * ReceiptItemSupplement updateMany
   */
  export type ReceiptItemSupplementUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReceiptItemSupplements.
     */
    data: XOR<ReceiptItemSupplementUpdateManyMutationInput, ReceiptItemSupplementUncheckedUpdateManyInput>
    /**
     * Filter which ReceiptItemSupplements to update
     */
    where?: ReceiptItemSupplementWhereInput
    /**
     * Limit how many ReceiptItemSupplements to update.
     */
    limit?: number
  }

  /**
   * ReceiptItemSupplement updateManyAndReturn
   */
  export type ReceiptItemSupplementUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplement
     */
    select?: ReceiptItemSupplementSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplement
     */
    omit?: ReceiptItemSupplementOmit<ExtArgs> | null
    /**
     * The data used to update ReceiptItemSupplements.
     */
    data: XOR<ReceiptItemSupplementUpdateManyMutationInput, ReceiptItemSupplementUncheckedUpdateManyInput>
    /**
     * Filter which ReceiptItemSupplements to update
     */
    where?: ReceiptItemSupplementWhereInput
    /**
     * Limit how many ReceiptItemSupplements to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReceiptItemSupplement upsert
   */
  export type ReceiptItemSupplementUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplement
     */
    select?: ReceiptItemSupplementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplement
     */
    omit?: ReceiptItemSupplementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementInclude<ExtArgs> | null
    /**
     * The filter to search for the ReceiptItemSupplement to update in case it exists.
     */
    where: ReceiptItemSupplementWhereUniqueInput
    /**
     * In case the ReceiptItemSupplement found by the `where` argument doesn't exist, create a new ReceiptItemSupplement with this data.
     */
    create: XOR<ReceiptItemSupplementCreateInput, ReceiptItemSupplementUncheckedCreateInput>
    /**
     * In case the ReceiptItemSupplement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReceiptItemSupplementUpdateInput, ReceiptItemSupplementUncheckedUpdateInput>
  }

  /**
   * ReceiptItemSupplement delete
   */
  export type ReceiptItemSupplementDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplement
     */
    select?: ReceiptItemSupplementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplement
     */
    omit?: ReceiptItemSupplementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementInclude<ExtArgs> | null
    /**
     * Filter which ReceiptItemSupplement to delete.
     */
    where: ReceiptItemSupplementWhereUniqueInput
  }

  /**
   * ReceiptItemSupplement deleteMany
   */
  export type ReceiptItemSupplementDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReceiptItemSupplements to delete
     */
    where?: ReceiptItemSupplementWhereInput
    /**
     * Limit how many ReceiptItemSupplements to delete.
     */
    limit?: number
  }

  /**
   * ReceiptItemSupplement.translations
   */
  export type ReceiptItemSupplement$translationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplementTranslation
     */
    select?: ReceiptItemSupplementTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplementTranslation
     */
    omit?: ReceiptItemSupplementTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementTranslationInclude<ExtArgs> | null
    where?: ReceiptItemSupplementTranslationWhereInput
    orderBy?: ReceiptItemSupplementTranslationOrderByWithRelationInput | ReceiptItemSupplementTranslationOrderByWithRelationInput[]
    cursor?: ReceiptItemSupplementTranslationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReceiptItemSupplementTranslationScalarFieldEnum | ReceiptItemSupplementTranslationScalarFieldEnum[]
  }

  /**
   * ReceiptItemSupplement without action
   */
  export type ReceiptItemSupplementDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplement
     */
    select?: ReceiptItemSupplementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplement
     */
    omit?: ReceiptItemSupplementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementInclude<ExtArgs> | null
  }


  /**
   * Model ReceiptItemGroupTranslation
   */

  export type AggregateReceiptItemGroupTranslation = {
    _count: ReceiptItemGroupTranslationCountAggregateOutputType | null
    _min: ReceiptItemGroupTranslationMinAggregateOutputType | null
    _max: ReceiptItemGroupTranslationMaxAggregateOutputType | null
  }

  export type ReceiptItemGroupTranslationMinAggregateOutputType = {
    id: string | null
    itemGroupId: string | null
    label: string | null
    description: string | null
    language: string | null
    lightModeLabelHexColor: string | null
    darkModeLabelHexColor: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReceiptItemGroupTranslationMaxAggregateOutputType = {
    id: string | null
    itemGroupId: string | null
    label: string | null
    description: string | null
    language: string | null
    lightModeLabelHexColor: string | null
    darkModeLabelHexColor: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReceiptItemGroupTranslationCountAggregateOutputType = {
    id: number
    itemGroupId: number
    label: number
    description: number
    language: number
    lightModeLabelHexColor: number
    darkModeLabelHexColor: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ReceiptItemGroupTranslationMinAggregateInputType = {
    id?: true
    itemGroupId?: true
    label?: true
    description?: true
    language?: true
    lightModeLabelHexColor?: true
    darkModeLabelHexColor?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReceiptItemGroupTranslationMaxAggregateInputType = {
    id?: true
    itemGroupId?: true
    label?: true
    description?: true
    language?: true
    lightModeLabelHexColor?: true
    darkModeLabelHexColor?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReceiptItemGroupTranslationCountAggregateInputType = {
    id?: true
    itemGroupId?: true
    label?: true
    description?: true
    language?: true
    lightModeLabelHexColor?: true
    darkModeLabelHexColor?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ReceiptItemGroupTranslationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReceiptItemGroupTranslation to aggregate.
     */
    where?: ReceiptItemGroupTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemGroupTranslations to fetch.
     */
    orderBy?: ReceiptItemGroupTranslationOrderByWithRelationInput | ReceiptItemGroupTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReceiptItemGroupTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemGroupTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemGroupTranslations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReceiptItemGroupTranslations
    **/
    _count?: true | ReceiptItemGroupTranslationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReceiptItemGroupTranslationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReceiptItemGroupTranslationMaxAggregateInputType
  }

  export type GetReceiptItemGroupTranslationAggregateType<T extends ReceiptItemGroupTranslationAggregateArgs> = {
        [P in keyof T & keyof AggregateReceiptItemGroupTranslation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReceiptItemGroupTranslation[P]>
      : GetScalarType<T[P], AggregateReceiptItemGroupTranslation[P]>
  }




  export type ReceiptItemGroupTranslationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceiptItemGroupTranslationWhereInput
    orderBy?: ReceiptItemGroupTranslationOrderByWithAggregationInput | ReceiptItemGroupTranslationOrderByWithAggregationInput[]
    by: ReceiptItemGroupTranslationScalarFieldEnum[] | ReceiptItemGroupTranslationScalarFieldEnum
    having?: ReceiptItemGroupTranslationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReceiptItemGroupTranslationCountAggregateInputType | true
    _min?: ReceiptItemGroupTranslationMinAggregateInputType
    _max?: ReceiptItemGroupTranslationMaxAggregateInputType
  }

  export type ReceiptItemGroupTranslationGroupByOutputType = {
    id: string
    itemGroupId: string
    label: string
    description: string
    language: string
    lightModeLabelHexColor: string
    darkModeLabelHexColor: string
    createdAt: Date
    updatedAt: Date
    _count: ReceiptItemGroupTranslationCountAggregateOutputType | null
    _min: ReceiptItemGroupTranslationMinAggregateOutputType | null
    _max: ReceiptItemGroupTranslationMaxAggregateOutputType | null
  }

  type GetReceiptItemGroupTranslationGroupByPayload<T extends ReceiptItemGroupTranslationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReceiptItemGroupTranslationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReceiptItemGroupTranslationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReceiptItemGroupTranslationGroupByOutputType[P]>
            : GetScalarType<T[P], ReceiptItemGroupTranslationGroupByOutputType[P]>
        }
      >
    >


  export type ReceiptItemGroupTranslationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemGroupId?: boolean
    label?: boolean
    description?: boolean
    language?: boolean
    lightModeLabelHexColor?: boolean
    darkModeLabelHexColor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    itemGroup?: boolean | ReceiptItemGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItemGroupTranslation"]>

  export type ReceiptItemGroupTranslationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemGroupId?: boolean
    label?: boolean
    description?: boolean
    language?: boolean
    lightModeLabelHexColor?: boolean
    darkModeLabelHexColor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    itemGroup?: boolean | ReceiptItemGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItemGroupTranslation"]>

  export type ReceiptItemGroupTranslationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemGroupId?: boolean
    label?: boolean
    description?: boolean
    language?: boolean
    lightModeLabelHexColor?: boolean
    darkModeLabelHexColor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    itemGroup?: boolean | ReceiptItemGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItemGroupTranslation"]>

  export type ReceiptItemGroupTranslationSelectScalar = {
    id?: boolean
    itemGroupId?: boolean
    label?: boolean
    description?: boolean
    language?: boolean
    lightModeLabelHexColor?: boolean
    darkModeLabelHexColor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ReceiptItemGroupTranslationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "itemGroupId" | "label" | "description" | "language" | "lightModeLabelHexColor" | "darkModeLabelHexColor" | "createdAt" | "updatedAt", ExtArgs["result"]["receiptItemGroupTranslation"]>
  export type ReceiptItemGroupTranslationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    itemGroup?: boolean | ReceiptItemGroupDefaultArgs<ExtArgs>
  }
  export type ReceiptItemGroupTranslationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    itemGroup?: boolean | ReceiptItemGroupDefaultArgs<ExtArgs>
  }
  export type ReceiptItemGroupTranslationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    itemGroup?: boolean | ReceiptItemGroupDefaultArgs<ExtArgs>
  }

  export type $ReceiptItemGroupTranslationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReceiptItemGroupTranslation"
    objects: {
      itemGroup: Prisma.$ReceiptItemGroupPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      itemGroupId: string
      label: string
      description: string
      language: string
      lightModeLabelHexColor: string
      darkModeLabelHexColor: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["receiptItemGroupTranslation"]>
    composites: {}
  }

  type ReceiptItemGroupTranslationGetPayload<S extends boolean | null | undefined | ReceiptItemGroupTranslationDefaultArgs> = $Result.GetResult<Prisma.$ReceiptItemGroupTranslationPayload, S>

  type ReceiptItemGroupTranslationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReceiptItemGroupTranslationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReceiptItemGroupTranslationCountAggregateInputType | true
    }

  export interface ReceiptItemGroupTranslationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReceiptItemGroupTranslation'], meta: { name: 'ReceiptItemGroupTranslation' } }
    /**
     * Find zero or one ReceiptItemGroupTranslation that matches the filter.
     * @param {ReceiptItemGroupTranslationFindUniqueArgs} args - Arguments to find a ReceiptItemGroupTranslation
     * @example
     * // Get one ReceiptItemGroupTranslation
     * const receiptItemGroupTranslation = await prisma.receiptItemGroupTranslation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReceiptItemGroupTranslationFindUniqueArgs>(args: SelectSubset<T, ReceiptItemGroupTranslationFindUniqueArgs<ExtArgs>>): Prisma__ReceiptItemGroupTranslationClient<$Result.GetResult<Prisma.$ReceiptItemGroupTranslationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReceiptItemGroupTranslation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReceiptItemGroupTranslationFindUniqueOrThrowArgs} args - Arguments to find a ReceiptItemGroupTranslation
     * @example
     * // Get one ReceiptItemGroupTranslation
     * const receiptItemGroupTranslation = await prisma.receiptItemGroupTranslation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReceiptItemGroupTranslationFindUniqueOrThrowArgs>(args: SelectSubset<T, ReceiptItemGroupTranslationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReceiptItemGroupTranslationClient<$Result.GetResult<Prisma.$ReceiptItemGroupTranslationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReceiptItemGroupTranslation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupTranslationFindFirstArgs} args - Arguments to find a ReceiptItemGroupTranslation
     * @example
     * // Get one ReceiptItemGroupTranslation
     * const receiptItemGroupTranslation = await prisma.receiptItemGroupTranslation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReceiptItemGroupTranslationFindFirstArgs>(args?: SelectSubset<T, ReceiptItemGroupTranslationFindFirstArgs<ExtArgs>>): Prisma__ReceiptItemGroupTranslationClient<$Result.GetResult<Prisma.$ReceiptItemGroupTranslationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReceiptItemGroupTranslation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupTranslationFindFirstOrThrowArgs} args - Arguments to find a ReceiptItemGroupTranslation
     * @example
     * // Get one ReceiptItemGroupTranslation
     * const receiptItemGroupTranslation = await prisma.receiptItemGroupTranslation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReceiptItemGroupTranslationFindFirstOrThrowArgs>(args?: SelectSubset<T, ReceiptItemGroupTranslationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReceiptItemGroupTranslationClient<$Result.GetResult<Prisma.$ReceiptItemGroupTranslationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReceiptItemGroupTranslations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupTranslationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReceiptItemGroupTranslations
     * const receiptItemGroupTranslations = await prisma.receiptItemGroupTranslation.findMany()
     * 
     * // Get first 10 ReceiptItemGroupTranslations
     * const receiptItemGroupTranslations = await prisma.receiptItemGroupTranslation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const receiptItemGroupTranslationWithIdOnly = await prisma.receiptItemGroupTranslation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReceiptItemGroupTranslationFindManyArgs>(args?: SelectSubset<T, ReceiptItemGroupTranslationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemGroupTranslationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReceiptItemGroupTranslation.
     * @param {ReceiptItemGroupTranslationCreateArgs} args - Arguments to create a ReceiptItemGroupTranslation.
     * @example
     * // Create one ReceiptItemGroupTranslation
     * const ReceiptItemGroupTranslation = await prisma.receiptItemGroupTranslation.create({
     *   data: {
     *     // ... data to create a ReceiptItemGroupTranslation
     *   }
     * })
     * 
     */
    create<T extends ReceiptItemGroupTranslationCreateArgs>(args: SelectSubset<T, ReceiptItemGroupTranslationCreateArgs<ExtArgs>>): Prisma__ReceiptItemGroupTranslationClient<$Result.GetResult<Prisma.$ReceiptItemGroupTranslationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReceiptItemGroupTranslations.
     * @param {ReceiptItemGroupTranslationCreateManyArgs} args - Arguments to create many ReceiptItemGroupTranslations.
     * @example
     * // Create many ReceiptItemGroupTranslations
     * const receiptItemGroupTranslation = await prisma.receiptItemGroupTranslation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReceiptItemGroupTranslationCreateManyArgs>(args?: SelectSubset<T, ReceiptItemGroupTranslationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReceiptItemGroupTranslations and returns the data saved in the database.
     * @param {ReceiptItemGroupTranslationCreateManyAndReturnArgs} args - Arguments to create many ReceiptItemGroupTranslations.
     * @example
     * // Create many ReceiptItemGroupTranslations
     * const receiptItemGroupTranslation = await prisma.receiptItemGroupTranslation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReceiptItemGroupTranslations and only return the `id`
     * const receiptItemGroupTranslationWithIdOnly = await prisma.receiptItemGroupTranslation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReceiptItemGroupTranslationCreateManyAndReturnArgs>(args?: SelectSubset<T, ReceiptItemGroupTranslationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemGroupTranslationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ReceiptItemGroupTranslation.
     * @param {ReceiptItemGroupTranslationDeleteArgs} args - Arguments to delete one ReceiptItemGroupTranslation.
     * @example
     * // Delete one ReceiptItemGroupTranslation
     * const ReceiptItemGroupTranslation = await prisma.receiptItemGroupTranslation.delete({
     *   where: {
     *     // ... filter to delete one ReceiptItemGroupTranslation
     *   }
     * })
     * 
     */
    delete<T extends ReceiptItemGroupTranslationDeleteArgs>(args: SelectSubset<T, ReceiptItemGroupTranslationDeleteArgs<ExtArgs>>): Prisma__ReceiptItemGroupTranslationClient<$Result.GetResult<Prisma.$ReceiptItemGroupTranslationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReceiptItemGroupTranslation.
     * @param {ReceiptItemGroupTranslationUpdateArgs} args - Arguments to update one ReceiptItemGroupTranslation.
     * @example
     * // Update one ReceiptItemGroupTranslation
     * const receiptItemGroupTranslation = await prisma.receiptItemGroupTranslation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReceiptItemGroupTranslationUpdateArgs>(args: SelectSubset<T, ReceiptItemGroupTranslationUpdateArgs<ExtArgs>>): Prisma__ReceiptItemGroupTranslationClient<$Result.GetResult<Prisma.$ReceiptItemGroupTranslationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReceiptItemGroupTranslations.
     * @param {ReceiptItemGroupTranslationDeleteManyArgs} args - Arguments to filter ReceiptItemGroupTranslations to delete.
     * @example
     * // Delete a few ReceiptItemGroupTranslations
     * const { count } = await prisma.receiptItemGroupTranslation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReceiptItemGroupTranslationDeleteManyArgs>(args?: SelectSubset<T, ReceiptItemGroupTranslationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReceiptItemGroupTranslations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupTranslationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReceiptItemGroupTranslations
     * const receiptItemGroupTranslation = await prisma.receiptItemGroupTranslation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReceiptItemGroupTranslationUpdateManyArgs>(args: SelectSubset<T, ReceiptItemGroupTranslationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReceiptItemGroupTranslations and returns the data updated in the database.
     * @param {ReceiptItemGroupTranslationUpdateManyAndReturnArgs} args - Arguments to update many ReceiptItemGroupTranslations.
     * @example
     * // Update many ReceiptItemGroupTranslations
     * const receiptItemGroupTranslation = await prisma.receiptItemGroupTranslation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ReceiptItemGroupTranslations and only return the `id`
     * const receiptItemGroupTranslationWithIdOnly = await prisma.receiptItemGroupTranslation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReceiptItemGroupTranslationUpdateManyAndReturnArgs>(args: SelectSubset<T, ReceiptItemGroupTranslationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemGroupTranslationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ReceiptItemGroupTranslation.
     * @param {ReceiptItemGroupTranslationUpsertArgs} args - Arguments to update or create a ReceiptItemGroupTranslation.
     * @example
     * // Update or create a ReceiptItemGroupTranslation
     * const receiptItemGroupTranslation = await prisma.receiptItemGroupTranslation.upsert({
     *   create: {
     *     // ... data to create a ReceiptItemGroupTranslation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReceiptItemGroupTranslation we want to update
     *   }
     * })
     */
    upsert<T extends ReceiptItemGroupTranslationUpsertArgs>(args: SelectSubset<T, ReceiptItemGroupTranslationUpsertArgs<ExtArgs>>): Prisma__ReceiptItemGroupTranslationClient<$Result.GetResult<Prisma.$ReceiptItemGroupTranslationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReceiptItemGroupTranslations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupTranslationCountArgs} args - Arguments to filter ReceiptItemGroupTranslations to count.
     * @example
     * // Count the number of ReceiptItemGroupTranslations
     * const count = await prisma.receiptItemGroupTranslation.count({
     *   where: {
     *     // ... the filter for the ReceiptItemGroupTranslations we want to count
     *   }
     * })
    **/
    count<T extends ReceiptItemGroupTranslationCountArgs>(
      args?: Subset<T, ReceiptItemGroupTranslationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReceiptItemGroupTranslationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReceiptItemGroupTranslation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupTranslationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReceiptItemGroupTranslationAggregateArgs>(args: Subset<T, ReceiptItemGroupTranslationAggregateArgs>): Prisma.PrismaPromise<GetReceiptItemGroupTranslationAggregateType<T>>

    /**
     * Group by ReceiptItemGroupTranslation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemGroupTranslationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReceiptItemGroupTranslationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReceiptItemGroupTranslationGroupByArgs['orderBy'] }
        : { orderBy?: ReceiptItemGroupTranslationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReceiptItemGroupTranslationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReceiptItemGroupTranslationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReceiptItemGroupTranslation model
   */
  readonly fields: ReceiptItemGroupTranslationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReceiptItemGroupTranslation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReceiptItemGroupTranslationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    itemGroup<T extends ReceiptItemGroupDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReceiptItemGroupDefaultArgs<ExtArgs>>): Prisma__ReceiptItemGroupClient<$Result.GetResult<Prisma.$ReceiptItemGroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReceiptItemGroupTranslation model
   */
  interface ReceiptItemGroupTranslationFieldRefs {
    readonly id: FieldRef<"ReceiptItemGroupTranslation", 'String'>
    readonly itemGroupId: FieldRef<"ReceiptItemGroupTranslation", 'String'>
    readonly label: FieldRef<"ReceiptItemGroupTranslation", 'String'>
    readonly description: FieldRef<"ReceiptItemGroupTranslation", 'String'>
    readonly language: FieldRef<"ReceiptItemGroupTranslation", 'String'>
    readonly lightModeLabelHexColor: FieldRef<"ReceiptItemGroupTranslation", 'String'>
    readonly darkModeLabelHexColor: FieldRef<"ReceiptItemGroupTranslation", 'String'>
    readonly createdAt: FieldRef<"ReceiptItemGroupTranslation", 'DateTime'>
    readonly updatedAt: FieldRef<"ReceiptItemGroupTranslation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ReceiptItemGroupTranslation findUnique
   */
  export type ReceiptItemGroupTranslationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroupTranslation
     */
    select?: ReceiptItemGroupTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroupTranslation
     */
    omit?: ReceiptItemGroupTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupTranslationInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemGroupTranslation to fetch.
     */
    where: ReceiptItemGroupTranslationWhereUniqueInput
  }

  /**
   * ReceiptItemGroupTranslation findUniqueOrThrow
   */
  export type ReceiptItemGroupTranslationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroupTranslation
     */
    select?: ReceiptItemGroupTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroupTranslation
     */
    omit?: ReceiptItemGroupTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupTranslationInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemGroupTranslation to fetch.
     */
    where: ReceiptItemGroupTranslationWhereUniqueInput
  }

  /**
   * ReceiptItemGroupTranslation findFirst
   */
  export type ReceiptItemGroupTranslationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroupTranslation
     */
    select?: ReceiptItemGroupTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroupTranslation
     */
    omit?: ReceiptItemGroupTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupTranslationInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemGroupTranslation to fetch.
     */
    where?: ReceiptItemGroupTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemGroupTranslations to fetch.
     */
    orderBy?: ReceiptItemGroupTranslationOrderByWithRelationInput | ReceiptItemGroupTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReceiptItemGroupTranslations.
     */
    cursor?: ReceiptItemGroupTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemGroupTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemGroupTranslations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReceiptItemGroupTranslations.
     */
    distinct?: ReceiptItemGroupTranslationScalarFieldEnum | ReceiptItemGroupTranslationScalarFieldEnum[]
  }

  /**
   * ReceiptItemGroupTranslation findFirstOrThrow
   */
  export type ReceiptItemGroupTranslationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroupTranslation
     */
    select?: ReceiptItemGroupTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroupTranslation
     */
    omit?: ReceiptItemGroupTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupTranslationInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemGroupTranslation to fetch.
     */
    where?: ReceiptItemGroupTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemGroupTranslations to fetch.
     */
    orderBy?: ReceiptItemGroupTranslationOrderByWithRelationInput | ReceiptItemGroupTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReceiptItemGroupTranslations.
     */
    cursor?: ReceiptItemGroupTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemGroupTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemGroupTranslations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReceiptItemGroupTranslations.
     */
    distinct?: ReceiptItemGroupTranslationScalarFieldEnum | ReceiptItemGroupTranslationScalarFieldEnum[]
  }

  /**
   * ReceiptItemGroupTranslation findMany
   */
  export type ReceiptItemGroupTranslationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroupTranslation
     */
    select?: ReceiptItemGroupTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroupTranslation
     */
    omit?: ReceiptItemGroupTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupTranslationInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemGroupTranslations to fetch.
     */
    where?: ReceiptItemGroupTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemGroupTranslations to fetch.
     */
    orderBy?: ReceiptItemGroupTranslationOrderByWithRelationInput | ReceiptItemGroupTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReceiptItemGroupTranslations.
     */
    cursor?: ReceiptItemGroupTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemGroupTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemGroupTranslations.
     */
    skip?: number
    distinct?: ReceiptItemGroupTranslationScalarFieldEnum | ReceiptItemGroupTranslationScalarFieldEnum[]
  }

  /**
   * ReceiptItemGroupTranslation create
   */
  export type ReceiptItemGroupTranslationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroupTranslation
     */
    select?: ReceiptItemGroupTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroupTranslation
     */
    omit?: ReceiptItemGroupTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupTranslationInclude<ExtArgs> | null
    /**
     * The data needed to create a ReceiptItemGroupTranslation.
     */
    data: XOR<ReceiptItemGroupTranslationCreateInput, ReceiptItemGroupTranslationUncheckedCreateInput>
  }

  /**
   * ReceiptItemGroupTranslation createMany
   */
  export type ReceiptItemGroupTranslationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReceiptItemGroupTranslations.
     */
    data: ReceiptItemGroupTranslationCreateManyInput | ReceiptItemGroupTranslationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReceiptItemGroupTranslation createManyAndReturn
   */
  export type ReceiptItemGroupTranslationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroupTranslation
     */
    select?: ReceiptItemGroupTranslationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroupTranslation
     */
    omit?: ReceiptItemGroupTranslationOmit<ExtArgs> | null
    /**
     * The data used to create many ReceiptItemGroupTranslations.
     */
    data: ReceiptItemGroupTranslationCreateManyInput | ReceiptItemGroupTranslationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupTranslationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReceiptItemGroupTranslation update
   */
  export type ReceiptItemGroupTranslationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroupTranslation
     */
    select?: ReceiptItemGroupTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroupTranslation
     */
    omit?: ReceiptItemGroupTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupTranslationInclude<ExtArgs> | null
    /**
     * The data needed to update a ReceiptItemGroupTranslation.
     */
    data: XOR<ReceiptItemGroupTranslationUpdateInput, ReceiptItemGroupTranslationUncheckedUpdateInput>
    /**
     * Choose, which ReceiptItemGroupTranslation to update.
     */
    where: ReceiptItemGroupTranslationWhereUniqueInput
  }

  /**
   * ReceiptItemGroupTranslation updateMany
   */
  export type ReceiptItemGroupTranslationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReceiptItemGroupTranslations.
     */
    data: XOR<ReceiptItemGroupTranslationUpdateManyMutationInput, ReceiptItemGroupTranslationUncheckedUpdateManyInput>
    /**
     * Filter which ReceiptItemGroupTranslations to update
     */
    where?: ReceiptItemGroupTranslationWhereInput
    /**
     * Limit how many ReceiptItemGroupTranslations to update.
     */
    limit?: number
  }

  /**
   * ReceiptItemGroupTranslation updateManyAndReturn
   */
  export type ReceiptItemGroupTranslationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroupTranslation
     */
    select?: ReceiptItemGroupTranslationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroupTranslation
     */
    omit?: ReceiptItemGroupTranslationOmit<ExtArgs> | null
    /**
     * The data used to update ReceiptItemGroupTranslations.
     */
    data: XOR<ReceiptItemGroupTranslationUpdateManyMutationInput, ReceiptItemGroupTranslationUncheckedUpdateManyInput>
    /**
     * Filter which ReceiptItemGroupTranslations to update
     */
    where?: ReceiptItemGroupTranslationWhereInput
    /**
     * Limit how many ReceiptItemGroupTranslations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupTranslationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReceiptItemGroupTranslation upsert
   */
  export type ReceiptItemGroupTranslationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroupTranslation
     */
    select?: ReceiptItemGroupTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroupTranslation
     */
    omit?: ReceiptItemGroupTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupTranslationInclude<ExtArgs> | null
    /**
     * The filter to search for the ReceiptItemGroupTranslation to update in case it exists.
     */
    where: ReceiptItemGroupTranslationWhereUniqueInput
    /**
     * In case the ReceiptItemGroupTranslation found by the `where` argument doesn't exist, create a new ReceiptItemGroupTranslation with this data.
     */
    create: XOR<ReceiptItemGroupTranslationCreateInput, ReceiptItemGroupTranslationUncheckedCreateInput>
    /**
     * In case the ReceiptItemGroupTranslation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReceiptItemGroupTranslationUpdateInput, ReceiptItemGroupTranslationUncheckedUpdateInput>
  }

  /**
   * ReceiptItemGroupTranslation delete
   */
  export type ReceiptItemGroupTranslationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroupTranslation
     */
    select?: ReceiptItemGroupTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroupTranslation
     */
    omit?: ReceiptItemGroupTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupTranslationInclude<ExtArgs> | null
    /**
     * Filter which ReceiptItemGroupTranslation to delete.
     */
    where: ReceiptItemGroupTranslationWhereUniqueInput
  }

  /**
   * ReceiptItemGroupTranslation deleteMany
   */
  export type ReceiptItemGroupTranslationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReceiptItemGroupTranslations to delete
     */
    where?: ReceiptItemGroupTranslationWhereInput
    /**
     * Limit how many ReceiptItemGroupTranslations to delete.
     */
    limit?: number
  }

  /**
   * ReceiptItemGroupTranslation without action
   */
  export type ReceiptItemGroupTranslationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemGroupTranslation
     */
    select?: ReceiptItemGroupTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemGroupTranslation
     */
    omit?: ReceiptItemGroupTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemGroupTranslationInclude<ExtArgs> | null
  }


  /**
   * Model ReceiptItemSupplementTranslation
   */

  export type AggregateReceiptItemSupplementTranslation = {
    _count: ReceiptItemSupplementTranslationCountAggregateOutputType | null
    _min: ReceiptItemSupplementTranslationMinAggregateOutputType | null
    _max: ReceiptItemSupplementTranslationMaxAggregateOutputType | null
  }

  export type ReceiptItemSupplementTranslationMinAggregateOutputType = {
    id: string | null
    supplementId: string | null
    label: string | null
    description: string | null
    language: string | null
    lightModeLabelHexColor: string | null
    darkModeLabelHexColor: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReceiptItemSupplementTranslationMaxAggregateOutputType = {
    id: string | null
    supplementId: string | null
    label: string | null
    description: string | null
    language: string | null
    lightModeLabelHexColor: string | null
    darkModeLabelHexColor: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReceiptItemSupplementTranslationCountAggregateOutputType = {
    id: number
    supplementId: number
    label: number
    description: number
    language: number
    lightModeLabelHexColor: number
    darkModeLabelHexColor: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ReceiptItemSupplementTranslationMinAggregateInputType = {
    id?: true
    supplementId?: true
    label?: true
    description?: true
    language?: true
    lightModeLabelHexColor?: true
    darkModeLabelHexColor?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReceiptItemSupplementTranslationMaxAggregateInputType = {
    id?: true
    supplementId?: true
    label?: true
    description?: true
    language?: true
    lightModeLabelHexColor?: true
    darkModeLabelHexColor?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReceiptItemSupplementTranslationCountAggregateInputType = {
    id?: true
    supplementId?: true
    label?: true
    description?: true
    language?: true
    lightModeLabelHexColor?: true
    darkModeLabelHexColor?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ReceiptItemSupplementTranslationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReceiptItemSupplementTranslation to aggregate.
     */
    where?: ReceiptItemSupplementTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemSupplementTranslations to fetch.
     */
    orderBy?: ReceiptItemSupplementTranslationOrderByWithRelationInput | ReceiptItemSupplementTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReceiptItemSupplementTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemSupplementTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemSupplementTranslations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReceiptItemSupplementTranslations
    **/
    _count?: true | ReceiptItemSupplementTranslationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReceiptItemSupplementTranslationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReceiptItemSupplementTranslationMaxAggregateInputType
  }

  export type GetReceiptItemSupplementTranslationAggregateType<T extends ReceiptItemSupplementTranslationAggregateArgs> = {
        [P in keyof T & keyof AggregateReceiptItemSupplementTranslation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReceiptItemSupplementTranslation[P]>
      : GetScalarType<T[P], AggregateReceiptItemSupplementTranslation[P]>
  }




  export type ReceiptItemSupplementTranslationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceiptItemSupplementTranslationWhereInput
    orderBy?: ReceiptItemSupplementTranslationOrderByWithAggregationInput | ReceiptItemSupplementTranslationOrderByWithAggregationInput[]
    by: ReceiptItemSupplementTranslationScalarFieldEnum[] | ReceiptItemSupplementTranslationScalarFieldEnum
    having?: ReceiptItemSupplementTranslationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReceiptItemSupplementTranslationCountAggregateInputType | true
    _min?: ReceiptItemSupplementTranslationMinAggregateInputType
    _max?: ReceiptItemSupplementTranslationMaxAggregateInputType
  }

  export type ReceiptItemSupplementTranslationGroupByOutputType = {
    id: string
    supplementId: string
    label: string
    description: string
    language: string
    lightModeLabelHexColor: string
    darkModeLabelHexColor: string
    createdAt: Date
    updatedAt: Date
    _count: ReceiptItemSupplementTranslationCountAggregateOutputType | null
    _min: ReceiptItemSupplementTranslationMinAggregateOutputType | null
    _max: ReceiptItemSupplementTranslationMaxAggregateOutputType | null
  }

  type GetReceiptItemSupplementTranslationGroupByPayload<T extends ReceiptItemSupplementTranslationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReceiptItemSupplementTranslationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReceiptItemSupplementTranslationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReceiptItemSupplementTranslationGroupByOutputType[P]>
            : GetScalarType<T[P], ReceiptItemSupplementTranslationGroupByOutputType[P]>
        }
      >
    >


  export type ReceiptItemSupplementTranslationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    supplementId?: boolean
    label?: boolean
    description?: boolean
    language?: boolean
    lightModeLabelHexColor?: boolean
    darkModeLabelHexColor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    supplement?: boolean | ReceiptItemSupplementDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItemSupplementTranslation"]>

  export type ReceiptItemSupplementTranslationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    supplementId?: boolean
    label?: boolean
    description?: boolean
    language?: boolean
    lightModeLabelHexColor?: boolean
    darkModeLabelHexColor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    supplement?: boolean | ReceiptItemSupplementDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItemSupplementTranslation"]>

  export type ReceiptItemSupplementTranslationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    supplementId?: boolean
    label?: boolean
    description?: boolean
    language?: boolean
    lightModeLabelHexColor?: boolean
    darkModeLabelHexColor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    supplement?: boolean | ReceiptItemSupplementDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiptItemSupplementTranslation"]>

  export type ReceiptItemSupplementTranslationSelectScalar = {
    id?: boolean
    supplementId?: boolean
    label?: boolean
    description?: boolean
    language?: boolean
    lightModeLabelHexColor?: boolean
    darkModeLabelHexColor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ReceiptItemSupplementTranslationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "supplementId" | "label" | "description" | "language" | "lightModeLabelHexColor" | "darkModeLabelHexColor" | "createdAt" | "updatedAt", ExtArgs["result"]["receiptItemSupplementTranslation"]>
  export type ReceiptItemSupplementTranslationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    supplement?: boolean | ReceiptItemSupplementDefaultArgs<ExtArgs>
  }
  export type ReceiptItemSupplementTranslationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    supplement?: boolean | ReceiptItemSupplementDefaultArgs<ExtArgs>
  }
  export type ReceiptItemSupplementTranslationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    supplement?: boolean | ReceiptItemSupplementDefaultArgs<ExtArgs>
  }

  export type $ReceiptItemSupplementTranslationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReceiptItemSupplementTranslation"
    objects: {
      supplement: Prisma.$ReceiptItemSupplementPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      supplementId: string
      label: string
      description: string
      language: string
      lightModeLabelHexColor: string
      darkModeLabelHexColor: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["receiptItemSupplementTranslation"]>
    composites: {}
  }

  type ReceiptItemSupplementTranslationGetPayload<S extends boolean | null | undefined | ReceiptItemSupplementTranslationDefaultArgs> = $Result.GetResult<Prisma.$ReceiptItemSupplementTranslationPayload, S>

  type ReceiptItemSupplementTranslationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReceiptItemSupplementTranslationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReceiptItemSupplementTranslationCountAggregateInputType | true
    }

  export interface ReceiptItemSupplementTranslationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReceiptItemSupplementTranslation'], meta: { name: 'ReceiptItemSupplementTranslation' } }
    /**
     * Find zero or one ReceiptItemSupplementTranslation that matches the filter.
     * @param {ReceiptItemSupplementTranslationFindUniqueArgs} args - Arguments to find a ReceiptItemSupplementTranslation
     * @example
     * // Get one ReceiptItemSupplementTranslation
     * const receiptItemSupplementTranslation = await prisma.receiptItemSupplementTranslation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReceiptItemSupplementTranslationFindUniqueArgs>(args: SelectSubset<T, ReceiptItemSupplementTranslationFindUniqueArgs<ExtArgs>>): Prisma__ReceiptItemSupplementTranslationClient<$Result.GetResult<Prisma.$ReceiptItemSupplementTranslationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReceiptItemSupplementTranslation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReceiptItemSupplementTranslationFindUniqueOrThrowArgs} args - Arguments to find a ReceiptItemSupplementTranslation
     * @example
     * // Get one ReceiptItemSupplementTranslation
     * const receiptItemSupplementTranslation = await prisma.receiptItemSupplementTranslation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReceiptItemSupplementTranslationFindUniqueOrThrowArgs>(args: SelectSubset<T, ReceiptItemSupplementTranslationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReceiptItemSupplementTranslationClient<$Result.GetResult<Prisma.$ReceiptItemSupplementTranslationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReceiptItemSupplementTranslation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemSupplementTranslationFindFirstArgs} args - Arguments to find a ReceiptItemSupplementTranslation
     * @example
     * // Get one ReceiptItemSupplementTranslation
     * const receiptItemSupplementTranslation = await prisma.receiptItemSupplementTranslation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReceiptItemSupplementTranslationFindFirstArgs>(args?: SelectSubset<T, ReceiptItemSupplementTranslationFindFirstArgs<ExtArgs>>): Prisma__ReceiptItemSupplementTranslationClient<$Result.GetResult<Prisma.$ReceiptItemSupplementTranslationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReceiptItemSupplementTranslation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemSupplementTranslationFindFirstOrThrowArgs} args - Arguments to find a ReceiptItemSupplementTranslation
     * @example
     * // Get one ReceiptItemSupplementTranslation
     * const receiptItemSupplementTranslation = await prisma.receiptItemSupplementTranslation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReceiptItemSupplementTranslationFindFirstOrThrowArgs>(args?: SelectSubset<T, ReceiptItemSupplementTranslationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReceiptItemSupplementTranslationClient<$Result.GetResult<Prisma.$ReceiptItemSupplementTranslationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReceiptItemSupplementTranslations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemSupplementTranslationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReceiptItemSupplementTranslations
     * const receiptItemSupplementTranslations = await prisma.receiptItemSupplementTranslation.findMany()
     * 
     * // Get first 10 ReceiptItemSupplementTranslations
     * const receiptItemSupplementTranslations = await prisma.receiptItemSupplementTranslation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const receiptItemSupplementTranslationWithIdOnly = await prisma.receiptItemSupplementTranslation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReceiptItemSupplementTranslationFindManyArgs>(args?: SelectSubset<T, ReceiptItemSupplementTranslationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemSupplementTranslationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReceiptItemSupplementTranslation.
     * @param {ReceiptItemSupplementTranslationCreateArgs} args - Arguments to create a ReceiptItemSupplementTranslation.
     * @example
     * // Create one ReceiptItemSupplementTranslation
     * const ReceiptItemSupplementTranslation = await prisma.receiptItemSupplementTranslation.create({
     *   data: {
     *     // ... data to create a ReceiptItemSupplementTranslation
     *   }
     * })
     * 
     */
    create<T extends ReceiptItemSupplementTranslationCreateArgs>(args: SelectSubset<T, ReceiptItemSupplementTranslationCreateArgs<ExtArgs>>): Prisma__ReceiptItemSupplementTranslationClient<$Result.GetResult<Prisma.$ReceiptItemSupplementTranslationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReceiptItemSupplementTranslations.
     * @param {ReceiptItemSupplementTranslationCreateManyArgs} args - Arguments to create many ReceiptItemSupplementTranslations.
     * @example
     * // Create many ReceiptItemSupplementTranslations
     * const receiptItemSupplementTranslation = await prisma.receiptItemSupplementTranslation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReceiptItemSupplementTranslationCreateManyArgs>(args?: SelectSubset<T, ReceiptItemSupplementTranslationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReceiptItemSupplementTranslations and returns the data saved in the database.
     * @param {ReceiptItemSupplementTranslationCreateManyAndReturnArgs} args - Arguments to create many ReceiptItemSupplementTranslations.
     * @example
     * // Create many ReceiptItemSupplementTranslations
     * const receiptItemSupplementTranslation = await prisma.receiptItemSupplementTranslation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReceiptItemSupplementTranslations and only return the `id`
     * const receiptItemSupplementTranslationWithIdOnly = await prisma.receiptItemSupplementTranslation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReceiptItemSupplementTranslationCreateManyAndReturnArgs>(args?: SelectSubset<T, ReceiptItemSupplementTranslationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemSupplementTranslationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ReceiptItemSupplementTranslation.
     * @param {ReceiptItemSupplementTranslationDeleteArgs} args - Arguments to delete one ReceiptItemSupplementTranslation.
     * @example
     * // Delete one ReceiptItemSupplementTranslation
     * const ReceiptItemSupplementTranslation = await prisma.receiptItemSupplementTranslation.delete({
     *   where: {
     *     // ... filter to delete one ReceiptItemSupplementTranslation
     *   }
     * })
     * 
     */
    delete<T extends ReceiptItemSupplementTranslationDeleteArgs>(args: SelectSubset<T, ReceiptItemSupplementTranslationDeleteArgs<ExtArgs>>): Prisma__ReceiptItemSupplementTranslationClient<$Result.GetResult<Prisma.$ReceiptItemSupplementTranslationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReceiptItemSupplementTranslation.
     * @param {ReceiptItemSupplementTranslationUpdateArgs} args - Arguments to update one ReceiptItemSupplementTranslation.
     * @example
     * // Update one ReceiptItemSupplementTranslation
     * const receiptItemSupplementTranslation = await prisma.receiptItemSupplementTranslation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReceiptItemSupplementTranslationUpdateArgs>(args: SelectSubset<T, ReceiptItemSupplementTranslationUpdateArgs<ExtArgs>>): Prisma__ReceiptItemSupplementTranslationClient<$Result.GetResult<Prisma.$ReceiptItemSupplementTranslationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReceiptItemSupplementTranslations.
     * @param {ReceiptItemSupplementTranslationDeleteManyArgs} args - Arguments to filter ReceiptItemSupplementTranslations to delete.
     * @example
     * // Delete a few ReceiptItemSupplementTranslations
     * const { count } = await prisma.receiptItemSupplementTranslation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReceiptItemSupplementTranslationDeleteManyArgs>(args?: SelectSubset<T, ReceiptItemSupplementTranslationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReceiptItemSupplementTranslations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemSupplementTranslationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReceiptItemSupplementTranslations
     * const receiptItemSupplementTranslation = await prisma.receiptItemSupplementTranslation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReceiptItemSupplementTranslationUpdateManyArgs>(args: SelectSubset<T, ReceiptItemSupplementTranslationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReceiptItemSupplementTranslations and returns the data updated in the database.
     * @param {ReceiptItemSupplementTranslationUpdateManyAndReturnArgs} args - Arguments to update many ReceiptItemSupplementTranslations.
     * @example
     * // Update many ReceiptItemSupplementTranslations
     * const receiptItemSupplementTranslation = await prisma.receiptItemSupplementTranslation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ReceiptItemSupplementTranslations and only return the `id`
     * const receiptItemSupplementTranslationWithIdOnly = await prisma.receiptItemSupplementTranslation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReceiptItemSupplementTranslationUpdateManyAndReturnArgs>(args: SelectSubset<T, ReceiptItemSupplementTranslationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiptItemSupplementTranslationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ReceiptItemSupplementTranslation.
     * @param {ReceiptItemSupplementTranslationUpsertArgs} args - Arguments to update or create a ReceiptItemSupplementTranslation.
     * @example
     * // Update or create a ReceiptItemSupplementTranslation
     * const receiptItemSupplementTranslation = await prisma.receiptItemSupplementTranslation.upsert({
     *   create: {
     *     // ... data to create a ReceiptItemSupplementTranslation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReceiptItemSupplementTranslation we want to update
     *   }
     * })
     */
    upsert<T extends ReceiptItemSupplementTranslationUpsertArgs>(args: SelectSubset<T, ReceiptItemSupplementTranslationUpsertArgs<ExtArgs>>): Prisma__ReceiptItemSupplementTranslationClient<$Result.GetResult<Prisma.$ReceiptItemSupplementTranslationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReceiptItemSupplementTranslations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemSupplementTranslationCountArgs} args - Arguments to filter ReceiptItemSupplementTranslations to count.
     * @example
     * // Count the number of ReceiptItemSupplementTranslations
     * const count = await prisma.receiptItemSupplementTranslation.count({
     *   where: {
     *     // ... the filter for the ReceiptItemSupplementTranslations we want to count
     *   }
     * })
    **/
    count<T extends ReceiptItemSupplementTranslationCountArgs>(
      args?: Subset<T, ReceiptItemSupplementTranslationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReceiptItemSupplementTranslationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReceiptItemSupplementTranslation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemSupplementTranslationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReceiptItemSupplementTranslationAggregateArgs>(args: Subset<T, ReceiptItemSupplementTranslationAggregateArgs>): Prisma.PrismaPromise<GetReceiptItemSupplementTranslationAggregateType<T>>

    /**
     * Group by ReceiptItemSupplementTranslation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiptItemSupplementTranslationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReceiptItemSupplementTranslationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReceiptItemSupplementTranslationGroupByArgs['orderBy'] }
        : { orderBy?: ReceiptItemSupplementTranslationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReceiptItemSupplementTranslationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReceiptItemSupplementTranslationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReceiptItemSupplementTranslation model
   */
  readonly fields: ReceiptItemSupplementTranslationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReceiptItemSupplementTranslation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReceiptItemSupplementTranslationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    supplement<T extends ReceiptItemSupplementDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReceiptItemSupplementDefaultArgs<ExtArgs>>): Prisma__ReceiptItemSupplementClient<$Result.GetResult<Prisma.$ReceiptItemSupplementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReceiptItemSupplementTranslation model
   */
  interface ReceiptItemSupplementTranslationFieldRefs {
    readonly id: FieldRef<"ReceiptItemSupplementTranslation", 'String'>
    readonly supplementId: FieldRef<"ReceiptItemSupplementTranslation", 'String'>
    readonly label: FieldRef<"ReceiptItemSupplementTranslation", 'String'>
    readonly description: FieldRef<"ReceiptItemSupplementTranslation", 'String'>
    readonly language: FieldRef<"ReceiptItemSupplementTranslation", 'String'>
    readonly lightModeLabelHexColor: FieldRef<"ReceiptItemSupplementTranslation", 'String'>
    readonly darkModeLabelHexColor: FieldRef<"ReceiptItemSupplementTranslation", 'String'>
    readonly createdAt: FieldRef<"ReceiptItemSupplementTranslation", 'DateTime'>
    readonly updatedAt: FieldRef<"ReceiptItemSupplementTranslation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ReceiptItemSupplementTranslation findUnique
   */
  export type ReceiptItemSupplementTranslationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplementTranslation
     */
    select?: ReceiptItemSupplementTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplementTranslation
     */
    omit?: ReceiptItemSupplementTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementTranslationInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemSupplementTranslation to fetch.
     */
    where: ReceiptItemSupplementTranslationWhereUniqueInput
  }

  /**
   * ReceiptItemSupplementTranslation findUniqueOrThrow
   */
  export type ReceiptItemSupplementTranslationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplementTranslation
     */
    select?: ReceiptItemSupplementTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplementTranslation
     */
    omit?: ReceiptItemSupplementTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementTranslationInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemSupplementTranslation to fetch.
     */
    where: ReceiptItemSupplementTranslationWhereUniqueInput
  }

  /**
   * ReceiptItemSupplementTranslation findFirst
   */
  export type ReceiptItemSupplementTranslationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplementTranslation
     */
    select?: ReceiptItemSupplementTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplementTranslation
     */
    omit?: ReceiptItemSupplementTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementTranslationInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemSupplementTranslation to fetch.
     */
    where?: ReceiptItemSupplementTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemSupplementTranslations to fetch.
     */
    orderBy?: ReceiptItemSupplementTranslationOrderByWithRelationInput | ReceiptItemSupplementTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReceiptItemSupplementTranslations.
     */
    cursor?: ReceiptItemSupplementTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemSupplementTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemSupplementTranslations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReceiptItemSupplementTranslations.
     */
    distinct?: ReceiptItemSupplementTranslationScalarFieldEnum | ReceiptItemSupplementTranslationScalarFieldEnum[]
  }

  /**
   * ReceiptItemSupplementTranslation findFirstOrThrow
   */
  export type ReceiptItemSupplementTranslationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplementTranslation
     */
    select?: ReceiptItemSupplementTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplementTranslation
     */
    omit?: ReceiptItemSupplementTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementTranslationInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemSupplementTranslation to fetch.
     */
    where?: ReceiptItemSupplementTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemSupplementTranslations to fetch.
     */
    orderBy?: ReceiptItemSupplementTranslationOrderByWithRelationInput | ReceiptItemSupplementTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReceiptItemSupplementTranslations.
     */
    cursor?: ReceiptItemSupplementTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemSupplementTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemSupplementTranslations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReceiptItemSupplementTranslations.
     */
    distinct?: ReceiptItemSupplementTranslationScalarFieldEnum | ReceiptItemSupplementTranslationScalarFieldEnum[]
  }

  /**
   * ReceiptItemSupplementTranslation findMany
   */
  export type ReceiptItemSupplementTranslationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplementTranslation
     */
    select?: ReceiptItemSupplementTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplementTranslation
     */
    omit?: ReceiptItemSupplementTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementTranslationInclude<ExtArgs> | null
    /**
     * Filter, which ReceiptItemSupplementTranslations to fetch.
     */
    where?: ReceiptItemSupplementTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiptItemSupplementTranslations to fetch.
     */
    orderBy?: ReceiptItemSupplementTranslationOrderByWithRelationInput | ReceiptItemSupplementTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReceiptItemSupplementTranslations.
     */
    cursor?: ReceiptItemSupplementTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiptItemSupplementTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiptItemSupplementTranslations.
     */
    skip?: number
    distinct?: ReceiptItemSupplementTranslationScalarFieldEnum | ReceiptItemSupplementTranslationScalarFieldEnum[]
  }

  /**
   * ReceiptItemSupplementTranslation create
   */
  export type ReceiptItemSupplementTranslationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplementTranslation
     */
    select?: ReceiptItemSupplementTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplementTranslation
     */
    omit?: ReceiptItemSupplementTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementTranslationInclude<ExtArgs> | null
    /**
     * The data needed to create a ReceiptItemSupplementTranslation.
     */
    data: XOR<ReceiptItemSupplementTranslationCreateInput, ReceiptItemSupplementTranslationUncheckedCreateInput>
  }

  /**
   * ReceiptItemSupplementTranslation createMany
   */
  export type ReceiptItemSupplementTranslationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReceiptItemSupplementTranslations.
     */
    data: ReceiptItemSupplementTranslationCreateManyInput | ReceiptItemSupplementTranslationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReceiptItemSupplementTranslation createManyAndReturn
   */
  export type ReceiptItemSupplementTranslationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplementTranslation
     */
    select?: ReceiptItemSupplementTranslationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplementTranslation
     */
    omit?: ReceiptItemSupplementTranslationOmit<ExtArgs> | null
    /**
     * The data used to create many ReceiptItemSupplementTranslations.
     */
    data: ReceiptItemSupplementTranslationCreateManyInput | ReceiptItemSupplementTranslationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementTranslationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReceiptItemSupplementTranslation update
   */
  export type ReceiptItemSupplementTranslationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplementTranslation
     */
    select?: ReceiptItemSupplementTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplementTranslation
     */
    omit?: ReceiptItemSupplementTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementTranslationInclude<ExtArgs> | null
    /**
     * The data needed to update a ReceiptItemSupplementTranslation.
     */
    data: XOR<ReceiptItemSupplementTranslationUpdateInput, ReceiptItemSupplementTranslationUncheckedUpdateInput>
    /**
     * Choose, which ReceiptItemSupplementTranslation to update.
     */
    where: ReceiptItemSupplementTranslationWhereUniqueInput
  }

  /**
   * ReceiptItemSupplementTranslation updateMany
   */
  export type ReceiptItemSupplementTranslationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReceiptItemSupplementTranslations.
     */
    data: XOR<ReceiptItemSupplementTranslationUpdateManyMutationInput, ReceiptItemSupplementTranslationUncheckedUpdateManyInput>
    /**
     * Filter which ReceiptItemSupplementTranslations to update
     */
    where?: ReceiptItemSupplementTranslationWhereInput
    /**
     * Limit how many ReceiptItemSupplementTranslations to update.
     */
    limit?: number
  }

  /**
   * ReceiptItemSupplementTranslation updateManyAndReturn
   */
  export type ReceiptItemSupplementTranslationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplementTranslation
     */
    select?: ReceiptItemSupplementTranslationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplementTranslation
     */
    omit?: ReceiptItemSupplementTranslationOmit<ExtArgs> | null
    /**
     * The data used to update ReceiptItemSupplementTranslations.
     */
    data: XOR<ReceiptItemSupplementTranslationUpdateManyMutationInput, ReceiptItemSupplementTranslationUncheckedUpdateManyInput>
    /**
     * Filter which ReceiptItemSupplementTranslations to update
     */
    where?: ReceiptItemSupplementTranslationWhereInput
    /**
     * Limit how many ReceiptItemSupplementTranslations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementTranslationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReceiptItemSupplementTranslation upsert
   */
  export type ReceiptItemSupplementTranslationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplementTranslation
     */
    select?: ReceiptItemSupplementTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplementTranslation
     */
    omit?: ReceiptItemSupplementTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementTranslationInclude<ExtArgs> | null
    /**
     * The filter to search for the ReceiptItemSupplementTranslation to update in case it exists.
     */
    where: ReceiptItemSupplementTranslationWhereUniqueInput
    /**
     * In case the ReceiptItemSupplementTranslation found by the `where` argument doesn't exist, create a new ReceiptItemSupplementTranslation with this data.
     */
    create: XOR<ReceiptItemSupplementTranslationCreateInput, ReceiptItemSupplementTranslationUncheckedCreateInput>
    /**
     * In case the ReceiptItemSupplementTranslation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReceiptItemSupplementTranslationUpdateInput, ReceiptItemSupplementTranslationUncheckedUpdateInput>
  }

  /**
   * ReceiptItemSupplementTranslation delete
   */
  export type ReceiptItemSupplementTranslationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplementTranslation
     */
    select?: ReceiptItemSupplementTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplementTranslation
     */
    omit?: ReceiptItemSupplementTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementTranslationInclude<ExtArgs> | null
    /**
     * Filter which ReceiptItemSupplementTranslation to delete.
     */
    where: ReceiptItemSupplementTranslationWhereUniqueInput
  }

  /**
   * ReceiptItemSupplementTranslation deleteMany
   */
  export type ReceiptItemSupplementTranslationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReceiptItemSupplementTranslations to delete
     */
    where?: ReceiptItemSupplementTranslationWhereInput
    /**
     * Limit how many ReceiptItemSupplementTranslations to delete.
     */
    limit?: number
  }

  /**
   * ReceiptItemSupplementTranslation without action
   */
  export type ReceiptItemSupplementTranslationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiptItemSupplementTranslation
     */
    select?: ReceiptItemSupplementTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiptItemSupplementTranslation
     */
    omit?: ReceiptItemSupplementTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiptItemSupplementTranslationInclude<ExtArgs> | null
  }


  /**
   * Model SmartReceipt
   */

  export type AggregateSmartReceipt = {
    _count: SmartReceiptCountAggregateOutputType | null
    _avg: SmartReceiptAvgAggregateOutputType | null
    _sum: SmartReceiptSumAggregateOutputType | null
    _min: SmartReceiptMinAggregateOutputType | null
    _max: SmartReceiptMaxAggregateOutputType | null
  }

  export type SmartReceiptAvgAggregateOutputType = {
    updatedTotalPrice: number | null
  }

  export type SmartReceiptSumAggregateOutputType = {
    updatedTotalPrice: number | null
  }

  export type SmartReceiptMinAggregateOutputType = {
    id: string | null
    receiptId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    updatedTotalPrice: number | null
    updatedCurrencyCode: string | null
  }

  export type SmartReceiptMaxAggregateOutputType = {
    id: string | null
    receiptId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    updatedTotalPrice: number | null
    updatedCurrencyCode: string | null
  }

  export type SmartReceiptCountAggregateOutputType = {
    id: number
    receiptId: number
    createdAt: number
    updatedAt: number
    updatedTotalPrice: number
    updatedCurrencyCode: number
    _all: number
  }


  export type SmartReceiptAvgAggregateInputType = {
    updatedTotalPrice?: true
  }

  export type SmartReceiptSumAggregateInputType = {
    updatedTotalPrice?: true
  }

  export type SmartReceiptMinAggregateInputType = {
    id?: true
    receiptId?: true
    createdAt?: true
    updatedAt?: true
    updatedTotalPrice?: true
    updatedCurrencyCode?: true
  }

  export type SmartReceiptMaxAggregateInputType = {
    id?: true
    receiptId?: true
    createdAt?: true
    updatedAt?: true
    updatedTotalPrice?: true
    updatedCurrencyCode?: true
  }

  export type SmartReceiptCountAggregateInputType = {
    id?: true
    receiptId?: true
    createdAt?: true
    updatedAt?: true
    updatedTotalPrice?: true
    updatedCurrencyCode?: true
    _all?: true
  }

  export type SmartReceiptAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SmartReceipt to aggregate.
     */
    where?: SmartReceiptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SmartReceipts to fetch.
     */
    orderBy?: SmartReceiptOrderByWithRelationInput | SmartReceiptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SmartReceiptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SmartReceipts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SmartReceipts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SmartReceipts
    **/
    _count?: true | SmartReceiptCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SmartReceiptAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SmartReceiptSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SmartReceiptMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SmartReceiptMaxAggregateInputType
  }

  export type GetSmartReceiptAggregateType<T extends SmartReceiptAggregateArgs> = {
        [P in keyof T & keyof AggregateSmartReceipt]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSmartReceipt[P]>
      : GetScalarType<T[P], AggregateSmartReceipt[P]>
  }




  export type SmartReceiptGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SmartReceiptWhereInput
    orderBy?: SmartReceiptOrderByWithAggregationInput | SmartReceiptOrderByWithAggregationInput[]
    by: SmartReceiptScalarFieldEnum[] | SmartReceiptScalarFieldEnum
    having?: SmartReceiptScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SmartReceiptCountAggregateInputType | true
    _avg?: SmartReceiptAvgAggregateInputType
    _sum?: SmartReceiptSumAggregateInputType
    _min?: SmartReceiptMinAggregateInputType
    _max?: SmartReceiptMaxAggregateInputType
  }

  export type SmartReceiptGroupByOutputType = {
    id: string
    receiptId: string
    createdAt: Date
    updatedAt: Date
    updatedTotalPrice: number | null
    updatedCurrencyCode: string | null
    _count: SmartReceiptCountAggregateOutputType | null
    _avg: SmartReceiptAvgAggregateOutputType | null
    _sum: SmartReceiptSumAggregateOutputType | null
    _min: SmartReceiptMinAggregateOutputType | null
    _max: SmartReceiptMaxAggregateOutputType | null
  }

  type GetSmartReceiptGroupByPayload<T extends SmartReceiptGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SmartReceiptGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SmartReceiptGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SmartReceiptGroupByOutputType[P]>
            : GetScalarType<T[P], SmartReceiptGroupByOutputType[P]>
        }
      >
    >


  export type SmartReceiptSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    receiptId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    updatedTotalPrice?: boolean
    updatedCurrencyCode?: boolean
    receipt?: boolean | ReceiptDefaultArgs<ExtArgs>
    users?: boolean | SmartReceipt$usersArgs<ExtArgs>
    payments?: boolean | SmartReceipt$paymentsArgs<ExtArgs>
    _count?: boolean | SmartReceiptCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["smartReceipt"]>

  export type SmartReceiptSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    receiptId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    updatedTotalPrice?: boolean
    updatedCurrencyCode?: boolean
    receipt?: boolean | ReceiptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["smartReceipt"]>

  export type SmartReceiptSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    receiptId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    updatedTotalPrice?: boolean
    updatedCurrencyCode?: boolean
    receipt?: boolean | ReceiptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["smartReceipt"]>

  export type SmartReceiptSelectScalar = {
    id?: boolean
    receiptId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    updatedTotalPrice?: boolean
    updatedCurrencyCode?: boolean
  }

  export type SmartReceiptOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "receiptId" | "createdAt" | "updatedAt" | "updatedTotalPrice" | "updatedCurrencyCode", ExtArgs["result"]["smartReceipt"]>
  export type SmartReceiptInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receipt?: boolean | ReceiptDefaultArgs<ExtArgs>
    users?: boolean | SmartReceipt$usersArgs<ExtArgs>
    payments?: boolean | SmartReceipt$paymentsArgs<ExtArgs>
    _count?: boolean | SmartReceiptCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SmartReceiptIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receipt?: boolean | ReceiptDefaultArgs<ExtArgs>
  }
  export type SmartReceiptIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receipt?: boolean | ReceiptDefaultArgs<ExtArgs>
  }

  export type $SmartReceiptPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SmartReceipt"
    objects: {
      receipt: Prisma.$ReceiptPayload<ExtArgs>
      users: Prisma.$UserPayload<ExtArgs>[]
      payments: Prisma.$SmartReceiptPaymentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      receiptId: string
      createdAt: Date
      updatedAt: Date
      updatedTotalPrice: number | null
      updatedCurrencyCode: string | null
    }, ExtArgs["result"]["smartReceipt"]>
    composites: {}
  }

  type SmartReceiptGetPayload<S extends boolean | null | undefined | SmartReceiptDefaultArgs> = $Result.GetResult<Prisma.$SmartReceiptPayload, S>

  type SmartReceiptCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SmartReceiptFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SmartReceiptCountAggregateInputType | true
    }

  export interface SmartReceiptDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SmartReceipt'], meta: { name: 'SmartReceipt' } }
    /**
     * Find zero or one SmartReceipt that matches the filter.
     * @param {SmartReceiptFindUniqueArgs} args - Arguments to find a SmartReceipt
     * @example
     * // Get one SmartReceipt
     * const smartReceipt = await prisma.smartReceipt.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SmartReceiptFindUniqueArgs>(args: SelectSubset<T, SmartReceiptFindUniqueArgs<ExtArgs>>): Prisma__SmartReceiptClient<$Result.GetResult<Prisma.$SmartReceiptPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SmartReceipt that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SmartReceiptFindUniqueOrThrowArgs} args - Arguments to find a SmartReceipt
     * @example
     * // Get one SmartReceipt
     * const smartReceipt = await prisma.smartReceipt.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SmartReceiptFindUniqueOrThrowArgs>(args: SelectSubset<T, SmartReceiptFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SmartReceiptClient<$Result.GetResult<Prisma.$SmartReceiptPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SmartReceipt that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SmartReceiptFindFirstArgs} args - Arguments to find a SmartReceipt
     * @example
     * // Get one SmartReceipt
     * const smartReceipt = await prisma.smartReceipt.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SmartReceiptFindFirstArgs>(args?: SelectSubset<T, SmartReceiptFindFirstArgs<ExtArgs>>): Prisma__SmartReceiptClient<$Result.GetResult<Prisma.$SmartReceiptPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SmartReceipt that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SmartReceiptFindFirstOrThrowArgs} args - Arguments to find a SmartReceipt
     * @example
     * // Get one SmartReceipt
     * const smartReceipt = await prisma.smartReceipt.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SmartReceiptFindFirstOrThrowArgs>(args?: SelectSubset<T, SmartReceiptFindFirstOrThrowArgs<ExtArgs>>): Prisma__SmartReceiptClient<$Result.GetResult<Prisma.$SmartReceiptPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SmartReceipts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SmartReceiptFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SmartReceipts
     * const smartReceipts = await prisma.smartReceipt.findMany()
     * 
     * // Get first 10 SmartReceipts
     * const smartReceipts = await prisma.smartReceipt.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const smartReceiptWithIdOnly = await prisma.smartReceipt.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SmartReceiptFindManyArgs>(args?: SelectSubset<T, SmartReceiptFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SmartReceiptPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SmartReceipt.
     * @param {SmartReceiptCreateArgs} args - Arguments to create a SmartReceipt.
     * @example
     * // Create one SmartReceipt
     * const SmartReceipt = await prisma.smartReceipt.create({
     *   data: {
     *     // ... data to create a SmartReceipt
     *   }
     * })
     * 
     */
    create<T extends SmartReceiptCreateArgs>(args: SelectSubset<T, SmartReceiptCreateArgs<ExtArgs>>): Prisma__SmartReceiptClient<$Result.GetResult<Prisma.$SmartReceiptPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SmartReceipts.
     * @param {SmartReceiptCreateManyArgs} args - Arguments to create many SmartReceipts.
     * @example
     * // Create many SmartReceipts
     * const smartReceipt = await prisma.smartReceipt.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SmartReceiptCreateManyArgs>(args?: SelectSubset<T, SmartReceiptCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SmartReceipts and returns the data saved in the database.
     * @param {SmartReceiptCreateManyAndReturnArgs} args - Arguments to create many SmartReceipts.
     * @example
     * // Create many SmartReceipts
     * const smartReceipt = await prisma.smartReceipt.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SmartReceipts and only return the `id`
     * const smartReceiptWithIdOnly = await prisma.smartReceipt.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SmartReceiptCreateManyAndReturnArgs>(args?: SelectSubset<T, SmartReceiptCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SmartReceiptPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SmartReceipt.
     * @param {SmartReceiptDeleteArgs} args - Arguments to delete one SmartReceipt.
     * @example
     * // Delete one SmartReceipt
     * const SmartReceipt = await prisma.smartReceipt.delete({
     *   where: {
     *     // ... filter to delete one SmartReceipt
     *   }
     * })
     * 
     */
    delete<T extends SmartReceiptDeleteArgs>(args: SelectSubset<T, SmartReceiptDeleteArgs<ExtArgs>>): Prisma__SmartReceiptClient<$Result.GetResult<Prisma.$SmartReceiptPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SmartReceipt.
     * @param {SmartReceiptUpdateArgs} args - Arguments to update one SmartReceipt.
     * @example
     * // Update one SmartReceipt
     * const smartReceipt = await prisma.smartReceipt.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SmartReceiptUpdateArgs>(args: SelectSubset<T, SmartReceiptUpdateArgs<ExtArgs>>): Prisma__SmartReceiptClient<$Result.GetResult<Prisma.$SmartReceiptPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SmartReceipts.
     * @param {SmartReceiptDeleteManyArgs} args - Arguments to filter SmartReceipts to delete.
     * @example
     * // Delete a few SmartReceipts
     * const { count } = await prisma.smartReceipt.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SmartReceiptDeleteManyArgs>(args?: SelectSubset<T, SmartReceiptDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SmartReceipts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SmartReceiptUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SmartReceipts
     * const smartReceipt = await prisma.smartReceipt.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SmartReceiptUpdateManyArgs>(args: SelectSubset<T, SmartReceiptUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SmartReceipts and returns the data updated in the database.
     * @param {SmartReceiptUpdateManyAndReturnArgs} args - Arguments to update many SmartReceipts.
     * @example
     * // Update many SmartReceipts
     * const smartReceipt = await prisma.smartReceipt.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SmartReceipts and only return the `id`
     * const smartReceiptWithIdOnly = await prisma.smartReceipt.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SmartReceiptUpdateManyAndReturnArgs>(args: SelectSubset<T, SmartReceiptUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SmartReceiptPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SmartReceipt.
     * @param {SmartReceiptUpsertArgs} args - Arguments to update or create a SmartReceipt.
     * @example
     * // Update or create a SmartReceipt
     * const smartReceipt = await prisma.smartReceipt.upsert({
     *   create: {
     *     // ... data to create a SmartReceipt
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SmartReceipt we want to update
     *   }
     * })
     */
    upsert<T extends SmartReceiptUpsertArgs>(args: SelectSubset<T, SmartReceiptUpsertArgs<ExtArgs>>): Prisma__SmartReceiptClient<$Result.GetResult<Prisma.$SmartReceiptPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SmartReceipts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SmartReceiptCountArgs} args - Arguments to filter SmartReceipts to count.
     * @example
     * // Count the number of SmartReceipts
     * const count = await prisma.smartReceipt.count({
     *   where: {
     *     // ... the filter for the SmartReceipts we want to count
     *   }
     * })
    **/
    count<T extends SmartReceiptCountArgs>(
      args?: Subset<T, SmartReceiptCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SmartReceiptCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SmartReceipt.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SmartReceiptAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SmartReceiptAggregateArgs>(args: Subset<T, SmartReceiptAggregateArgs>): Prisma.PrismaPromise<GetSmartReceiptAggregateType<T>>

    /**
     * Group by SmartReceipt.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SmartReceiptGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SmartReceiptGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SmartReceiptGroupByArgs['orderBy'] }
        : { orderBy?: SmartReceiptGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SmartReceiptGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSmartReceiptGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SmartReceipt model
   */
  readonly fields: SmartReceiptFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SmartReceipt.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SmartReceiptClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    receipt<T extends ReceiptDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReceiptDefaultArgs<ExtArgs>>): Prisma__ReceiptClient<$Result.GetResult<Prisma.$ReceiptPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    users<T extends SmartReceipt$usersArgs<ExtArgs> = {}>(args?: Subset<T, SmartReceipt$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    payments<T extends SmartReceipt$paymentsArgs<ExtArgs> = {}>(args?: Subset<T, SmartReceipt$paymentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SmartReceiptPaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SmartReceipt model
   */
  interface SmartReceiptFieldRefs {
    readonly id: FieldRef<"SmartReceipt", 'String'>
    readonly receiptId: FieldRef<"SmartReceipt", 'String'>
    readonly createdAt: FieldRef<"SmartReceipt", 'DateTime'>
    readonly updatedAt: FieldRef<"SmartReceipt", 'DateTime'>
    readonly updatedTotalPrice: FieldRef<"SmartReceipt", 'Float'>
    readonly updatedCurrencyCode: FieldRef<"SmartReceipt", 'String'>
  }
    

  // Custom InputTypes
  /**
   * SmartReceipt findUnique
   */
  export type SmartReceiptFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptInclude<ExtArgs> | null
    /**
     * Filter, which SmartReceipt to fetch.
     */
    where: SmartReceiptWhereUniqueInput
  }

  /**
   * SmartReceipt findUniqueOrThrow
   */
  export type SmartReceiptFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptInclude<ExtArgs> | null
    /**
     * Filter, which SmartReceipt to fetch.
     */
    where: SmartReceiptWhereUniqueInput
  }

  /**
   * SmartReceipt findFirst
   */
  export type SmartReceiptFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptInclude<ExtArgs> | null
    /**
     * Filter, which SmartReceipt to fetch.
     */
    where?: SmartReceiptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SmartReceipts to fetch.
     */
    orderBy?: SmartReceiptOrderByWithRelationInput | SmartReceiptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SmartReceipts.
     */
    cursor?: SmartReceiptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SmartReceipts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SmartReceipts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SmartReceipts.
     */
    distinct?: SmartReceiptScalarFieldEnum | SmartReceiptScalarFieldEnum[]
  }

  /**
   * SmartReceipt findFirstOrThrow
   */
  export type SmartReceiptFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptInclude<ExtArgs> | null
    /**
     * Filter, which SmartReceipt to fetch.
     */
    where?: SmartReceiptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SmartReceipts to fetch.
     */
    orderBy?: SmartReceiptOrderByWithRelationInput | SmartReceiptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SmartReceipts.
     */
    cursor?: SmartReceiptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SmartReceipts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SmartReceipts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SmartReceipts.
     */
    distinct?: SmartReceiptScalarFieldEnum | SmartReceiptScalarFieldEnum[]
  }

  /**
   * SmartReceipt findMany
   */
  export type SmartReceiptFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptInclude<ExtArgs> | null
    /**
     * Filter, which SmartReceipts to fetch.
     */
    where?: SmartReceiptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SmartReceipts to fetch.
     */
    orderBy?: SmartReceiptOrderByWithRelationInput | SmartReceiptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SmartReceipts.
     */
    cursor?: SmartReceiptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SmartReceipts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SmartReceipts.
     */
    skip?: number
    distinct?: SmartReceiptScalarFieldEnum | SmartReceiptScalarFieldEnum[]
  }

  /**
   * SmartReceipt create
   */
  export type SmartReceiptCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptInclude<ExtArgs> | null
    /**
     * The data needed to create a SmartReceipt.
     */
    data: XOR<SmartReceiptCreateInput, SmartReceiptUncheckedCreateInput>
  }

  /**
   * SmartReceipt createMany
   */
  export type SmartReceiptCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SmartReceipts.
     */
    data: SmartReceiptCreateManyInput | SmartReceiptCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SmartReceipt createManyAndReturn
   */
  export type SmartReceiptCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * The data used to create many SmartReceipts.
     */
    data: SmartReceiptCreateManyInput | SmartReceiptCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SmartReceipt update
   */
  export type SmartReceiptUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptInclude<ExtArgs> | null
    /**
     * The data needed to update a SmartReceipt.
     */
    data: XOR<SmartReceiptUpdateInput, SmartReceiptUncheckedUpdateInput>
    /**
     * Choose, which SmartReceipt to update.
     */
    where: SmartReceiptWhereUniqueInput
  }

  /**
   * SmartReceipt updateMany
   */
  export type SmartReceiptUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SmartReceipts.
     */
    data: XOR<SmartReceiptUpdateManyMutationInput, SmartReceiptUncheckedUpdateManyInput>
    /**
     * Filter which SmartReceipts to update
     */
    where?: SmartReceiptWhereInput
    /**
     * Limit how many SmartReceipts to update.
     */
    limit?: number
  }

  /**
   * SmartReceipt updateManyAndReturn
   */
  export type SmartReceiptUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * The data used to update SmartReceipts.
     */
    data: XOR<SmartReceiptUpdateManyMutationInput, SmartReceiptUncheckedUpdateManyInput>
    /**
     * Filter which SmartReceipts to update
     */
    where?: SmartReceiptWhereInput
    /**
     * Limit how many SmartReceipts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SmartReceipt upsert
   */
  export type SmartReceiptUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptInclude<ExtArgs> | null
    /**
     * The filter to search for the SmartReceipt to update in case it exists.
     */
    where: SmartReceiptWhereUniqueInput
    /**
     * In case the SmartReceipt found by the `where` argument doesn't exist, create a new SmartReceipt with this data.
     */
    create: XOR<SmartReceiptCreateInput, SmartReceiptUncheckedCreateInput>
    /**
     * In case the SmartReceipt was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SmartReceiptUpdateInput, SmartReceiptUncheckedUpdateInput>
  }

  /**
   * SmartReceipt delete
   */
  export type SmartReceiptDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptInclude<ExtArgs> | null
    /**
     * Filter which SmartReceipt to delete.
     */
    where: SmartReceiptWhereUniqueInput
  }

  /**
   * SmartReceipt deleteMany
   */
  export type SmartReceiptDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SmartReceipts to delete
     */
    where?: SmartReceiptWhereInput
    /**
     * Limit how many SmartReceipts to delete.
     */
    limit?: number
  }

  /**
   * SmartReceipt.users
   */
  export type SmartReceipt$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * SmartReceipt.payments
   */
  export type SmartReceipt$paymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentInclude<ExtArgs> | null
    where?: SmartReceiptPaymentWhereInput
    orderBy?: SmartReceiptPaymentOrderByWithRelationInput | SmartReceiptPaymentOrderByWithRelationInput[]
    cursor?: SmartReceiptPaymentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SmartReceiptPaymentScalarFieldEnum | SmartReceiptPaymentScalarFieldEnum[]
  }

  /**
   * SmartReceipt without action
   */
  export type SmartReceiptDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptInclude<ExtArgs> | null
  }


  /**
   * Model SmartReceiptPayment
   */

  export type AggregateSmartReceiptPayment = {
    _count: SmartReceiptPaymentCountAggregateOutputType | null
    _min: SmartReceiptPaymentMinAggregateOutputType | null
    _max: SmartReceiptPaymentMaxAggregateOutputType | null
  }

  export type SmartReceiptPaymentMinAggregateOutputType = {
    id: string | null
    userId: string | null
    smartReceiptId: string | null
    receiptItemId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SmartReceiptPaymentMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    smartReceiptId: string | null
    receiptItemId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SmartReceiptPaymentCountAggregateOutputType = {
    id: number
    userId: number
    smartReceiptId: number
    receiptItemId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SmartReceiptPaymentMinAggregateInputType = {
    id?: true
    userId?: true
    smartReceiptId?: true
    receiptItemId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SmartReceiptPaymentMaxAggregateInputType = {
    id?: true
    userId?: true
    smartReceiptId?: true
    receiptItemId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SmartReceiptPaymentCountAggregateInputType = {
    id?: true
    userId?: true
    smartReceiptId?: true
    receiptItemId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SmartReceiptPaymentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SmartReceiptPayment to aggregate.
     */
    where?: SmartReceiptPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SmartReceiptPayments to fetch.
     */
    orderBy?: SmartReceiptPaymentOrderByWithRelationInput | SmartReceiptPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SmartReceiptPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SmartReceiptPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SmartReceiptPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SmartReceiptPayments
    **/
    _count?: true | SmartReceiptPaymentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SmartReceiptPaymentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SmartReceiptPaymentMaxAggregateInputType
  }

  export type GetSmartReceiptPaymentAggregateType<T extends SmartReceiptPaymentAggregateArgs> = {
        [P in keyof T & keyof AggregateSmartReceiptPayment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSmartReceiptPayment[P]>
      : GetScalarType<T[P], AggregateSmartReceiptPayment[P]>
  }




  export type SmartReceiptPaymentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SmartReceiptPaymentWhereInput
    orderBy?: SmartReceiptPaymentOrderByWithAggregationInput | SmartReceiptPaymentOrderByWithAggregationInput[]
    by: SmartReceiptPaymentScalarFieldEnum[] | SmartReceiptPaymentScalarFieldEnum
    having?: SmartReceiptPaymentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SmartReceiptPaymentCountAggregateInputType | true
    _min?: SmartReceiptPaymentMinAggregateInputType
    _max?: SmartReceiptPaymentMaxAggregateInputType
  }

  export type SmartReceiptPaymentGroupByOutputType = {
    id: string
    userId: string
    smartReceiptId: string
    receiptItemId: string
    createdAt: Date
    updatedAt: Date
    _count: SmartReceiptPaymentCountAggregateOutputType | null
    _min: SmartReceiptPaymentMinAggregateOutputType | null
    _max: SmartReceiptPaymentMaxAggregateOutputType | null
  }

  type GetSmartReceiptPaymentGroupByPayload<T extends SmartReceiptPaymentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SmartReceiptPaymentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SmartReceiptPaymentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SmartReceiptPaymentGroupByOutputType[P]>
            : GetScalarType<T[P], SmartReceiptPaymentGroupByOutputType[P]>
        }
      >
    >


  export type SmartReceiptPaymentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    smartReceiptId?: boolean
    receiptItemId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    smartReceipt?: boolean | SmartReceiptPayment$smartReceiptArgs<ExtArgs>
    item?: boolean | ReceiptItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["smartReceiptPayment"]>

  export type SmartReceiptPaymentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    smartReceiptId?: boolean
    receiptItemId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    smartReceipt?: boolean | SmartReceiptPayment$smartReceiptArgs<ExtArgs>
    item?: boolean | ReceiptItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["smartReceiptPayment"]>

  export type SmartReceiptPaymentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    smartReceiptId?: boolean
    receiptItemId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    smartReceipt?: boolean | SmartReceiptPayment$smartReceiptArgs<ExtArgs>
    item?: boolean | ReceiptItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["smartReceiptPayment"]>

  export type SmartReceiptPaymentSelectScalar = {
    id?: boolean
    userId?: boolean
    smartReceiptId?: boolean
    receiptItemId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SmartReceiptPaymentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "smartReceiptId" | "receiptItemId" | "createdAt" | "updatedAt", ExtArgs["result"]["smartReceiptPayment"]>
  export type SmartReceiptPaymentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    smartReceipt?: boolean | SmartReceiptPayment$smartReceiptArgs<ExtArgs>
    item?: boolean | ReceiptItemDefaultArgs<ExtArgs>
  }
  export type SmartReceiptPaymentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    smartReceipt?: boolean | SmartReceiptPayment$smartReceiptArgs<ExtArgs>
    item?: boolean | ReceiptItemDefaultArgs<ExtArgs>
  }
  export type SmartReceiptPaymentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    smartReceipt?: boolean | SmartReceiptPayment$smartReceiptArgs<ExtArgs>
    item?: boolean | ReceiptItemDefaultArgs<ExtArgs>
  }

  export type $SmartReceiptPaymentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SmartReceiptPayment"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      smartReceipt: Prisma.$SmartReceiptPayload<ExtArgs> | null
      item: Prisma.$ReceiptItemPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      smartReceiptId: string
      receiptItemId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["smartReceiptPayment"]>
    composites: {}
  }

  type SmartReceiptPaymentGetPayload<S extends boolean | null | undefined | SmartReceiptPaymentDefaultArgs> = $Result.GetResult<Prisma.$SmartReceiptPaymentPayload, S>

  type SmartReceiptPaymentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SmartReceiptPaymentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SmartReceiptPaymentCountAggregateInputType | true
    }

  export interface SmartReceiptPaymentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SmartReceiptPayment'], meta: { name: 'SmartReceiptPayment' } }
    /**
     * Find zero or one SmartReceiptPayment that matches the filter.
     * @param {SmartReceiptPaymentFindUniqueArgs} args - Arguments to find a SmartReceiptPayment
     * @example
     * // Get one SmartReceiptPayment
     * const smartReceiptPayment = await prisma.smartReceiptPayment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SmartReceiptPaymentFindUniqueArgs>(args: SelectSubset<T, SmartReceiptPaymentFindUniqueArgs<ExtArgs>>): Prisma__SmartReceiptPaymentClient<$Result.GetResult<Prisma.$SmartReceiptPaymentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SmartReceiptPayment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SmartReceiptPaymentFindUniqueOrThrowArgs} args - Arguments to find a SmartReceiptPayment
     * @example
     * // Get one SmartReceiptPayment
     * const smartReceiptPayment = await prisma.smartReceiptPayment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SmartReceiptPaymentFindUniqueOrThrowArgs>(args: SelectSubset<T, SmartReceiptPaymentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SmartReceiptPaymentClient<$Result.GetResult<Prisma.$SmartReceiptPaymentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SmartReceiptPayment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SmartReceiptPaymentFindFirstArgs} args - Arguments to find a SmartReceiptPayment
     * @example
     * // Get one SmartReceiptPayment
     * const smartReceiptPayment = await prisma.smartReceiptPayment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SmartReceiptPaymentFindFirstArgs>(args?: SelectSubset<T, SmartReceiptPaymentFindFirstArgs<ExtArgs>>): Prisma__SmartReceiptPaymentClient<$Result.GetResult<Prisma.$SmartReceiptPaymentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SmartReceiptPayment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SmartReceiptPaymentFindFirstOrThrowArgs} args - Arguments to find a SmartReceiptPayment
     * @example
     * // Get one SmartReceiptPayment
     * const smartReceiptPayment = await prisma.smartReceiptPayment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SmartReceiptPaymentFindFirstOrThrowArgs>(args?: SelectSubset<T, SmartReceiptPaymentFindFirstOrThrowArgs<ExtArgs>>): Prisma__SmartReceiptPaymentClient<$Result.GetResult<Prisma.$SmartReceiptPaymentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SmartReceiptPayments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SmartReceiptPaymentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SmartReceiptPayments
     * const smartReceiptPayments = await prisma.smartReceiptPayment.findMany()
     * 
     * // Get first 10 SmartReceiptPayments
     * const smartReceiptPayments = await prisma.smartReceiptPayment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const smartReceiptPaymentWithIdOnly = await prisma.smartReceiptPayment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SmartReceiptPaymentFindManyArgs>(args?: SelectSubset<T, SmartReceiptPaymentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SmartReceiptPaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SmartReceiptPayment.
     * @param {SmartReceiptPaymentCreateArgs} args - Arguments to create a SmartReceiptPayment.
     * @example
     * // Create one SmartReceiptPayment
     * const SmartReceiptPayment = await prisma.smartReceiptPayment.create({
     *   data: {
     *     // ... data to create a SmartReceiptPayment
     *   }
     * })
     * 
     */
    create<T extends SmartReceiptPaymentCreateArgs>(args: SelectSubset<T, SmartReceiptPaymentCreateArgs<ExtArgs>>): Prisma__SmartReceiptPaymentClient<$Result.GetResult<Prisma.$SmartReceiptPaymentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SmartReceiptPayments.
     * @param {SmartReceiptPaymentCreateManyArgs} args - Arguments to create many SmartReceiptPayments.
     * @example
     * // Create many SmartReceiptPayments
     * const smartReceiptPayment = await prisma.smartReceiptPayment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SmartReceiptPaymentCreateManyArgs>(args?: SelectSubset<T, SmartReceiptPaymentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SmartReceiptPayments and returns the data saved in the database.
     * @param {SmartReceiptPaymentCreateManyAndReturnArgs} args - Arguments to create many SmartReceiptPayments.
     * @example
     * // Create many SmartReceiptPayments
     * const smartReceiptPayment = await prisma.smartReceiptPayment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SmartReceiptPayments and only return the `id`
     * const smartReceiptPaymentWithIdOnly = await prisma.smartReceiptPayment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SmartReceiptPaymentCreateManyAndReturnArgs>(args?: SelectSubset<T, SmartReceiptPaymentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SmartReceiptPaymentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SmartReceiptPayment.
     * @param {SmartReceiptPaymentDeleteArgs} args - Arguments to delete one SmartReceiptPayment.
     * @example
     * // Delete one SmartReceiptPayment
     * const SmartReceiptPayment = await prisma.smartReceiptPayment.delete({
     *   where: {
     *     // ... filter to delete one SmartReceiptPayment
     *   }
     * })
     * 
     */
    delete<T extends SmartReceiptPaymentDeleteArgs>(args: SelectSubset<T, SmartReceiptPaymentDeleteArgs<ExtArgs>>): Prisma__SmartReceiptPaymentClient<$Result.GetResult<Prisma.$SmartReceiptPaymentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SmartReceiptPayment.
     * @param {SmartReceiptPaymentUpdateArgs} args - Arguments to update one SmartReceiptPayment.
     * @example
     * // Update one SmartReceiptPayment
     * const smartReceiptPayment = await prisma.smartReceiptPayment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SmartReceiptPaymentUpdateArgs>(args: SelectSubset<T, SmartReceiptPaymentUpdateArgs<ExtArgs>>): Prisma__SmartReceiptPaymentClient<$Result.GetResult<Prisma.$SmartReceiptPaymentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SmartReceiptPayments.
     * @param {SmartReceiptPaymentDeleteManyArgs} args - Arguments to filter SmartReceiptPayments to delete.
     * @example
     * // Delete a few SmartReceiptPayments
     * const { count } = await prisma.smartReceiptPayment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SmartReceiptPaymentDeleteManyArgs>(args?: SelectSubset<T, SmartReceiptPaymentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SmartReceiptPayments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SmartReceiptPaymentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SmartReceiptPayments
     * const smartReceiptPayment = await prisma.smartReceiptPayment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SmartReceiptPaymentUpdateManyArgs>(args: SelectSubset<T, SmartReceiptPaymentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SmartReceiptPayments and returns the data updated in the database.
     * @param {SmartReceiptPaymentUpdateManyAndReturnArgs} args - Arguments to update many SmartReceiptPayments.
     * @example
     * // Update many SmartReceiptPayments
     * const smartReceiptPayment = await prisma.smartReceiptPayment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SmartReceiptPayments and only return the `id`
     * const smartReceiptPaymentWithIdOnly = await prisma.smartReceiptPayment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SmartReceiptPaymentUpdateManyAndReturnArgs>(args: SelectSubset<T, SmartReceiptPaymentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SmartReceiptPaymentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SmartReceiptPayment.
     * @param {SmartReceiptPaymentUpsertArgs} args - Arguments to update or create a SmartReceiptPayment.
     * @example
     * // Update or create a SmartReceiptPayment
     * const smartReceiptPayment = await prisma.smartReceiptPayment.upsert({
     *   create: {
     *     // ... data to create a SmartReceiptPayment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SmartReceiptPayment we want to update
     *   }
     * })
     */
    upsert<T extends SmartReceiptPaymentUpsertArgs>(args: SelectSubset<T, SmartReceiptPaymentUpsertArgs<ExtArgs>>): Prisma__SmartReceiptPaymentClient<$Result.GetResult<Prisma.$SmartReceiptPaymentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SmartReceiptPayments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SmartReceiptPaymentCountArgs} args - Arguments to filter SmartReceiptPayments to count.
     * @example
     * // Count the number of SmartReceiptPayments
     * const count = await prisma.smartReceiptPayment.count({
     *   where: {
     *     // ... the filter for the SmartReceiptPayments we want to count
     *   }
     * })
    **/
    count<T extends SmartReceiptPaymentCountArgs>(
      args?: Subset<T, SmartReceiptPaymentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SmartReceiptPaymentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SmartReceiptPayment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SmartReceiptPaymentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SmartReceiptPaymentAggregateArgs>(args: Subset<T, SmartReceiptPaymentAggregateArgs>): Prisma.PrismaPromise<GetSmartReceiptPaymentAggregateType<T>>

    /**
     * Group by SmartReceiptPayment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SmartReceiptPaymentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SmartReceiptPaymentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SmartReceiptPaymentGroupByArgs['orderBy'] }
        : { orderBy?: SmartReceiptPaymentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SmartReceiptPaymentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSmartReceiptPaymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SmartReceiptPayment model
   */
  readonly fields: SmartReceiptPaymentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SmartReceiptPayment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SmartReceiptPaymentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    smartReceipt<T extends SmartReceiptPayment$smartReceiptArgs<ExtArgs> = {}>(args?: Subset<T, SmartReceiptPayment$smartReceiptArgs<ExtArgs>>): Prisma__SmartReceiptClient<$Result.GetResult<Prisma.$SmartReceiptPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    item<T extends ReceiptItemDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReceiptItemDefaultArgs<ExtArgs>>): Prisma__ReceiptItemClient<$Result.GetResult<Prisma.$ReceiptItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SmartReceiptPayment model
   */
  interface SmartReceiptPaymentFieldRefs {
    readonly id: FieldRef<"SmartReceiptPayment", 'String'>
    readonly userId: FieldRef<"SmartReceiptPayment", 'String'>
    readonly smartReceiptId: FieldRef<"SmartReceiptPayment", 'String'>
    readonly receiptItemId: FieldRef<"SmartReceiptPayment", 'String'>
    readonly createdAt: FieldRef<"SmartReceiptPayment", 'DateTime'>
    readonly updatedAt: FieldRef<"SmartReceiptPayment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SmartReceiptPayment findUnique
   */
  export type SmartReceiptPaymentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentInclude<ExtArgs> | null
    /**
     * Filter, which SmartReceiptPayment to fetch.
     */
    where: SmartReceiptPaymentWhereUniqueInput
  }

  /**
   * SmartReceiptPayment findUniqueOrThrow
   */
  export type SmartReceiptPaymentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentInclude<ExtArgs> | null
    /**
     * Filter, which SmartReceiptPayment to fetch.
     */
    where: SmartReceiptPaymentWhereUniqueInput
  }

  /**
   * SmartReceiptPayment findFirst
   */
  export type SmartReceiptPaymentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentInclude<ExtArgs> | null
    /**
     * Filter, which SmartReceiptPayment to fetch.
     */
    where?: SmartReceiptPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SmartReceiptPayments to fetch.
     */
    orderBy?: SmartReceiptPaymentOrderByWithRelationInput | SmartReceiptPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SmartReceiptPayments.
     */
    cursor?: SmartReceiptPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SmartReceiptPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SmartReceiptPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SmartReceiptPayments.
     */
    distinct?: SmartReceiptPaymentScalarFieldEnum | SmartReceiptPaymentScalarFieldEnum[]
  }

  /**
   * SmartReceiptPayment findFirstOrThrow
   */
  export type SmartReceiptPaymentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentInclude<ExtArgs> | null
    /**
     * Filter, which SmartReceiptPayment to fetch.
     */
    where?: SmartReceiptPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SmartReceiptPayments to fetch.
     */
    orderBy?: SmartReceiptPaymentOrderByWithRelationInput | SmartReceiptPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SmartReceiptPayments.
     */
    cursor?: SmartReceiptPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SmartReceiptPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SmartReceiptPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SmartReceiptPayments.
     */
    distinct?: SmartReceiptPaymentScalarFieldEnum | SmartReceiptPaymentScalarFieldEnum[]
  }

  /**
   * SmartReceiptPayment findMany
   */
  export type SmartReceiptPaymentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentInclude<ExtArgs> | null
    /**
     * Filter, which SmartReceiptPayments to fetch.
     */
    where?: SmartReceiptPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SmartReceiptPayments to fetch.
     */
    orderBy?: SmartReceiptPaymentOrderByWithRelationInput | SmartReceiptPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SmartReceiptPayments.
     */
    cursor?: SmartReceiptPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SmartReceiptPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SmartReceiptPayments.
     */
    skip?: number
    distinct?: SmartReceiptPaymentScalarFieldEnum | SmartReceiptPaymentScalarFieldEnum[]
  }

  /**
   * SmartReceiptPayment create
   */
  export type SmartReceiptPaymentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentInclude<ExtArgs> | null
    /**
     * The data needed to create a SmartReceiptPayment.
     */
    data: XOR<SmartReceiptPaymentCreateInput, SmartReceiptPaymentUncheckedCreateInput>
  }

  /**
   * SmartReceiptPayment createMany
   */
  export type SmartReceiptPaymentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SmartReceiptPayments.
     */
    data: SmartReceiptPaymentCreateManyInput | SmartReceiptPaymentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SmartReceiptPayment createManyAndReturn
   */
  export type SmartReceiptPaymentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * The data used to create many SmartReceiptPayments.
     */
    data: SmartReceiptPaymentCreateManyInput | SmartReceiptPaymentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SmartReceiptPayment update
   */
  export type SmartReceiptPaymentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentInclude<ExtArgs> | null
    /**
     * The data needed to update a SmartReceiptPayment.
     */
    data: XOR<SmartReceiptPaymentUpdateInput, SmartReceiptPaymentUncheckedUpdateInput>
    /**
     * Choose, which SmartReceiptPayment to update.
     */
    where: SmartReceiptPaymentWhereUniqueInput
  }

  /**
   * SmartReceiptPayment updateMany
   */
  export type SmartReceiptPaymentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SmartReceiptPayments.
     */
    data: XOR<SmartReceiptPaymentUpdateManyMutationInput, SmartReceiptPaymentUncheckedUpdateManyInput>
    /**
     * Filter which SmartReceiptPayments to update
     */
    where?: SmartReceiptPaymentWhereInput
    /**
     * Limit how many SmartReceiptPayments to update.
     */
    limit?: number
  }

  /**
   * SmartReceiptPayment updateManyAndReturn
   */
  export type SmartReceiptPaymentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * The data used to update SmartReceiptPayments.
     */
    data: XOR<SmartReceiptPaymentUpdateManyMutationInput, SmartReceiptPaymentUncheckedUpdateManyInput>
    /**
     * Filter which SmartReceiptPayments to update
     */
    where?: SmartReceiptPaymentWhereInput
    /**
     * Limit how many SmartReceiptPayments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SmartReceiptPayment upsert
   */
  export type SmartReceiptPaymentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentInclude<ExtArgs> | null
    /**
     * The filter to search for the SmartReceiptPayment to update in case it exists.
     */
    where: SmartReceiptPaymentWhereUniqueInput
    /**
     * In case the SmartReceiptPayment found by the `where` argument doesn't exist, create a new SmartReceiptPayment with this data.
     */
    create: XOR<SmartReceiptPaymentCreateInput, SmartReceiptPaymentUncheckedCreateInput>
    /**
     * In case the SmartReceiptPayment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SmartReceiptPaymentUpdateInput, SmartReceiptPaymentUncheckedUpdateInput>
  }

  /**
   * SmartReceiptPayment delete
   */
  export type SmartReceiptPaymentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentInclude<ExtArgs> | null
    /**
     * Filter which SmartReceiptPayment to delete.
     */
    where: SmartReceiptPaymentWhereUniqueInput
  }

  /**
   * SmartReceiptPayment deleteMany
   */
  export type SmartReceiptPaymentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SmartReceiptPayments to delete
     */
    where?: SmartReceiptPaymentWhereInput
    /**
     * Limit how many SmartReceiptPayments to delete.
     */
    limit?: number
  }

  /**
   * SmartReceiptPayment.smartReceipt
   */
  export type SmartReceiptPayment$smartReceiptArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceipt
     */
    select?: SmartReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceipt
     */
    omit?: SmartReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptInclude<ExtArgs> | null
    where?: SmartReceiptWhereInput
  }

  /**
   * SmartReceiptPayment without action
   */
  export type SmartReceiptPaymentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SmartReceiptPayment
     */
    select?: SmartReceiptPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SmartReceiptPayment
     */
    omit?: SmartReceiptPaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SmartReceiptPaymentInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    createdAt: 'createdAt',
    avatarUrl: 'avatarUrl',
    admin: 'admin'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ReceiptScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    merchantName: 'merchantName',
    receiptType: 'receiptType',
    receiptDate: 'receiptDate',
    totalPrice: 'totalPrice',
    currencyCode: 'currencyCode'
  };

  export type ReceiptScalarFieldEnum = (typeof ReceiptScalarFieldEnum)[keyof typeof ReceiptScalarFieldEnum]


  export const ReceiptItemGroupScalarFieldEnum: {
    id: 'id',
    receiptId: 'receiptId',
    description: 'description',
    price: 'price',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    quantity: 'quantity',
    quantityUnit: 'quantityUnit',
    unitPrice: 'unitPrice'
  };

  export type ReceiptItemGroupScalarFieldEnum = (typeof ReceiptItemGroupScalarFieldEnum)[keyof typeof ReceiptItemGroupScalarFieldEnum]


  export const ReceiptItemScalarFieldEnum: {
    id: 'id',
    itemGroupId: 'itemGroupId',
    price: 'price',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ReceiptItemScalarFieldEnum = (typeof ReceiptItemScalarFieldEnum)[keyof typeof ReceiptItemScalarFieldEnum]


  export const ReceiptItemSupplementScalarFieldEnum: {
    id: 'id',
    itemId: 'itemId',
    description: 'description',
    price: 'price',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ReceiptItemSupplementScalarFieldEnum = (typeof ReceiptItemSupplementScalarFieldEnum)[keyof typeof ReceiptItemSupplementScalarFieldEnum]


  export const ReceiptItemGroupTranslationScalarFieldEnum: {
    id: 'id',
    itemGroupId: 'itemGroupId',
    label: 'label',
    description: 'description',
    language: 'language',
    lightModeLabelHexColor: 'lightModeLabelHexColor',
    darkModeLabelHexColor: 'darkModeLabelHexColor',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ReceiptItemGroupTranslationScalarFieldEnum = (typeof ReceiptItemGroupTranslationScalarFieldEnum)[keyof typeof ReceiptItemGroupTranslationScalarFieldEnum]


  export const ReceiptItemSupplementTranslationScalarFieldEnum: {
    id: 'id',
    supplementId: 'supplementId',
    label: 'label',
    description: 'description',
    language: 'language',
    lightModeLabelHexColor: 'lightModeLabelHexColor',
    darkModeLabelHexColor: 'darkModeLabelHexColor',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ReceiptItemSupplementTranslationScalarFieldEnum = (typeof ReceiptItemSupplementTranslationScalarFieldEnum)[keyof typeof ReceiptItemSupplementTranslationScalarFieldEnum]


  export const SmartReceiptScalarFieldEnum: {
    id: 'id',
    receiptId: 'receiptId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    updatedTotalPrice: 'updatedTotalPrice',
    updatedCurrencyCode: 'updatedCurrencyCode'
  };

  export type SmartReceiptScalarFieldEnum = (typeof SmartReceiptScalarFieldEnum)[keyof typeof SmartReceiptScalarFieldEnum]


  export const SmartReceiptPaymentScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    smartReceiptId: 'smartReceiptId',
    receiptItemId: 'receiptItemId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SmartReceiptPaymentScalarFieldEnum = (typeof SmartReceiptPaymentScalarFieldEnum)[keyof typeof SmartReceiptPaymentScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    avatarUrl?: StringNullableFilter<"User"> | string | null
    admin?: BoolFilter<"User"> | boolean
    receipts?: ReceiptListRelationFilter
    payments?: SmartReceiptPaymentListRelationFilter
    smartReceipts?: SmartReceiptListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    admin?: SortOrder
    receipts?: ReceiptOrderByRelationAggregateInput
    payments?: SmartReceiptPaymentOrderByRelationAggregateInput
    smartReceipts?: SmartReceiptOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    createdAt?: DateTimeFilter<"User"> | Date | string
    avatarUrl?: StringNullableFilter<"User"> | string | null
    admin?: BoolFilter<"User"> | boolean
    receipts?: ReceiptListRelationFilter
    payments?: SmartReceiptPaymentListRelationFilter
    smartReceipts?: SmartReceiptListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    admin?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    avatarUrl?: StringNullableWithAggregatesFilter<"User"> | string | null
    admin?: BoolWithAggregatesFilter<"User"> | boolean
  }

  export type ReceiptWhereInput = {
    AND?: ReceiptWhereInput | ReceiptWhereInput[]
    OR?: ReceiptWhereInput[]
    NOT?: ReceiptWhereInput | ReceiptWhereInput[]
    id?: StringFilter<"Receipt"> | string
    userId?: StringFilter<"Receipt"> | string
    createdAt?: DateTimeFilter<"Receipt"> | Date | string
    updatedAt?: DateTimeFilter<"Receipt"> | Date | string
    merchantName?: StringFilter<"Receipt"> | string
    receiptType?: StringNullableFilter<"Receipt"> | string | null
    receiptDate?: DateTimeNullableFilter<"Receipt"> | Date | string | null
    totalPrice?: FloatFilter<"Receipt"> | number
    currencyCode?: StringNullableFilter<"Receipt"> | string | null
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
    itemGroups?: ReceiptItemGroupListRelationFilter
    smartReceipts?: SmartReceiptListRelationFilter
  }

  export type ReceiptOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    merchantName?: SortOrder
    receiptType?: SortOrderInput | SortOrder
    receiptDate?: SortOrderInput | SortOrder
    totalPrice?: SortOrder
    currencyCode?: SortOrderInput | SortOrder
    createdBy?: UserOrderByWithRelationInput
    itemGroups?: ReceiptItemGroupOrderByRelationAggregateInput
    smartReceipts?: SmartReceiptOrderByRelationAggregateInput
  }

  export type ReceiptWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReceiptWhereInput | ReceiptWhereInput[]
    OR?: ReceiptWhereInput[]
    NOT?: ReceiptWhereInput | ReceiptWhereInput[]
    userId?: StringFilter<"Receipt"> | string
    createdAt?: DateTimeFilter<"Receipt"> | Date | string
    updatedAt?: DateTimeFilter<"Receipt"> | Date | string
    merchantName?: StringFilter<"Receipt"> | string
    receiptType?: StringNullableFilter<"Receipt"> | string | null
    receiptDate?: DateTimeNullableFilter<"Receipt"> | Date | string | null
    totalPrice?: FloatFilter<"Receipt"> | number
    currencyCode?: StringNullableFilter<"Receipt"> | string | null
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
    itemGroups?: ReceiptItemGroupListRelationFilter
    smartReceipts?: SmartReceiptListRelationFilter
  }, "id">

  export type ReceiptOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    merchantName?: SortOrder
    receiptType?: SortOrderInput | SortOrder
    receiptDate?: SortOrderInput | SortOrder
    totalPrice?: SortOrder
    currencyCode?: SortOrderInput | SortOrder
    _count?: ReceiptCountOrderByAggregateInput
    _avg?: ReceiptAvgOrderByAggregateInput
    _max?: ReceiptMaxOrderByAggregateInput
    _min?: ReceiptMinOrderByAggregateInput
    _sum?: ReceiptSumOrderByAggregateInput
  }

  export type ReceiptScalarWhereWithAggregatesInput = {
    AND?: ReceiptScalarWhereWithAggregatesInput | ReceiptScalarWhereWithAggregatesInput[]
    OR?: ReceiptScalarWhereWithAggregatesInput[]
    NOT?: ReceiptScalarWhereWithAggregatesInput | ReceiptScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Receipt"> | string
    userId?: StringWithAggregatesFilter<"Receipt"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Receipt"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Receipt"> | Date | string
    merchantName?: StringWithAggregatesFilter<"Receipt"> | string
    receiptType?: StringNullableWithAggregatesFilter<"Receipt"> | string | null
    receiptDate?: DateTimeNullableWithAggregatesFilter<"Receipt"> | Date | string | null
    totalPrice?: FloatWithAggregatesFilter<"Receipt"> | number
    currencyCode?: StringNullableWithAggregatesFilter<"Receipt"> | string | null
  }

  export type ReceiptItemGroupWhereInput = {
    AND?: ReceiptItemGroupWhereInput | ReceiptItemGroupWhereInput[]
    OR?: ReceiptItemGroupWhereInput[]
    NOT?: ReceiptItemGroupWhereInput | ReceiptItemGroupWhereInput[]
    id?: StringFilter<"ReceiptItemGroup"> | string
    receiptId?: StringFilter<"ReceiptItemGroup"> | string
    description?: StringFilter<"ReceiptItemGroup"> | string
    price?: FloatFilter<"ReceiptItemGroup"> | number
    createdAt?: DateTimeFilter<"ReceiptItemGroup"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItemGroup"> | Date | string
    quantity?: FloatFilter<"ReceiptItemGroup"> | number
    quantityUnit?: StringNullableFilter<"ReceiptItemGroup"> | string | null
    unitPrice?: FloatFilter<"ReceiptItemGroup"> | number
    receipt?: XOR<ReceiptScalarRelationFilter, ReceiptWhereInput>
    items?: ReceiptItemListRelationFilter
    translations?: ReceiptItemGroupTranslationListRelationFilter
  }

  export type ReceiptItemGroupOrderByWithRelationInput = {
    id?: SortOrder
    receiptId?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    quantity?: SortOrder
    quantityUnit?: SortOrderInput | SortOrder
    unitPrice?: SortOrder
    receipt?: ReceiptOrderByWithRelationInput
    items?: ReceiptItemOrderByRelationAggregateInput
    translations?: ReceiptItemGroupTranslationOrderByRelationAggregateInput
  }

  export type ReceiptItemGroupWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReceiptItemGroupWhereInput | ReceiptItemGroupWhereInput[]
    OR?: ReceiptItemGroupWhereInput[]
    NOT?: ReceiptItemGroupWhereInput | ReceiptItemGroupWhereInput[]
    receiptId?: StringFilter<"ReceiptItemGroup"> | string
    description?: StringFilter<"ReceiptItemGroup"> | string
    price?: FloatFilter<"ReceiptItemGroup"> | number
    createdAt?: DateTimeFilter<"ReceiptItemGroup"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItemGroup"> | Date | string
    quantity?: FloatFilter<"ReceiptItemGroup"> | number
    quantityUnit?: StringNullableFilter<"ReceiptItemGroup"> | string | null
    unitPrice?: FloatFilter<"ReceiptItemGroup"> | number
    receipt?: XOR<ReceiptScalarRelationFilter, ReceiptWhereInput>
    items?: ReceiptItemListRelationFilter
    translations?: ReceiptItemGroupTranslationListRelationFilter
  }, "id">

  export type ReceiptItemGroupOrderByWithAggregationInput = {
    id?: SortOrder
    receiptId?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    quantity?: SortOrder
    quantityUnit?: SortOrderInput | SortOrder
    unitPrice?: SortOrder
    _count?: ReceiptItemGroupCountOrderByAggregateInput
    _avg?: ReceiptItemGroupAvgOrderByAggregateInput
    _max?: ReceiptItemGroupMaxOrderByAggregateInput
    _min?: ReceiptItemGroupMinOrderByAggregateInput
    _sum?: ReceiptItemGroupSumOrderByAggregateInput
  }

  export type ReceiptItemGroupScalarWhereWithAggregatesInput = {
    AND?: ReceiptItemGroupScalarWhereWithAggregatesInput | ReceiptItemGroupScalarWhereWithAggregatesInput[]
    OR?: ReceiptItemGroupScalarWhereWithAggregatesInput[]
    NOT?: ReceiptItemGroupScalarWhereWithAggregatesInput | ReceiptItemGroupScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReceiptItemGroup"> | string
    receiptId?: StringWithAggregatesFilter<"ReceiptItemGroup"> | string
    description?: StringWithAggregatesFilter<"ReceiptItemGroup"> | string
    price?: FloatWithAggregatesFilter<"ReceiptItemGroup"> | number
    createdAt?: DateTimeWithAggregatesFilter<"ReceiptItemGroup"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ReceiptItemGroup"> | Date | string
    quantity?: FloatWithAggregatesFilter<"ReceiptItemGroup"> | number
    quantityUnit?: StringNullableWithAggregatesFilter<"ReceiptItemGroup"> | string | null
    unitPrice?: FloatWithAggregatesFilter<"ReceiptItemGroup"> | number
  }

  export type ReceiptItemWhereInput = {
    AND?: ReceiptItemWhereInput | ReceiptItemWhereInput[]
    OR?: ReceiptItemWhereInput[]
    NOT?: ReceiptItemWhereInput | ReceiptItemWhereInput[]
    id?: StringFilter<"ReceiptItem"> | string
    itemGroupId?: StringFilter<"ReceiptItem"> | string
    price?: FloatFilter<"ReceiptItem"> | number
    createdAt?: DateTimeFilter<"ReceiptItem"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItem"> | Date | string
    itemGroup?: XOR<ReceiptItemGroupScalarRelationFilter, ReceiptItemGroupWhereInput>
    supplements?: ReceiptItemSupplementListRelationFilter
    smartPayments?: SmartReceiptPaymentListRelationFilter
  }

  export type ReceiptItemOrderByWithRelationInput = {
    id?: SortOrder
    itemGroupId?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    itemGroup?: ReceiptItemGroupOrderByWithRelationInput
    supplements?: ReceiptItemSupplementOrderByRelationAggregateInput
    smartPayments?: SmartReceiptPaymentOrderByRelationAggregateInput
  }

  export type ReceiptItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReceiptItemWhereInput | ReceiptItemWhereInput[]
    OR?: ReceiptItemWhereInput[]
    NOT?: ReceiptItemWhereInput | ReceiptItemWhereInput[]
    itemGroupId?: StringFilter<"ReceiptItem"> | string
    price?: FloatFilter<"ReceiptItem"> | number
    createdAt?: DateTimeFilter<"ReceiptItem"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItem"> | Date | string
    itemGroup?: XOR<ReceiptItemGroupScalarRelationFilter, ReceiptItemGroupWhereInput>
    supplements?: ReceiptItemSupplementListRelationFilter
    smartPayments?: SmartReceiptPaymentListRelationFilter
  }, "id">

  export type ReceiptItemOrderByWithAggregationInput = {
    id?: SortOrder
    itemGroupId?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ReceiptItemCountOrderByAggregateInput
    _avg?: ReceiptItemAvgOrderByAggregateInput
    _max?: ReceiptItemMaxOrderByAggregateInput
    _min?: ReceiptItemMinOrderByAggregateInput
    _sum?: ReceiptItemSumOrderByAggregateInput
  }

  export type ReceiptItemScalarWhereWithAggregatesInput = {
    AND?: ReceiptItemScalarWhereWithAggregatesInput | ReceiptItemScalarWhereWithAggregatesInput[]
    OR?: ReceiptItemScalarWhereWithAggregatesInput[]
    NOT?: ReceiptItemScalarWhereWithAggregatesInput | ReceiptItemScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReceiptItem"> | string
    itemGroupId?: StringWithAggregatesFilter<"ReceiptItem"> | string
    price?: FloatWithAggregatesFilter<"ReceiptItem"> | number
    createdAt?: DateTimeWithAggregatesFilter<"ReceiptItem"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ReceiptItem"> | Date | string
  }

  export type ReceiptItemSupplementWhereInput = {
    AND?: ReceiptItemSupplementWhereInput | ReceiptItemSupplementWhereInput[]
    OR?: ReceiptItemSupplementWhereInput[]
    NOT?: ReceiptItemSupplementWhereInput | ReceiptItemSupplementWhereInput[]
    id?: StringFilter<"ReceiptItemSupplement"> | string
    itemId?: StringFilter<"ReceiptItemSupplement"> | string
    description?: StringFilter<"ReceiptItemSupplement"> | string
    price?: FloatFilter<"ReceiptItemSupplement"> | number
    createdAt?: DateTimeFilter<"ReceiptItemSupplement"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItemSupplement"> | Date | string
    item?: XOR<ReceiptItemScalarRelationFilter, ReceiptItemWhereInput>
    translations?: ReceiptItemSupplementTranslationListRelationFilter
  }

  export type ReceiptItemSupplementOrderByWithRelationInput = {
    id?: SortOrder
    itemId?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    item?: ReceiptItemOrderByWithRelationInput
    translations?: ReceiptItemSupplementTranslationOrderByRelationAggregateInput
  }

  export type ReceiptItemSupplementWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReceiptItemSupplementWhereInput | ReceiptItemSupplementWhereInput[]
    OR?: ReceiptItemSupplementWhereInput[]
    NOT?: ReceiptItemSupplementWhereInput | ReceiptItemSupplementWhereInput[]
    itemId?: StringFilter<"ReceiptItemSupplement"> | string
    description?: StringFilter<"ReceiptItemSupplement"> | string
    price?: FloatFilter<"ReceiptItemSupplement"> | number
    createdAt?: DateTimeFilter<"ReceiptItemSupplement"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItemSupplement"> | Date | string
    item?: XOR<ReceiptItemScalarRelationFilter, ReceiptItemWhereInput>
    translations?: ReceiptItemSupplementTranslationListRelationFilter
  }, "id">

  export type ReceiptItemSupplementOrderByWithAggregationInput = {
    id?: SortOrder
    itemId?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ReceiptItemSupplementCountOrderByAggregateInput
    _avg?: ReceiptItemSupplementAvgOrderByAggregateInput
    _max?: ReceiptItemSupplementMaxOrderByAggregateInput
    _min?: ReceiptItemSupplementMinOrderByAggregateInput
    _sum?: ReceiptItemSupplementSumOrderByAggregateInput
  }

  export type ReceiptItemSupplementScalarWhereWithAggregatesInput = {
    AND?: ReceiptItemSupplementScalarWhereWithAggregatesInput | ReceiptItemSupplementScalarWhereWithAggregatesInput[]
    OR?: ReceiptItemSupplementScalarWhereWithAggregatesInput[]
    NOT?: ReceiptItemSupplementScalarWhereWithAggregatesInput | ReceiptItemSupplementScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReceiptItemSupplement"> | string
    itemId?: StringWithAggregatesFilter<"ReceiptItemSupplement"> | string
    description?: StringWithAggregatesFilter<"ReceiptItemSupplement"> | string
    price?: FloatWithAggregatesFilter<"ReceiptItemSupplement"> | number
    createdAt?: DateTimeWithAggregatesFilter<"ReceiptItemSupplement"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ReceiptItemSupplement"> | Date | string
  }

  export type ReceiptItemGroupTranslationWhereInput = {
    AND?: ReceiptItemGroupTranslationWhereInput | ReceiptItemGroupTranslationWhereInput[]
    OR?: ReceiptItemGroupTranslationWhereInput[]
    NOT?: ReceiptItemGroupTranslationWhereInput | ReceiptItemGroupTranslationWhereInput[]
    id?: StringFilter<"ReceiptItemGroupTranslation"> | string
    itemGroupId?: StringFilter<"ReceiptItemGroupTranslation"> | string
    label?: StringFilter<"ReceiptItemGroupTranslation"> | string
    description?: StringFilter<"ReceiptItemGroupTranslation"> | string
    language?: StringFilter<"ReceiptItemGroupTranslation"> | string
    lightModeLabelHexColor?: StringFilter<"ReceiptItemGroupTranslation"> | string
    darkModeLabelHexColor?: StringFilter<"ReceiptItemGroupTranslation"> | string
    createdAt?: DateTimeFilter<"ReceiptItemGroupTranslation"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItemGroupTranslation"> | Date | string
    itemGroup?: XOR<ReceiptItemGroupScalarRelationFilter, ReceiptItemGroupWhereInput>
  }

  export type ReceiptItemGroupTranslationOrderByWithRelationInput = {
    id?: SortOrder
    itemGroupId?: SortOrder
    label?: SortOrder
    description?: SortOrder
    language?: SortOrder
    lightModeLabelHexColor?: SortOrder
    darkModeLabelHexColor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    itemGroup?: ReceiptItemGroupOrderByWithRelationInput
  }

  export type ReceiptItemGroupTranslationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReceiptItemGroupTranslationWhereInput | ReceiptItemGroupTranslationWhereInput[]
    OR?: ReceiptItemGroupTranslationWhereInput[]
    NOT?: ReceiptItemGroupTranslationWhereInput | ReceiptItemGroupTranslationWhereInput[]
    itemGroupId?: StringFilter<"ReceiptItemGroupTranslation"> | string
    label?: StringFilter<"ReceiptItemGroupTranslation"> | string
    description?: StringFilter<"ReceiptItemGroupTranslation"> | string
    language?: StringFilter<"ReceiptItemGroupTranslation"> | string
    lightModeLabelHexColor?: StringFilter<"ReceiptItemGroupTranslation"> | string
    darkModeLabelHexColor?: StringFilter<"ReceiptItemGroupTranslation"> | string
    createdAt?: DateTimeFilter<"ReceiptItemGroupTranslation"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItemGroupTranslation"> | Date | string
    itemGroup?: XOR<ReceiptItemGroupScalarRelationFilter, ReceiptItemGroupWhereInput>
  }, "id">

  export type ReceiptItemGroupTranslationOrderByWithAggregationInput = {
    id?: SortOrder
    itemGroupId?: SortOrder
    label?: SortOrder
    description?: SortOrder
    language?: SortOrder
    lightModeLabelHexColor?: SortOrder
    darkModeLabelHexColor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ReceiptItemGroupTranslationCountOrderByAggregateInput
    _max?: ReceiptItemGroupTranslationMaxOrderByAggregateInput
    _min?: ReceiptItemGroupTranslationMinOrderByAggregateInput
  }

  export type ReceiptItemGroupTranslationScalarWhereWithAggregatesInput = {
    AND?: ReceiptItemGroupTranslationScalarWhereWithAggregatesInput | ReceiptItemGroupTranslationScalarWhereWithAggregatesInput[]
    OR?: ReceiptItemGroupTranslationScalarWhereWithAggregatesInput[]
    NOT?: ReceiptItemGroupTranslationScalarWhereWithAggregatesInput | ReceiptItemGroupTranslationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReceiptItemGroupTranslation"> | string
    itemGroupId?: StringWithAggregatesFilter<"ReceiptItemGroupTranslation"> | string
    label?: StringWithAggregatesFilter<"ReceiptItemGroupTranslation"> | string
    description?: StringWithAggregatesFilter<"ReceiptItemGroupTranslation"> | string
    language?: StringWithAggregatesFilter<"ReceiptItemGroupTranslation"> | string
    lightModeLabelHexColor?: StringWithAggregatesFilter<"ReceiptItemGroupTranslation"> | string
    darkModeLabelHexColor?: StringWithAggregatesFilter<"ReceiptItemGroupTranslation"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ReceiptItemGroupTranslation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ReceiptItemGroupTranslation"> | Date | string
  }

  export type ReceiptItemSupplementTranslationWhereInput = {
    AND?: ReceiptItemSupplementTranslationWhereInput | ReceiptItemSupplementTranslationWhereInput[]
    OR?: ReceiptItemSupplementTranslationWhereInput[]
    NOT?: ReceiptItemSupplementTranslationWhereInput | ReceiptItemSupplementTranslationWhereInput[]
    id?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    supplementId?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    label?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    description?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    language?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    lightModeLabelHexColor?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    darkModeLabelHexColor?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    createdAt?: DateTimeFilter<"ReceiptItemSupplementTranslation"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItemSupplementTranslation"> | Date | string
    supplement?: XOR<ReceiptItemSupplementScalarRelationFilter, ReceiptItemSupplementWhereInput>
  }

  export type ReceiptItemSupplementTranslationOrderByWithRelationInput = {
    id?: SortOrder
    supplementId?: SortOrder
    label?: SortOrder
    description?: SortOrder
    language?: SortOrder
    lightModeLabelHexColor?: SortOrder
    darkModeLabelHexColor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    supplement?: ReceiptItemSupplementOrderByWithRelationInput
  }

  export type ReceiptItemSupplementTranslationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReceiptItemSupplementTranslationWhereInput | ReceiptItemSupplementTranslationWhereInput[]
    OR?: ReceiptItemSupplementTranslationWhereInput[]
    NOT?: ReceiptItemSupplementTranslationWhereInput | ReceiptItemSupplementTranslationWhereInput[]
    supplementId?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    label?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    description?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    language?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    lightModeLabelHexColor?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    darkModeLabelHexColor?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    createdAt?: DateTimeFilter<"ReceiptItemSupplementTranslation"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItemSupplementTranslation"> | Date | string
    supplement?: XOR<ReceiptItemSupplementScalarRelationFilter, ReceiptItemSupplementWhereInput>
  }, "id">

  export type ReceiptItemSupplementTranslationOrderByWithAggregationInput = {
    id?: SortOrder
    supplementId?: SortOrder
    label?: SortOrder
    description?: SortOrder
    language?: SortOrder
    lightModeLabelHexColor?: SortOrder
    darkModeLabelHexColor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ReceiptItemSupplementTranslationCountOrderByAggregateInput
    _max?: ReceiptItemSupplementTranslationMaxOrderByAggregateInput
    _min?: ReceiptItemSupplementTranslationMinOrderByAggregateInput
  }

  export type ReceiptItemSupplementTranslationScalarWhereWithAggregatesInput = {
    AND?: ReceiptItemSupplementTranslationScalarWhereWithAggregatesInput | ReceiptItemSupplementTranslationScalarWhereWithAggregatesInput[]
    OR?: ReceiptItemSupplementTranslationScalarWhereWithAggregatesInput[]
    NOT?: ReceiptItemSupplementTranslationScalarWhereWithAggregatesInput | ReceiptItemSupplementTranslationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReceiptItemSupplementTranslation"> | string
    supplementId?: StringWithAggregatesFilter<"ReceiptItemSupplementTranslation"> | string
    label?: StringWithAggregatesFilter<"ReceiptItemSupplementTranslation"> | string
    description?: StringWithAggregatesFilter<"ReceiptItemSupplementTranslation"> | string
    language?: StringWithAggregatesFilter<"ReceiptItemSupplementTranslation"> | string
    lightModeLabelHexColor?: StringWithAggregatesFilter<"ReceiptItemSupplementTranslation"> | string
    darkModeLabelHexColor?: StringWithAggregatesFilter<"ReceiptItemSupplementTranslation"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ReceiptItemSupplementTranslation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ReceiptItemSupplementTranslation"> | Date | string
  }

  export type SmartReceiptWhereInput = {
    AND?: SmartReceiptWhereInput | SmartReceiptWhereInput[]
    OR?: SmartReceiptWhereInput[]
    NOT?: SmartReceiptWhereInput | SmartReceiptWhereInput[]
    id?: StringFilter<"SmartReceipt"> | string
    receiptId?: StringFilter<"SmartReceipt"> | string
    createdAt?: DateTimeFilter<"SmartReceipt"> | Date | string
    updatedAt?: DateTimeFilter<"SmartReceipt"> | Date | string
    updatedTotalPrice?: FloatNullableFilter<"SmartReceipt"> | number | null
    updatedCurrencyCode?: StringNullableFilter<"SmartReceipt"> | string | null
    receipt?: XOR<ReceiptScalarRelationFilter, ReceiptWhereInput>
    users?: UserListRelationFilter
    payments?: SmartReceiptPaymentListRelationFilter
  }

  export type SmartReceiptOrderByWithRelationInput = {
    id?: SortOrder
    receiptId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    updatedTotalPrice?: SortOrderInput | SortOrder
    updatedCurrencyCode?: SortOrderInput | SortOrder
    receipt?: ReceiptOrderByWithRelationInput
    users?: UserOrderByRelationAggregateInput
    payments?: SmartReceiptPaymentOrderByRelationAggregateInput
  }

  export type SmartReceiptWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SmartReceiptWhereInput | SmartReceiptWhereInput[]
    OR?: SmartReceiptWhereInput[]
    NOT?: SmartReceiptWhereInput | SmartReceiptWhereInput[]
    receiptId?: StringFilter<"SmartReceipt"> | string
    createdAt?: DateTimeFilter<"SmartReceipt"> | Date | string
    updatedAt?: DateTimeFilter<"SmartReceipt"> | Date | string
    updatedTotalPrice?: FloatNullableFilter<"SmartReceipt"> | number | null
    updatedCurrencyCode?: StringNullableFilter<"SmartReceipt"> | string | null
    receipt?: XOR<ReceiptScalarRelationFilter, ReceiptWhereInput>
    users?: UserListRelationFilter
    payments?: SmartReceiptPaymentListRelationFilter
  }, "id">

  export type SmartReceiptOrderByWithAggregationInput = {
    id?: SortOrder
    receiptId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    updatedTotalPrice?: SortOrderInput | SortOrder
    updatedCurrencyCode?: SortOrderInput | SortOrder
    _count?: SmartReceiptCountOrderByAggregateInput
    _avg?: SmartReceiptAvgOrderByAggregateInput
    _max?: SmartReceiptMaxOrderByAggregateInput
    _min?: SmartReceiptMinOrderByAggregateInput
    _sum?: SmartReceiptSumOrderByAggregateInput
  }

  export type SmartReceiptScalarWhereWithAggregatesInput = {
    AND?: SmartReceiptScalarWhereWithAggregatesInput | SmartReceiptScalarWhereWithAggregatesInput[]
    OR?: SmartReceiptScalarWhereWithAggregatesInput[]
    NOT?: SmartReceiptScalarWhereWithAggregatesInput | SmartReceiptScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SmartReceipt"> | string
    receiptId?: StringWithAggregatesFilter<"SmartReceipt"> | string
    createdAt?: DateTimeWithAggregatesFilter<"SmartReceipt"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SmartReceipt"> | Date | string
    updatedTotalPrice?: FloatNullableWithAggregatesFilter<"SmartReceipt"> | number | null
    updatedCurrencyCode?: StringNullableWithAggregatesFilter<"SmartReceipt"> | string | null
  }

  export type SmartReceiptPaymentWhereInput = {
    AND?: SmartReceiptPaymentWhereInput | SmartReceiptPaymentWhereInput[]
    OR?: SmartReceiptPaymentWhereInput[]
    NOT?: SmartReceiptPaymentWhereInput | SmartReceiptPaymentWhereInput[]
    id?: StringFilter<"SmartReceiptPayment"> | string
    userId?: StringFilter<"SmartReceiptPayment"> | string
    smartReceiptId?: StringFilter<"SmartReceiptPayment"> | string
    receiptItemId?: StringFilter<"SmartReceiptPayment"> | string
    createdAt?: DateTimeFilter<"SmartReceiptPayment"> | Date | string
    updatedAt?: DateTimeFilter<"SmartReceiptPayment"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    smartReceipt?: XOR<SmartReceiptNullableScalarRelationFilter, SmartReceiptWhereInput> | null
    item?: XOR<ReceiptItemScalarRelationFilter, ReceiptItemWhereInput>
  }

  export type SmartReceiptPaymentOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    smartReceiptId?: SortOrder
    receiptItemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    smartReceipt?: SmartReceiptOrderByWithRelationInput
    item?: ReceiptItemOrderByWithRelationInput
  }

  export type SmartReceiptPaymentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SmartReceiptPaymentWhereInput | SmartReceiptPaymentWhereInput[]
    OR?: SmartReceiptPaymentWhereInput[]
    NOT?: SmartReceiptPaymentWhereInput | SmartReceiptPaymentWhereInput[]
    userId?: StringFilter<"SmartReceiptPayment"> | string
    smartReceiptId?: StringFilter<"SmartReceiptPayment"> | string
    receiptItemId?: StringFilter<"SmartReceiptPayment"> | string
    createdAt?: DateTimeFilter<"SmartReceiptPayment"> | Date | string
    updatedAt?: DateTimeFilter<"SmartReceiptPayment"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    smartReceipt?: XOR<SmartReceiptNullableScalarRelationFilter, SmartReceiptWhereInput> | null
    item?: XOR<ReceiptItemScalarRelationFilter, ReceiptItemWhereInput>
  }, "id">

  export type SmartReceiptPaymentOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    smartReceiptId?: SortOrder
    receiptItemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SmartReceiptPaymentCountOrderByAggregateInput
    _max?: SmartReceiptPaymentMaxOrderByAggregateInput
    _min?: SmartReceiptPaymentMinOrderByAggregateInput
  }

  export type SmartReceiptPaymentScalarWhereWithAggregatesInput = {
    AND?: SmartReceiptPaymentScalarWhereWithAggregatesInput | SmartReceiptPaymentScalarWhereWithAggregatesInput[]
    OR?: SmartReceiptPaymentScalarWhereWithAggregatesInput[]
    NOT?: SmartReceiptPaymentScalarWhereWithAggregatesInput | SmartReceiptPaymentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SmartReceiptPayment"> | string
    userId?: StringWithAggregatesFilter<"SmartReceiptPayment"> | string
    smartReceiptId?: StringWithAggregatesFilter<"SmartReceiptPayment"> | string
    receiptItemId?: StringWithAggregatesFilter<"SmartReceiptPayment"> | string
    createdAt?: DateTimeWithAggregatesFilter<"SmartReceiptPayment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SmartReceiptPayment"> | Date | string
  }

  export type UserCreateInput = {
    id: string
    email: string
    createdAt?: Date | string
    avatarUrl?: string | null
    admin?: boolean
    receipts?: ReceiptCreateNestedManyWithoutCreatedByInput
    payments?: SmartReceiptPaymentCreateNestedManyWithoutUserInput
    smartReceipts?: SmartReceiptCreateNestedManyWithoutUsersInput
  }

  export type UserUncheckedCreateInput = {
    id: string
    email: string
    createdAt?: Date | string
    avatarUrl?: string | null
    admin?: boolean
    receipts?: ReceiptUncheckedCreateNestedManyWithoutCreatedByInput
    payments?: SmartReceiptPaymentUncheckedCreateNestedManyWithoutUserInput
    smartReceipts?: SmartReceiptUncheckedCreateNestedManyWithoutUsersInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    admin?: BoolFieldUpdateOperationsInput | boolean
    receipts?: ReceiptUpdateManyWithoutCreatedByNestedInput
    payments?: SmartReceiptPaymentUpdateManyWithoutUserNestedInput
    smartReceipts?: SmartReceiptUpdateManyWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    admin?: BoolFieldUpdateOperationsInput | boolean
    receipts?: ReceiptUncheckedUpdateManyWithoutCreatedByNestedInput
    payments?: SmartReceiptPaymentUncheckedUpdateManyWithoutUserNestedInput
    smartReceipts?: SmartReceiptUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type UserCreateManyInput = {
    id: string
    email: string
    createdAt?: Date | string
    avatarUrl?: string | null
    admin?: boolean
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    admin?: BoolFieldUpdateOperationsInput | boolean
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    admin?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ReceiptCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    merchantName: string
    receiptType?: string | null
    receiptDate?: Date | string | null
    totalPrice: number
    currencyCode?: string | null
    createdBy: UserCreateNestedOneWithoutReceiptsInput
    itemGroups?: ReceiptItemGroupCreateNestedManyWithoutReceiptInput
    smartReceipts?: SmartReceiptCreateNestedManyWithoutReceiptInput
  }

  export type ReceiptUncheckedCreateInput = {
    id?: string
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    merchantName: string
    receiptType?: string | null
    receiptDate?: Date | string | null
    totalPrice: number
    currencyCode?: string | null
    itemGroups?: ReceiptItemGroupUncheckedCreateNestedManyWithoutReceiptInput
    smartReceipts?: SmartReceiptUncheckedCreateNestedManyWithoutReceiptInput
  }

  export type ReceiptUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    merchantName?: StringFieldUpdateOperationsInput | string
    receiptType?: NullableStringFieldUpdateOperationsInput | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPrice?: FloatFieldUpdateOperationsInput | number
    currencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: UserUpdateOneRequiredWithoutReceiptsNestedInput
    itemGroups?: ReceiptItemGroupUpdateManyWithoutReceiptNestedInput
    smartReceipts?: SmartReceiptUpdateManyWithoutReceiptNestedInput
  }

  export type ReceiptUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    merchantName?: StringFieldUpdateOperationsInput | string
    receiptType?: NullableStringFieldUpdateOperationsInput | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPrice?: FloatFieldUpdateOperationsInput | number
    currencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    itemGroups?: ReceiptItemGroupUncheckedUpdateManyWithoutReceiptNestedInput
    smartReceipts?: SmartReceiptUncheckedUpdateManyWithoutReceiptNestedInput
  }

  export type ReceiptCreateManyInput = {
    id?: string
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    merchantName: string
    receiptType?: string | null
    receiptDate?: Date | string | null
    totalPrice: number
    currencyCode?: string | null
  }

  export type ReceiptUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    merchantName?: StringFieldUpdateOperationsInput | string
    receiptType?: NullableStringFieldUpdateOperationsInput | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPrice?: FloatFieldUpdateOperationsInput | number
    currencyCode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ReceiptUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    merchantName?: StringFieldUpdateOperationsInput | string
    receiptType?: NullableStringFieldUpdateOperationsInput | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPrice?: FloatFieldUpdateOperationsInput | number
    currencyCode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ReceiptItemGroupCreateInput = {
    id?: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    quantity: number
    quantityUnit?: string | null
    unitPrice: number
    receipt: ReceiptCreateNestedOneWithoutItemGroupsInput
    items?: ReceiptItemCreateNestedManyWithoutItemGroupInput
    translations?: ReceiptItemGroupTranslationCreateNestedManyWithoutItemGroupInput
  }

  export type ReceiptItemGroupUncheckedCreateInput = {
    id?: string
    receiptId: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    quantity: number
    quantityUnit?: string | null
    unitPrice: number
    items?: ReceiptItemUncheckedCreateNestedManyWithoutItemGroupInput
    translations?: ReceiptItemGroupTranslationUncheckedCreateNestedManyWithoutItemGroupInput
  }

  export type ReceiptItemGroupUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: FloatFieldUpdateOperationsInput | number
    quantityUnit?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: FloatFieldUpdateOperationsInput | number
    receipt?: ReceiptUpdateOneRequiredWithoutItemGroupsNestedInput
    items?: ReceiptItemUpdateManyWithoutItemGroupNestedInput
    translations?: ReceiptItemGroupTranslationUpdateManyWithoutItemGroupNestedInput
  }

  export type ReceiptItemGroupUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    receiptId?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: FloatFieldUpdateOperationsInput | number
    quantityUnit?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: FloatFieldUpdateOperationsInput | number
    items?: ReceiptItemUncheckedUpdateManyWithoutItemGroupNestedInput
    translations?: ReceiptItemGroupTranslationUncheckedUpdateManyWithoutItemGroupNestedInput
  }

  export type ReceiptItemGroupCreateManyInput = {
    id?: string
    receiptId: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    quantity: number
    quantityUnit?: string | null
    unitPrice: number
  }

  export type ReceiptItemGroupUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: FloatFieldUpdateOperationsInput | number
    quantityUnit?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: FloatFieldUpdateOperationsInput | number
  }

  export type ReceiptItemGroupUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    receiptId?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: FloatFieldUpdateOperationsInput | number
    quantityUnit?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: FloatFieldUpdateOperationsInput | number
  }

  export type ReceiptItemCreateInput = {
    id?: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    itemGroup: ReceiptItemGroupCreateNestedOneWithoutItemsInput
    supplements?: ReceiptItemSupplementCreateNestedManyWithoutItemInput
    smartPayments?: SmartReceiptPaymentCreateNestedManyWithoutItemInput
  }

  export type ReceiptItemUncheckedCreateInput = {
    id?: string
    itemGroupId: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    supplements?: ReceiptItemSupplementUncheckedCreateNestedManyWithoutItemInput
    smartPayments?: SmartReceiptPaymentUncheckedCreateNestedManyWithoutItemInput
  }

  export type ReceiptItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    itemGroup?: ReceiptItemGroupUpdateOneRequiredWithoutItemsNestedInput
    supplements?: ReceiptItemSupplementUpdateManyWithoutItemNestedInput
    smartPayments?: SmartReceiptPaymentUpdateManyWithoutItemNestedInput
  }

  export type ReceiptItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    itemGroupId?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    supplements?: ReceiptItemSupplementUncheckedUpdateManyWithoutItemNestedInput
    smartPayments?: SmartReceiptPaymentUncheckedUpdateManyWithoutItemNestedInput
  }

  export type ReceiptItemCreateManyInput = {
    id?: string
    itemGroupId: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    itemGroupId?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemSupplementCreateInput = {
    id?: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    item: ReceiptItemCreateNestedOneWithoutSupplementsInput
    translations?: ReceiptItemSupplementTranslationCreateNestedManyWithoutSupplementInput
  }

  export type ReceiptItemSupplementUncheckedCreateInput = {
    id?: string
    itemId: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    translations?: ReceiptItemSupplementTranslationUncheckedCreateNestedManyWithoutSupplementInput
  }

  export type ReceiptItemSupplementUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    item?: ReceiptItemUpdateOneRequiredWithoutSupplementsNestedInput
    translations?: ReceiptItemSupplementTranslationUpdateManyWithoutSupplementNestedInput
  }

  export type ReceiptItemSupplementUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    itemId?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    translations?: ReceiptItemSupplementTranslationUncheckedUpdateManyWithoutSupplementNestedInput
  }

  export type ReceiptItemSupplementCreateManyInput = {
    id?: string
    itemId: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemSupplementUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemSupplementUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    itemId?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemGroupTranslationCreateInput = {
    id?: string
    label: string
    description: string
    language: string
    lightModeLabelHexColor: string
    darkModeLabelHexColor: string
    createdAt?: Date | string
    updatedAt?: Date | string
    itemGroup: ReceiptItemGroupCreateNestedOneWithoutTranslationsInput
  }

  export type ReceiptItemGroupTranslationUncheckedCreateInput = {
    id?: string
    itemGroupId: string
    label: string
    description: string
    language: string
    lightModeLabelHexColor: string
    darkModeLabelHexColor: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemGroupTranslationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lightModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    darkModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    itemGroup?: ReceiptItemGroupUpdateOneRequiredWithoutTranslationsNestedInput
  }

  export type ReceiptItemGroupTranslationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    itemGroupId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lightModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    darkModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemGroupTranslationCreateManyInput = {
    id?: string
    itemGroupId: string
    label: string
    description: string
    language: string
    lightModeLabelHexColor: string
    darkModeLabelHexColor: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemGroupTranslationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lightModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    darkModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemGroupTranslationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    itemGroupId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lightModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    darkModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemSupplementTranslationCreateInput = {
    id?: string
    label: string
    description: string
    language: string
    lightModeLabelHexColor: string
    darkModeLabelHexColor: string
    createdAt?: Date | string
    updatedAt?: Date | string
    supplement: ReceiptItemSupplementCreateNestedOneWithoutTranslationsInput
  }

  export type ReceiptItemSupplementTranslationUncheckedCreateInput = {
    id?: string
    supplementId: string
    label: string
    description: string
    language: string
    lightModeLabelHexColor: string
    darkModeLabelHexColor: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemSupplementTranslationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lightModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    darkModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    supplement?: ReceiptItemSupplementUpdateOneRequiredWithoutTranslationsNestedInput
  }

  export type ReceiptItemSupplementTranslationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    supplementId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lightModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    darkModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemSupplementTranslationCreateManyInput = {
    id?: string
    supplementId: string
    label: string
    description: string
    language: string
    lightModeLabelHexColor: string
    darkModeLabelHexColor: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemSupplementTranslationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lightModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    darkModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemSupplementTranslationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    supplementId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lightModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    darkModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SmartReceiptCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedTotalPrice?: number | null
    updatedCurrencyCode?: string | null
    receipt: ReceiptCreateNestedOneWithoutSmartReceiptsInput
    users?: UserCreateNestedManyWithoutSmartReceiptsInput
    payments?: SmartReceiptPaymentCreateNestedManyWithoutSmartReceiptInput
  }

  export type SmartReceiptUncheckedCreateInput = {
    id?: string
    receiptId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedTotalPrice?: number | null
    updatedCurrencyCode?: string | null
    users?: UserUncheckedCreateNestedManyWithoutSmartReceiptsInput
    payments?: SmartReceiptPaymentUncheckedCreateNestedManyWithoutSmartReceiptInput
  }

  export type SmartReceiptUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedTotalPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    updatedCurrencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    receipt?: ReceiptUpdateOneRequiredWithoutSmartReceiptsNestedInput
    users?: UserUpdateManyWithoutSmartReceiptsNestedInput
    payments?: SmartReceiptPaymentUpdateManyWithoutSmartReceiptNestedInput
  }

  export type SmartReceiptUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    receiptId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedTotalPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    updatedCurrencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    users?: UserUncheckedUpdateManyWithoutSmartReceiptsNestedInput
    payments?: SmartReceiptPaymentUncheckedUpdateManyWithoutSmartReceiptNestedInput
  }

  export type SmartReceiptCreateManyInput = {
    id?: string
    receiptId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedTotalPrice?: number | null
    updatedCurrencyCode?: string | null
  }

  export type SmartReceiptUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedTotalPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    updatedCurrencyCode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SmartReceiptUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    receiptId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedTotalPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    updatedCurrencyCode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SmartReceiptPaymentCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutPaymentsInput
    smartReceipt?: SmartReceiptCreateNestedOneWithoutPaymentsInput
    item: ReceiptItemCreateNestedOneWithoutSmartPaymentsInput
  }

  export type SmartReceiptPaymentUncheckedCreateInput = {
    id?: string
    userId: string
    smartReceiptId: string
    receiptItemId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SmartReceiptPaymentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPaymentsNestedInput
    smartReceipt?: SmartReceiptUpdateOneWithoutPaymentsNestedInput
    item?: ReceiptItemUpdateOneRequiredWithoutSmartPaymentsNestedInput
  }

  export type SmartReceiptPaymentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    smartReceiptId?: StringFieldUpdateOperationsInput | string
    receiptItemId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SmartReceiptPaymentCreateManyInput = {
    id?: string
    userId: string
    smartReceiptId: string
    receiptItemId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SmartReceiptPaymentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SmartReceiptPaymentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    smartReceiptId?: StringFieldUpdateOperationsInput | string
    receiptItemId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ReceiptListRelationFilter = {
    every?: ReceiptWhereInput
    some?: ReceiptWhereInput
    none?: ReceiptWhereInput
  }

  export type SmartReceiptPaymentListRelationFilter = {
    every?: SmartReceiptPaymentWhereInput
    some?: SmartReceiptPaymentWhereInput
    none?: SmartReceiptPaymentWhereInput
  }

  export type SmartReceiptListRelationFilter = {
    every?: SmartReceiptWhereInput
    some?: SmartReceiptWhereInput
    none?: SmartReceiptWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ReceiptOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SmartReceiptPaymentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SmartReceiptOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    avatarUrl?: SortOrder
    admin?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    avatarUrl?: SortOrder
    admin?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    avatarUrl?: SortOrder
    admin?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type ReceiptItemGroupListRelationFilter = {
    every?: ReceiptItemGroupWhereInput
    some?: ReceiptItemGroupWhereInput
    none?: ReceiptItemGroupWhereInput
  }

  export type ReceiptItemGroupOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReceiptCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    merchantName?: SortOrder
    receiptType?: SortOrder
    receiptDate?: SortOrder
    totalPrice?: SortOrder
    currencyCode?: SortOrder
  }

  export type ReceiptAvgOrderByAggregateInput = {
    totalPrice?: SortOrder
  }

  export type ReceiptMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    merchantName?: SortOrder
    receiptType?: SortOrder
    receiptDate?: SortOrder
    totalPrice?: SortOrder
    currencyCode?: SortOrder
  }

  export type ReceiptMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    merchantName?: SortOrder
    receiptType?: SortOrder
    receiptDate?: SortOrder
    totalPrice?: SortOrder
    currencyCode?: SortOrder
  }

  export type ReceiptSumOrderByAggregateInput = {
    totalPrice?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type ReceiptScalarRelationFilter = {
    is?: ReceiptWhereInput
    isNot?: ReceiptWhereInput
  }

  export type ReceiptItemListRelationFilter = {
    every?: ReceiptItemWhereInput
    some?: ReceiptItemWhereInput
    none?: ReceiptItemWhereInput
  }

  export type ReceiptItemGroupTranslationListRelationFilter = {
    every?: ReceiptItemGroupTranslationWhereInput
    some?: ReceiptItemGroupTranslationWhereInput
    none?: ReceiptItemGroupTranslationWhereInput
  }

  export type ReceiptItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReceiptItemGroupTranslationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReceiptItemGroupCountOrderByAggregateInput = {
    id?: SortOrder
    receiptId?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    quantity?: SortOrder
    quantityUnit?: SortOrder
    unitPrice?: SortOrder
  }

  export type ReceiptItemGroupAvgOrderByAggregateInput = {
    price?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
  }

  export type ReceiptItemGroupMaxOrderByAggregateInput = {
    id?: SortOrder
    receiptId?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    quantity?: SortOrder
    quantityUnit?: SortOrder
    unitPrice?: SortOrder
  }

  export type ReceiptItemGroupMinOrderByAggregateInput = {
    id?: SortOrder
    receiptId?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    quantity?: SortOrder
    quantityUnit?: SortOrder
    unitPrice?: SortOrder
  }

  export type ReceiptItemGroupSumOrderByAggregateInput = {
    price?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
  }

  export type ReceiptItemGroupScalarRelationFilter = {
    is?: ReceiptItemGroupWhereInput
    isNot?: ReceiptItemGroupWhereInput
  }

  export type ReceiptItemSupplementListRelationFilter = {
    every?: ReceiptItemSupplementWhereInput
    some?: ReceiptItemSupplementWhereInput
    none?: ReceiptItemSupplementWhereInput
  }

  export type ReceiptItemSupplementOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReceiptItemCountOrderByAggregateInput = {
    id?: SortOrder
    itemGroupId?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReceiptItemAvgOrderByAggregateInput = {
    price?: SortOrder
  }

  export type ReceiptItemMaxOrderByAggregateInput = {
    id?: SortOrder
    itemGroupId?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReceiptItemMinOrderByAggregateInput = {
    id?: SortOrder
    itemGroupId?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReceiptItemSumOrderByAggregateInput = {
    price?: SortOrder
  }

  export type ReceiptItemScalarRelationFilter = {
    is?: ReceiptItemWhereInput
    isNot?: ReceiptItemWhereInput
  }

  export type ReceiptItemSupplementTranslationListRelationFilter = {
    every?: ReceiptItemSupplementTranslationWhereInput
    some?: ReceiptItemSupplementTranslationWhereInput
    none?: ReceiptItemSupplementTranslationWhereInput
  }

  export type ReceiptItemSupplementTranslationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReceiptItemSupplementCountOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReceiptItemSupplementAvgOrderByAggregateInput = {
    price?: SortOrder
  }

  export type ReceiptItemSupplementMaxOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReceiptItemSupplementMinOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReceiptItemSupplementSumOrderByAggregateInput = {
    price?: SortOrder
  }

  export type ReceiptItemGroupTranslationCountOrderByAggregateInput = {
    id?: SortOrder
    itemGroupId?: SortOrder
    label?: SortOrder
    description?: SortOrder
    language?: SortOrder
    lightModeLabelHexColor?: SortOrder
    darkModeLabelHexColor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReceiptItemGroupTranslationMaxOrderByAggregateInput = {
    id?: SortOrder
    itemGroupId?: SortOrder
    label?: SortOrder
    description?: SortOrder
    language?: SortOrder
    lightModeLabelHexColor?: SortOrder
    darkModeLabelHexColor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReceiptItemGroupTranslationMinOrderByAggregateInput = {
    id?: SortOrder
    itemGroupId?: SortOrder
    label?: SortOrder
    description?: SortOrder
    language?: SortOrder
    lightModeLabelHexColor?: SortOrder
    darkModeLabelHexColor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReceiptItemSupplementScalarRelationFilter = {
    is?: ReceiptItemSupplementWhereInput
    isNot?: ReceiptItemSupplementWhereInput
  }

  export type ReceiptItemSupplementTranslationCountOrderByAggregateInput = {
    id?: SortOrder
    supplementId?: SortOrder
    label?: SortOrder
    description?: SortOrder
    language?: SortOrder
    lightModeLabelHexColor?: SortOrder
    darkModeLabelHexColor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReceiptItemSupplementTranslationMaxOrderByAggregateInput = {
    id?: SortOrder
    supplementId?: SortOrder
    label?: SortOrder
    description?: SortOrder
    language?: SortOrder
    lightModeLabelHexColor?: SortOrder
    darkModeLabelHexColor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReceiptItemSupplementTranslationMinOrderByAggregateInput = {
    id?: SortOrder
    supplementId?: SortOrder
    label?: SortOrder
    description?: SortOrder
    language?: SortOrder
    lightModeLabelHexColor?: SortOrder
    darkModeLabelHexColor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SmartReceiptCountOrderByAggregateInput = {
    id?: SortOrder
    receiptId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    updatedTotalPrice?: SortOrder
    updatedCurrencyCode?: SortOrder
  }

  export type SmartReceiptAvgOrderByAggregateInput = {
    updatedTotalPrice?: SortOrder
  }

  export type SmartReceiptMaxOrderByAggregateInput = {
    id?: SortOrder
    receiptId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    updatedTotalPrice?: SortOrder
    updatedCurrencyCode?: SortOrder
  }

  export type SmartReceiptMinOrderByAggregateInput = {
    id?: SortOrder
    receiptId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    updatedTotalPrice?: SortOrder
    updatedCurrencyCode?: SortOrder
  }

  export type SmartReceiptSumOrderByAggregateInput = {
    updatedTotalPrice?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type SmartReceiptNullableScalarRelationFilter = {
    is?: SmartReceiptWhereInput | null
    isNot?: SmartReceiptWhereInput | null
  }

  export type SmartReceiptPaymentCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    smartReceiptId?: SortOrder
    receiptItemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SmartReceiptPaymentMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    smartReceiptId?: SortOrder
    receiptItemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SmartReceiptPaymentMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    smartReceiptId?: SortOrder
    receiptItemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReceiptCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<ReceiptCreateWithoutCreatedByInput, ReceiptUncheckedCreateWithoutCreatedByInput> | ReceiptCreateWithoutCreatedByInput[] | ReceiptUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ReceiptCreateOrConnectWithoutCreatedByInput | ReceiptCreateOrConnectWithoutCreatedByInput[]
    createMany?: ReceiptCreateManyCreatedByInputEnvelope
    connect?: ReceiptWhereUniqueInput | ReceiptWhereUniqueInput[]
  }

  export type SmartReceiptPaymentCreateNestedManyWithoutUserInput = {
    create?: XOR<SmartReceiptPaymentCreateWithoutUserInput, SmartReceiptPaymentUncheckedCreateWithoutUserInput> | SmartReceiptPaymentCreateWithoutUserInput[] | SmartReceiptPaymentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SmartReceiptPaymentCreateOrConnectWithoutUserInput | SmartReceiptPaymentCreateOrConnectWithoutUserInput[]
    createMany?: SmartReceiptPaymentCreateManyUserInputEnvelope
    connect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
  }

  export type SmartReceiptCreateNestedManyWithoutUsersInput = {
    create?: XOR<SmartReceiptCreateWithoutUsersInput, SmartReceiptUncheckedCreateWithoutUsersInput> | SmartReceiptCreateWithoutUsersInput[] | SmartReceiptUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: SmartReceiptCreateOrConnectWithoutUsersInput | SmartReceiptCreateOrConnectWithoutUsersInput[]
    connect?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
  }

  export type ReceiptUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<ReceiptCreateWithoutCreatedByInput, ReceiptUncheckedCreateWithoutCreatedByInput> | ReceiptCreateWithoutCreatedByInput[] | ReceiptUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ReceiptCreateOrConnectWithoutCreatedByInput | ReceiptCreateOrConnectWithoutCreatedByInput[]
    createMany?: ReceiptCreateManyCreatedByInputEnvelope
    connect?: ReceiptWhereUniqueInput | ReceiptWhereUniqueInput[]
  }

  export type SmartReceiptPaymentUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SmartReceiptPaymentCreateWithoutUserInput, SmartReceiptPaymentUncheckedCreateWithoutUserInput> | SmartReceiptPaymentCreateWithoutUserInput[] | SmartReceiptPaymentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SmartReceiptPaymentCreateOrConnectWithoutUserInput | SmartReceiptPaymentCreateOrConnectWithoutUserInput[]
    createMany?: SmartReceiptPaymentCreateManyUserInputEnvelope
    connect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
  }

  export type SmartReceiptUncheckedCreateNestedManyWithoutUsersInput = {
    create?: XOR<SmartReceiptCreateWithoutUsersInput, SmartReceiptUncheckedCreateWithoutUsersInput> | SmartReceiptCreateWithoutUsersInput[] | SmartReceiptUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: SmartReceiptCreateOrConnectWithoutUsersInput | SmartReceiptCreateOrConnectWithoutUsersInput[]
    connect?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ReceiptUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<ReceiptCreateWithoutCreatedByInput, ReceiptUncheckedCreateWithoutCreatedByInput> | ReceiptCreateWithoutCreatedByInput[] | ReceiptUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ReceiptCreateOrConnectWithoutCreatedByInput | ReceiptCreateOrConnectWithoutCreatedByInput[]
    upsert?: ReceiptUpsertWithWhereUniqueWithoutCreatedByInput | ReceiptUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: ReceiptCreateManyCreatedByInputEnvelope
    set?: ReceiptWhereUniqueInput | ReceiptWhereUniqueInput[]
    disconnect?: ReceiptWhereUniqueInput | ReceiptWhereUniqueInput[]
    delete?: ReceiptWhereUniqueInput | ReceiptWhereUniqueInput[]
    connect?: ReceiptWhereUniqueInput | ReceiptWhereUniqueInput[]
    update?: ReceiptUpdateWithWhereUniqueWithoutCreatedByInput | ReceiptUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: ReceiptUpdateManyWithWhereWithoutCreatedByInput | ReceiptUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: ReceiptScalarWhereInput | ReceiptScalarWhereInput[]
  }

  export type SmartReceiptPaymentUpdateManyWithoutUserNestedInput = {
    create?: XOR<SmartReceiptPaymentCreateWithoutUserInput, SmartReceiptPaymentUncheckedCreateWithoutUserInput> | SmartReceiptPaymentCreateWithoutUserInput[] | SmartReceiptPaymentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SmartReceiptPaymentCreateOrConnectWithoutUserInput | SmartReceiptPaymentCreateOrConnectWithoutUserInput[]
    upsert?: SmartReceiptPaymentUpsertWithWhereUniqueWithoutUserInput | SmartReceiptPaymentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SmartReceiptPaymentCreateManyUserInputEnvelope
    set?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    disconnect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    delete?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    connect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    update?: SmartReceiptPaymentUpdateWithWhereUniqueWithoutUserInput | SmartReceiptPaymentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SmartReceiptPaymentUpdateManyWithWhereWithoutUserInput | SmartReceiptPaymentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SmartReceiptPaymentScalarWhereInput | SmartReceiptPaymentScalarWhereInput[]
  }

  export type SmartReceiptUpdateManyWithoutUsersNestedInput = {
    create?: XOR<SmartReceiptCreateWithoutUsersInput, SmartReceiptUncheckedCreateWithoutUsersInput> | SmartReceiptCreateWithoutUsersInput[] | SmartReceiptUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: SmartReceiptCreateOrConnectWithoutUsersInput | SmartReceiptCreateOrConnectWithoutUsersInput[]
    upsert?: SmartReceiptUpsertWithWhereUniqueWithoutUsersInput | SmartReceiptUpsertWithWhereUniqueWithoutUsersInput[]
    set?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    disconnect?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    delete?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    connect?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    update?: SmartReceiptUpdateWithWhereUniqueWithoutUsersInput | SmartReceiptUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: SmartReceiptUpdateManyWithWhereWithoutUsersInput | SmartReceiptUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: SmartReceiptScalarWhereInput | SmartReceiptScalarWhereInput[]
  }

  export type ReceiptUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<ReceiptCreateWithoutCreatedByInput, ReceiptUncheckedCreateWithoutCreatedByInput> | ReceiptCreateWithoutCreatedByInput[] | ReceiptUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ReceiptCreateOrConnectWithoutCreatedByInput | ReceiptCreateOrConnectWithoutCreatedByInput[]
    upsert?: ReceiptUpsertWithWhereUniqueWithoutCreatedByInput | ReceiptUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: ReceiptCreateManyCreatedByInputEnvelope
    set?: ReceiptWhereUniqueInput | ReceiptWhereUniqueInput[]
    disconnect?: ReceiptWhereUniqueInput | ReceiptWhereUniqueInput[]
    delete?: ReceiptWhereUniqueInput | ReceiptWhereUniqueInput[]
    connect?: ReceiptWhereUniqueInput | ReceiptWhereUniqueInput[]
    update?: ReceiptUpdateWithWhereUniqueWithoutCreatedByInput | ReceiptUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: ReceiptUpdateManyWithWhereWithoutCreatedByInput | ReceiptUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: ReceiptScalarWhereInput | ReceiptScalarWhereInput[]
  }

  export type SmartReceiptPaymentUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SmartReceiptPaymentCreateWithoutUserInput, SmartReceiptPaymentUncheckedCreateWithoutUserInput> | SmartReceiptPaymentCreateWithoutUserInput[] | SmartReceiptPaymentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SmartReceiptPaymentCreateOrConnectWithoutUserInput | SmartReceiptPaymentCreateOrConnectWithoutUserInput[]
    upsert?: SmartReceiptPaymentUpsertWithWhereUniqueWithoutUserInput | SmartReceiptPaymentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SmartReceiptPaymentCreateManyUserInputEnvelope
    set?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    disconnect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    delete?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    connect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    update?: SmartReceiptPaymentUpdateWithWhereUniqueWithoutUserInput | SmartReceiptPaymentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SmartReceiptPaymentUpdateManyWithWhereWithoutUserInput | SmartReceiptPaymentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SmartReceiptPaymentScalarWhereInput | SmartReceiptPaymentScalarWhereInput[]
  }

  export type SmartReceiptUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: XOR<SmartReceiptCreateWithoutUsersInput, SmartReceiptUncheckedCreateWithoutUsersInput> | SmartReceiptCreateWithoutUsersInput[] | SmartReceiptUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: SmartReceiptCreateOrConnectWithoutUsersInput | SmartReceiptCreateOrConnectWithoutUsersInput[]
    upsert?: SmartReceiptUpsertWithWhereUniqueWithoutUsersInput | SmartReceiptUpsertWithWhereUniqueWithoutUsersInput[]
    set?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    disconnect?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    delete?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    connect?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    update?: SmartReceiptUpdateWithWhereUniqueWithoutUsersInput | SmartReceiptUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: SmartReceiptUpdateManyWithWhereWithoutUsersInput | SmartReceiptUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: SmartReceiptScalarWhereInput | SmartReceiptScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutReceiptsInput = {
    create?: XOR<UserCreateWithoutReceiptsInput, UserUncheckedCreateWithoutReceiptsInput>
    connectOrCreate?: UserCreateOrConnectWithoutReceiptsInput
    connect?: UserWhereUniqueInput
  }

  export type ReceiptItemGroupCreateNestedManyWithoutReceiptInput = {
    create?: XOR<ReceiptItemGroupCreateWithoutReceiptInput, ReceiptItemGroupUncheckedCreateWithoutReceiptInput> | ReceiptItemGroupCreateWithoutReceiptInput[] | ReceiptItemGroupUncheckedCreateWithoutReceiptInput[]
    connectOrCreate?: ReceiptItemGroupCreateOrConnectWithoutReceiptInput | ReceiptItemGroupCreateOrConnectWithoutReceiptInput[]
    createMany?: ReceiptItemGroupCreateManyReceiptInputEnvelope
    connect?: ReceiptItemGroupWhereUniqueInput | ReceiptItemGroupWhereUniqueInput[]
  }

  export type SmartReceiptCreateNestedManyWithoutReceiptInput = {
    create?: XOR<SmartReceiptCreateWithoutReceiptInput, SmartReceiptUncheckedCreateWithoutReceiptInput> | SmartReceiptCreateWithoutReceiptInput[] | SmartReceiptUncheckedCreateWithoutReceiptInput[]
    connectOrCreate?: SmartReceiptCreateOrConnectWithoutReceiptInput | SmartReceiptCreateOrConnectWithoutReceiptInput[]
    createMany?: SmartReceiptCreateManyReceiptInputEnvelope
    connect?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
  }

  export type ReceiptItemGroupUncheckedCreateNestedManyWithoutReceiptInput = {
    create?: XOR<ReceiptItemGroupCreateWithoutReceiptInput, ReceiptItemGroupUncheckedCreateWithoutReceiptInput> | ReceiptItemGroupCreateWithoutReceiptInput[] | ReceiptItemGroupUncheckedCreateWithoutReceiptInput[]
    connectOrCreate?: ReceiptItemGroupCreateOrConnectWithoutReceiptInput | ReceiptItemGroupCreateOrConnectWithoutReceiptInput[]
    createMany?: ReceiptItemGroupCreateManyReceiptInputEnvelope
    connect?: ReceiptItemGroupWhereUniqueInput | ReceiptItemGroupWhereUniqueInput[]
  }

  export type SmartReceiptUncheckedCreateNestedManyWithoutReceiptInput = {
    create?: XOR<SmartReceiptCreateWithoutReceiptInput, SmartReceiptUncheckedCreateWithoutReceiptInput> | SmartReceiptCreateWithoutReceiptInput[] | SmartReceiptUncheckedCreateWithoutReceiptInput[]
    connectOrCreate?: SmartReceiptCreateOrConnectWithoutReceiptInput | SmartReceiptCreateOrConnectWithoutReceiptInput[]
    createMany?: SmartReceiptCreateManyReceiptInputEnvelope
    connect?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutReceiptsNestedInput = {
    create?: XOR<UserCreateWithoutReceiptsInput, UserUncheckedCreateWithoutReceiptsInput>
    connectOrCreate?: UserCreateOrConnectWithoutReceiptsInput
    upsert?: UserUpsertWithoutReceiptsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutReceiptsInput, UserUpdateWithoutReceiptsInput>, UserUncheckedUpdateWithoutReceiptsInput>
  }

  export type ReceiptItemGroupUpdateManyWithoutReceiptNestedInput = {
    create?: XOR<ReceiptItemGroupCreateWithoutReceiptInput, ReceiptItemGroupUncheckedCreateWithoutReceiptInput> | ReceiptItemGroupCreateWithoutReceiptInput[] | ReceiptItemGroupUncheckedCreateWithoutReceiptInput[]
    connectOrCreate?: ReceiptItemGroupCreateOrConnectWithoutReceiptInput | ReceiptItemGroupCreateOrConnectWithoutReceiptInput[]
    upsert?: ReceiptItemGroupUpsertWithWhereUniqueWithoutReceiptInput | ReceiptItemGroupUpsertWithWhereUniqueWithoutReceiptInput[]
    createMany?: ReceiptItemGroupCreateManyReceiptInputEnvelope
    set?: ReceiptItemGroupWhereUniqueInput | ReceiptItemGroupWhereUniqueInput[]
    disconnect?: ReceiptItemGroupWhereUniqueInput | ReceiptItemGroupWhereUniqueInput[]
    delete?: ReceiptItemGroupWhereUniqueInput | ReceiptItemGroupWhereUniqueInput[]
    connect?: ReceiptItemGroupWhereUniqueInput | ReceiptItemGroupWhereUniqueInput[]
    update?: ReceiptItemGroupUpdateWithWhereUniqueWithoutReceiptInput | ReceiptItemGroupUpdateWithWhereUniqueWithoutReceiptInput[]
    updateMany?: ReceiptItemGroupUpdateManyWithWhereWithoutReceiptInput | ReceiptItemGroupUpdateManyWithWhereWithoutReceiptInput[]
    deleteMany?: ReceiptItemGroupScalarWhereInput | ReceiptItemGroupScalarWhereInput[]
  }

  export type SmartReceiptUpdateManyWithoutReceiptNestedInput = {
    create?: XOR<SmartReceiptCreateWithoutReceiptInput, SmartReceiptUncheckedCreateWithoutReceiptInput> | SmartReceiptCreateWithoutReceiptInput[] | SmartReceiptUncheckedCreateWithoutReceiptInput[]
    connectOrCreate?: SmartReceiptCreateOrConnectWithoutReceiptInput | SmartReceiptCreateOrConnectWithoutReceiptInput[]
    upsert?: SmartReceiptUpsertWithWhereUniqueWithoutReceiptInput | SmartReceiptUpsertWithWhereUniqueWithoutReceiptInput[]
    createMany?: SmartReceiptCreateManyReceiptInputEnvelope
    set?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    disconnect?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    delete?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    connect?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    update?: SmartReceiptUpdateWithWhereUniqueWithoutReceiptInput | SmartReceiptUpdateWithWhereUniqueWithoutReceiptInput[]
    updateMany?: SmartReceiptUpdateManyWithWhereWithoutReceiptInput | SmartReceiptUpdateManyWithWhereWithoutReceiptInput[]
    deleteMany?: SmartReceiptScalarWhereInput | SmartReceiptScalarWhereInput[]
  }

  export type ReceiptItemGroupUncheckedUpdateManyWithoutReceiptNestedInput = {
    create?: XOR<ReceiptItemGroupCreateWithoutReceiptInput, ReceiptItemGroupUncheckedCreateWithoutReceiptInput> | ReceiptItemGroupCreateWithoutReceiptInput[] | ReceiptItemGroupUncheckedCreateWithoutReceiptInput[]
    connectOrCreate?: ReceiptItemGroupCreateOrConnectWithoutReceiptInput | ReceiptItemGroupCreateOrConnectWithoutReceiptInput[]
    upsert?: ReceiptItemGroupUpsertWithWhereUniqueWithoutReceiptInput | ReceiptItemGroupUpsertWithWhereUniqueWithoutReceiptInput[]
    createMany?: ReceiptItemGroupCreateManyReceiptInputEnvelope
    set?: ReceiptItemGroupWhereUniqueInput | ReceiptItemGroupWhereUniqueInput[]
    disconnect?: ReceiptItemGroupWhereUniqueInput | ReceiptItemGroupWhereUniqueInput[]
    delete?: ReceiptItemGroupWhereUniqueInput | ReceiptItemGroupWhereUniqueInput[]
    connect?: ReceiptItemGroupWhereUniqueInput | ReceiptItemGroupWhereUniqueInput[]
    update?: ReceiptItemGroupUpdateWithWhereUniqueWithoutReceiptInput | ReceiptItemGroupUpdateWithWhereUniqueWithoutReceiptInput[]
    updateMany?: ReceiptItemGroupUpdateManyWithWhereWithoutReceiptInput | ReceiptItemGroupUpdateManyWithWhereWithoutReceiptInput[]
    deleteMany?: ReceiptItemGroupScalarWhereInput | ReceiptItemGroupScalarWhereInput[]
  }

  export type SmartReceiptUncheckedUpdateManyWithoutReceiptNestedInput = {
    create?: XOR<SmartReceiptCreateWithoutReceiptInput, SmartReceiptUncheckedCreateWithoutReceiptInput> | SmartReceiptCreateWithoutReceiptInput[] | SmartReceiptUncheckedCreateWithoutReceiptInput[]
    connectOrCreate?: SmartReceiptCreateOrConnectWithoutReceiptInput | SmartReceiptCreateOrConnectWithoutReceiptInput[]
    upsert?: SmartReceiptUpsertWithWhereUniqueWithoutReceiptInput | SmartReceiptUpsertWithWhereUniqueWithoutReceiptInput[]
    createMany?: SmartReceiptCreateManyReceiptInputEnvelope
    set?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    disconnect?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    delete?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    connect?: SmartReceiptWhereUniqueInput | SmartReceiptWhereUniqueInput[]
    update?: SmartReceiptUpdateWithWhereUniqueWithoutReceiptInput | SmartReceiptUpdateWithWhereUniqueWithoutReceiptInput[]
    updateMany?: SmartReceiptUpdateManyWithWhereWithoutReceiptInput | SmartReceiptUpdateManyWithWhereWithoutReceiptInput[]
    deleteMany?: SmartReceiptScalarWhereInput | SmartReceiptScalarWhereInput[]
  }

  export type ReceiptCreateNestedOneWithoutItemGroupsInput = {
    create?: XOR<ReceiptCreateWithoutItemGroupsInput, ReceiptUncheckedCreateWithoutItemGroupsInput>
    connectOrCreate?: ReceiptCreateOrConnectWithoutItemGroupsInput
    connect?: ReceiptWhereUniqueInput
  }

  export type ReceiptItemCreateNestedManyWithoutItemGroupInput = {
    create?: XOR<ReceiptItemCreateWithoutItemGroupInput, ReceiptItemUncheckedCreateWithoutItemGroupInput> | ReceiptItemCreateWithoutItemGroupInput[] | ReceiptItemUncheckedCreateWithoutItemGroupInput[]
    connectOrCreate?: ReceiptItemCreateOrConnectWithoutItemGroupInput | ReceiptItemCreateOrConnectWithoutItemGroupInput[]
    createMany?: ReceiptItemCreateManyItemGroupInputEnvelope
    connect?: ReceiptItemWhereUniqueInput | ReceiptItemWhereUniqueInput[]
  }

  export type ReceiptItemGroupTranslationCreateNestedManyWithoutItemGroupInput = {
    create?: XOR<ReceiptItemGroupTranslationCreateWithoutItemGroupInput, ReceiptItemGroupTranslationUncheckedCreateWithoutItemGroupInput> | ReceiptItemGroupTranslationCreateWithoutItemGroupInput[] | ReceiptItemGroupTranslationUncheckedCreateWithoutItemGroupInput[]
    connectOrCreate?: ReceiptItemGroupTranslationCreateOrConnectWithoutItemGroupInput | ReceiptItemGroupTranslationCreateOrConnectWithoutItemGroupInput[]
    createMany?: ReceiptItemGroupTranslationCreateManyItemGroupInputEnvelope
    connect?: ReceiptItemGroupTranslationWhereUniqueInput | ReceiptItemGroupTranslationWhereUniqueInput[]
  }

  export type ReceiptItemUncheckedCreateNestedManyWithoutItemGroupInput = {
    create?: XOR<ReceiptItemCreateWithoutItemGroupInput, ReceiptItemUncheckedCreateWithoutItemGroupInput> | ReceiptItemCreateWithoutItemGroupInput[] | ReceiptItemUncheckedCreateWithoutItemGroupInput[]
    connectOrCreate?: ReceiptItemCreateOrConnectWithoutItemGroupInput | ReceiptItemCreateOrConnectWithoutItemGroupInput[]
    createMany?: ReceiptItemCreateManyItemGroupInputEnvelope
    connect?: ReceiptItemWhereUniqueInput | ReceiptItemWhereUniqueInput[]
  }

  export type ReceiptItemGroupTranslationUncheckedCreateNestedManyWithoutItemGroupInput = {
    create?: XOR<ReceiptItemGroupTranslationCreateWithoutItemGroupInput, ReceiptItemGroupTranslationUncheckedCreateWithoutItemGroupInput> | ReceiptItemGroupTranslationCreateWithoutItemGroupInput[] | ReceiptItemGroupTranslationUncheckedCreateWithoutItemGroupInput[]
    connectOrCreate?: ReceiptItemGroupTranslationCreateOrConnectWithoutItemGroupInput | ReceiptItemGroupTranslationCreateOrConnectWithoutItemGroupInput[]
    createMany?: ReceiptItemGroupTranslationCreateManyItemGroupInputEnvelope
    connect?: ReceiptItemGroupTranslationWhereUniqueInput | ReceiptItemGroupTranslationWhereUniqueInput[]
  }

  export type ReceiptUpdateOneRequiredWithoutItemGroupsNestedInput = {
    create?: XOR<ReceiptCreateWithoutItemGroupsInput, ReceiptUncheckedCreateWithoutItemGroupsInput>
    connectOrCreate?: ReceiptCreateOrConnectWithoutItemGroupsInput
    upsert?: ReceiptUpsertWithoutItemGroupsInput
    connect?: ReceiptWhereUniqueInput
    update?: XOR<XOR<ReceiptUpdateToOneWithWhereWithoutItemGroupsInput, ReceiptUpdateWithoutItemGroupsInput>, ReceiptUncheckedUpdateWithoutItemGroupsInput>
  }

  export type ReceiptItemUpdateManyWithoutItemGroupNestedInput = {
    create?: XOR<ReceiptItemCreateWithoutItemGroupInput, ReceiptItemUncheckedCreateWithoutItemGroupInput> | ReceiptItemCreateWithoutItemGroupInput[] | ReceiptItemUncheckedCreateWithoutItemGroupInput[]
    connectOrCreate?: ReceiptItemCreateOrConnectWithoutItemGroupInput | ReceiptItemCreateOrConnectWithoutItemGroupInput[]
    upsert?: ReceiptItemUpsertWithWhereUniqueWithoutItemGroupInput | ReceiptItemUpsertWithWhereUniqueWithoutItemGroupInput[]
    createMany?: ReceiptItemCreateManyItemGroupInputEnvelope
    set?: ReceiptItemWhereUniqueInput | ReceiptItemWhereUniqueInput[]
    disconnect?: ReceiptItemWhereUniqueInput | ReceiptItemWhereUniqueInput[]
    delete?: ReceiptItemWhereUniqueInput | ReceiptItemWhereUniqueInput[]
    connect?: ReceiptItemWhereUniqueInput | ReceiptItemWhereUniqueInput[]
    update?: ReceiptItemUpdateWithWhereUniqueWithoutItemGroupInput | ReceiptItemUpdateWithWhereUniqueWithoutItemGroupInput[]
    updateMany?: ReceiptItemUpdateManyWithWhereWithoutItemGroupInput | ReceiptItemUpdateManyWithWhereWithoutItemGroupInput[]
    deleteMany?: ReceiptItemScalarWhereInput | ReceiptItemScalarWhereInput[]
  }

  export type ReceiptItemGroupTranslationUpdateManyWithoutItemGroupNestedInput = {
    create?: XOR<ReceiptItemGroupTranslationCreateWithoutItemGroupInput, ReceiptItemGroupTranslationUncheckedCreateWithoutItemGroupInput> | ReceiptItemGroupTranslationCreateWithoutItemGroupInput[] | ReceiptItemGroupTranslationUncheckedCreateWithoutItemGroupInput[]
    connectOrCreate?: ReceiptItemGroupTranslationCreateOrConnectWithoutItemGroupInput | ReceiptItemGroupTranslationCreateOrConnectWithoutItemGroupInput[]
    upsert?: ReceiptItemGroupTranslationUpsertWithWhereUniqueWithoutItemGroupInput | ReceiptItemGroupTranslationUpsertWithWhereUniqueWithoutItemGroupInput[]
    createMany?: ReceiptItemGroupTranslationCreateManyItemGroupInputEnvelope
    set?: ReceiptItemGroupTranslationWhereUniqueInput | ReceiptItemGroupTranslationWhereUniqueInput[]
    disconnect?: ReceiptItemGroupTranslationWhereUniqueInput | ReceiptItemGroupTranslationWhereUniqueInput[]
    delete?: ReceiptItemGroupTranslationWhereUniqueInput | ReceiptItemGroupTranslationWhereUniqueInput[]
    connect?: ReceiptItemGroupTranslationWhereUniqueInput | ReceiptItemGroupTranslationWhereUniqueInput[]
    update?: ReceiptItemGroupTranslationUpdateWithWhereUniqueWithoutItemGroupInput | ReceiptItemGroupTranslationUpdateWithWhereUniqueWithoutItemGroupInput[]
    updateMany?: ReceiptItemGroupTranslationUpdateManyWithWhereWithoutItemGroupInput | ReceiptItemGroupTranslationUpdateManyWithWhereWithoutItemGroupInput[]
    deleteMany?: ReceiptItemGroupTranslationScalarWhereInput | ReceiptItemGroupTranslationScalarWhereInput[]
  }

  export type ReceiptItemUncheckedUpdateManyWithoutItemGroupNestedInput = {
    create?: XOR<ReceiptItemCreateWithoutItemGroupInput, ReceiptItemUncheckedCreateWithoutItemGroupInput> | ReceiptItemCreateWithoutItemGroupInput[] | ReceiptItemUncheckedCreateWithoutItemGroupInput[]
    connectOrCreate?: ReceiptItemCreateOrConnectWithoutItemGroupInput | ReceiptItemCreateOrConnectWithoutItemGroupInput[]
    upsert?: ReceiptItemUpsertWithWhereUniqueWithoutItemGroupInput | ReceiptItemUpsertWithWhereUniqueWithoutItemGroupInput[]
    createMany?: ReceiptItemCreateManyItemGroupInputEnvelope
    set?: ReceiptItemWhereUniqueInput | ReceiptItemWhereUniqueInput[]
    disconnect?: ReceiptItemWhereUniqueInput | ReceiptItemWhereUniqueInput[]
    delete?: ReceiptItemWhereUniqueInput | ReceiptItemWhereUniqueInput[]
    connect?: ReceiptItemWhereUniqueInput | ReceiptItemWhereUniqueInput[]
    update?: ReceiptItemUpdateWithWhereUniqueWithoutItemGroupInput | ReceiptItemUpdateWithWhereUniqueWithoutItemGroupInput[]
    updateMany?: ReceiptItemUpdateManyWithWhereWithoutItemGroupInput | ReceiptItemUpdateManyWithWhereWithoutItemGroupInput[]
    deleteMany?: ReceiptItemScalarWhereInput | ReceiptItemScalarWhereInput[]
  }

  export type ReceiptItemGroupTranslationUncheckedUpdateManyWithoutItemGroupNestedInput = {
    create?: XOR<ReceiptItemGroupTranslationCreateWithoutItemGroupInput, ReceiptItemGroupTranslationUncheckedCreateWithoutItemGroupInput> | ReceiptItemGroupTranslationCreateWithoutItemGroupInput[] | ReceiptItemGroupTranslationUncheckedCreateWithoutItemGroupInput[]
    connectOrCreate?: ReceiptItemGroupTranslationCreateOrConnectWithoutItemGroupInput | ReceiptItemGroupTranslationCreateOrConnectWithoutItemGroupInput[]
    upsert?: ReceiptItemGroupTranslationUpsertWithWhereUniqueWithoutItemGroupInput | ReceiptItemGroupTranslationUpsertWithWhereUniqueWithoutItemGroupInput[]
    createMany?: ReceiptItemGroupTranslationCreateManyItemGroupInputEnvelope
    set?: ReceiptItemGroupTranslationWhereUniqueInput | ReceiptItemGroupTranslationWhereUniqueInput[]
    disconnect?: ReceiptItemGroupTranslationWhereUniqueInput | ReceiptItemGroupTranslationWhereUniqueInput[]
    delete?: ReceiptItemGroupTranslationWhereUniqueInput | ReceiptItemGroupTranslationWhereUniqueInput[]
    connect?: ReceiptItemGroupTranslationWhereUniqueInput | ReceiptItemGroupTranslationWhereUniqueInput[]
    update?: ReceiptItemGroupTranslationUpdateWithWhereUniqueWithoutItemGroupInput | ReceiptItemGroupTranslationUpdateWithWhereUniqueWithoutItemGroupInput[]
    updateMany?: ReceiptItemGroupTranslationUpdateManyWithWhereWithoutItemGroupInput | ReceiptItemGroupTranslationUpdateManyWithWhereWithoutItemGroupInput[]
    deleteMany?: ReceiptItemGroupTranslationScalarWhereInput | ReceiptItemGroupTranslationScalarWhereInput[]
  }

  export type ReceiptItemGroupCreateNestedOneWithoutItemsInput = {
    create?: XOR<ReceiptItemGroupCreateWithoutItemsInput, ReceiptItemGroupUncheckedCreateWithoutItemsInput>
    connectOrCreate?: ReceiptItemGroupCreateOrConnectWithoutItemsInput
    connect?: ReceiptItemGroupWhereUniqueInput
  }

  export type ReceiptItemSupplementCreateNestedManyWithoutItemInput = {
    create?: XOR<ReceiptItemSupplementCreateWithoutItemInput, ReceiptItemSupplementUncheckedCreateWithoutItemInput> | ReceiptItemSupplementCreateWithoutItemInput[] | ReceiptItemSupplementUncheckedCreateWithoutItemInput[]
    connectOrCreate?: ReceiptItemSupplementCreateOrConnectWithoutItemInput | ReceiptItemSupplementCreateOrConnectWithoutItemInput[]
    createMany?: ReceiptItemSupplementCreateManyItemInputEnvelope
    connect?: ReceiptItemSupplementWhereUniqueInput | ReceiptItemSupplementWhereUniqueInput[]
  }

  export type SmartReceiptPaymentCreateNestedManyWithoutItemInput = {
    create?: XOR<SmartReceiptPaymentCreateWithoutItemInput, SmartReceiptPaymentUncheckedCreateWithoutItemInput> | SmartReceiptPaymentCreateWithoutItemInput[] | SmartReceiptPaymentUncheckedCreateWithoutItemInput[]
    connectOrCreate?: SmartReceiptPaymentCreateOrConnectWithoutItemInput | SmartReceiptPaymentCreateOrConnectWithoutItemInput[]
    createMany?: SmartReceiptPaymentCreateManyItemInputEnvelope
    connect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
  }

  export type ReceiptItemSupplementUncheckedCreateNestedManyWithoutItemInput = {
    create?: XOR<ReceiptItemSupplementCreateWithoutItemInput, ReceiptItemSupplementUncheckedCreateWithoutItemInput> | ReceiptItemSupplementCreateWithoutItemInput[] | ReceiptItemSupplementUncheckedCreateWithoutItemInput[]
    connectOrCreate?: ReceiptItemSupplementCreateOrConnectWithoutItemInput | ReceiptItemSupplementCreateOrConnectWithoutItemInput[]
    createMany?: ReceiptItemSupplementCreateManyItemInputEnvelope
    connect?: ReceiptItemSupplementWhereUniqueInput | ReceiptItemSupplementWhereUniqueInput[]
  }

  export type SmartReceiptPaymentUncheckedCreateNestedManyWithoutItemInput = {
    create?: XOR<SmartReceiptPaymentCreateWithoutItemInput, SmartReceiptPaymentUncheckedCreateWithoutItemInput> | SmartReceiptPaymentCreateWithoutItemInput[] | SmartReceiptPaymentUncheckedCreateWithoutItemInput[]
    connectOrCreate?: SmartReceiptPaymentCreateOrConnectWithoutItemInput | SmartReceiptPaymentCreateOrConnectWithoutItemInput[]
    createMany?: SmartReceiptPaymentCreateManyItemInputEnvelope
    connect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
  }

  export type ReceiptItemGroupUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<ReceiptItemGroupCreateWithoutItemsInput, ReceiptItemGroupUncheckedCreateWithoutItemsInput>
    connectOrCreate?: ReceiptItemGroupCreateOrConnectWithoutItemsInput
    upsert?: ReceiptItemGroupUpsertWithoutItemsInput
    connect?: ReceiptItemGroupWhereUniqueInput
    update?: XOR<XOR<ReceiptItemGroupUpdateToOneWithWhereWithoutItemsInput, ReceiptItemGroupUpdateWithoutItemsInput>, ReceiptItemGroupUncheckedUpdateWithoutItemsInput>
  }

  export type ReceiptItemSupplementUpdateManyWithoutItemNestedInput = {
    create?: XOR<ReceiptItemSupplementCreateWithoutItemInput, ReceiptItemSupplementUncheckedCreateWithoutItemInput> | ReceiptItemSupplementCreateWithoutItemInput[] | ReceiptItemSupplementUncheckedCreateWithoutItemInput[]
    connectOrCreate?: ReceiptItemSupplementCreateOrConnectWithoutItemInput | ReceiptItemSupplementCreateOrConnectWithoutItemInput[]
    upsert?: ReceiptItemSupplementUpsertWithWhereUniqueWithoutItemInput | ReceiptItemSupplementUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: ReceiptItemSupplementCreateManyItemInputEnvelope
    set?: ReceiptItemSupplementWhereUniqueInput | ReceiptItemSupplementWhereUniqueInput[]
    disconnect?: ReceiptItemSupplementWhereUniqueInput | ReceiptItemSupplementWhereUniqueInput[]
    delete?: ReceiptItemSupplementWhereUniqueInput | ReceiptItemSupplementWhereUniqueInput[]
    connect?: ReceiptItemSupplementWhereUniqueInput | ReceiptItemSupplementWhereUniqueInput[]
    update?: ReceiptItemSupplementUpdateWithWhereUniqueWithoutItemInput | ReceiptItemSupplementUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: ReceiptItemSupplementUpdateManyWithWhereWithoutItemInput | ReceiptItemSupplementUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: ReceiptItemSupplementScalarWhereInput | ReceiptItemSupplementScalarWhereInput[]
  }

  export type SmartReceiptPaymentUpdateManyWithoutItemNestedInput = {
    create?: XOR<SmartReceiptPaymentCreateWithoutItemInput, SmartReceiptPaymentUncheckedCreateWithoutItemInput> | SmartReceiptPaymentCreateWithoutItemInput[] | SmartReceiptPaymentUncheckedCreateWithoutItemInput[]
    connectOrCreate?: SmartReceiptPaymentCreateOrConnectWithoutItemInput | SmartReceiptPaymentCreateOrConnectWithoutItemInput[]
    upsert?: SmartReceiptPaymentUpsertWithWhereUniqueWithoutItemInput | SmartReceiptPaymentUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: SmartReceiptPaymentCreateManyItemInputEnvelope
    set?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    disconnect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    delete?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    connect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    update?: SmartReceiptPaymentUpdateWithWhereUniqueWithoutItemInput | SmartReceiptPaymentUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: SmartReceiptPaymentUpdateManyWithWhereWithoutItemInput | SmartReceiptPaymentUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: SmartReceiptPaymentScalarWhereInput | SmartReceiptPaymentScalarWhereInput[]
  }

  export type ReceiptItemSupplementUncheckedUpdateManyWithoutItemNestedInput = {
    create?: XOR<ReceiptItemSupplementCreateWithoutItemInput, ReceiptItemSupplementUncheckedCreateWithoutItemInput> | ReceiptItemSupplementCreateWithoutItemInput[] | ReceiptItemSupplementUncheckedCreateWithoutItemInput[]
    connectOrCreate?: ReceiptItemSupplementCreateOrConnectWithoutItemInput | ReceiptItemSupplementCreateOrConnectWithoutItemInput[]
    upsert?: ReceiptItemSupplementUpsertWithWhereUniqueWithoutItemInput | ReceiptItemSupplementUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: ReceiptItemSupplementCreateManyItemInputEnvelope
    set?: ReceiptItemSupplementWhereUniqueInput | ReceiptItemSupplementWhereUniqueInput[]
    disconnect?: ReceiptItemSupplementWhereUniqueInput | ReceiptItemSupplementWhereUniqueInput[]
    delete?: ReceiptItemSupplementWhereUniqueInput | ReceiptItemSupplementWhereUniqueInput[]
    connect?: ReceiptItemSupplementWhereUniqueInput | ReceiptItemSupplementWhereUniqueInput[]
    update?: ReceiptItemSupplementUpdateWithWhereUniqueWithoutItemInput | ReceiptItemSupplementUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: ReceiptItemSupplementUpdateManyWithWhereWithoutItemInput | ReceiptItemSupplementUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: ReceiptItemSupplementScalarWhereInput | ReceiptItemSupplementScalarWhereInput[]
  }

  export type SmartReceiptPaymentUncheckedUpdateManyWithoutItemNestedInput = {
    create?: XOR<SmartReceiptPaymentCreateWithoutItemInput, SmartReceiptPaymentUncheckedCreateWithoutItemInput> | SmartReceiptPaymentCreateWithoutItemInput[] | SmartReceiptPaymentUncheckedCreateWithoutItemInput[]
    connectOrCreate?: SmartReceiptPaymentCreateOrConnectWithoutItemInput | SmartReceiptPaymentCreateOrConnectWithoutItemInput[]
    upsert?: SmartReceiptPaymentUpsertWithWhereUniqueWithoutItemInput | SmartReceiptPaymentUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: SmartReceiptPaymentCreateManyItemInputEnvelope
    set?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    disconnect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    delete?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    connect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    update?: SmartReceiptPaymentUpdateWithWhereUniqueWithoutItemInput | SmartReceiptPaymentUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: SmartReceiptPaymentUpdateManyWithWhereWithoutItemInput | SmartReceiptPaymentUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: SmartReceiptPaymentScalarWhereInput | SmartReceiptPaymentScalarWhereInput[]
  }

  export type ReceiptItemCreateNestedOneWithoutSupplementsInput = {
    create?: XOR<ReceiptItemCreateWithoutSupplementsInput, ReceiptItemUncheckedCreateWithoutSupplementsInput>
    connectOrCreate?: ReceiptItemCreateOrConnectWithoutSupplementsInput
    connect?: ReceiptItemWhereUniqueInput
  }

  export type ReceiptItemSupplementTranslationCreateNestedManyWithoutSupplementInput = {
    create?: XOR<ReceiptItemSupplementTranslationCreateWithoutSupplementInput, ReceiptItemSupplementTranslationUncheckedCreateWithoutSupplementInput> | ReceiptItemSupplementTranslationCreateWithoutSupplementInput[] | ReceiptItemSupplementTranslationUncheckedCreateWithoutSupplementInput[]
    connectOrCreate?: ReceiptItemSupplementTranslationCreateOrConnectWithoutSupplementInput | ReceiptItemSupplementTranslationCreateOrConnectWithoutSupplementInput[]
    createMany?: ReceiptItemSupplementTranslationCreateManySupplementInputEnvelope
    connect?: ReceiptItemSupplementTranslationWhereUniqueInput | ReceiptItemSupplementTranslationWhereUniqueInput[]
  }

  export type ReceiptItemSupplementTranslationUncheckedCreateNestedManyWithoutSupplementInput = {
    create?: XOR<ReceiptItemSupplementTranslationCreateWithoutSupplementInput, ReceiptItemSupplementTranslationUncheckedCreateWithoutSupplementInput> | ReceiptItemSupplementTranslationCreateWithoutSupplementInput[] | ReceiptItemSupplementTranslationUncheckedCreateWithoutSupplementInput[]
    connectOrCreate?: ReceiptItemSupplementTranslationCreateOrConnectWithoutSupplementInput | ReceiptItemSupplementTranslationCreateOrConnectWithoutSupplementInput[]
    createMany?: ReceiptItemSupplementTranslationCreateManySupplementInputEnvelope
    connect?: ReceiptItemSupplementTranslationWhereUniqueInput | ReceiptItemSupplementTranslationWhereUniqueInput[]
  }

  export type ReceiptItemUpdateOneRequiredWithoutSupplementsNestedInput = {
    create?: XOR<ReceiptItemCreateWithoutSupplementsInput, ReceiptItemUncheckedCreateWithoutSupplementsInput>
    connectOrCreate?: ReceiptItemCreateOrConnectWithoutSupplementsInput
    upsert?: ReceiptItemUpsertWithoutSupplementsInput
    connect?: ReceiptItemWhereUniqueInput
    update?: XOR<XOR<ReceiptItemUpdateToOneWithWhereWithoutSupplementsInput, ReceiptItemUpdateWithoutSupplementsInput>, ReceiptItemUncheckedUpdateWithoutSupplementsInput>
  }

  export type ReceiptItemSupplementTranslationUpdateManyWithoutSupplementNestedInput = {
    create?: XOR<ReceiptItemSupplementTranslationCreateWithoutSupplementInput, ReceiptItemSupplementTranslationUncheckedCreateWithoutSupplementInput> | ReceiptItemSupplementTranslationCreateWithoutSupplementInput[] | ReceiptItemSupplementTranslationUncheckedCreateWithoutSupplementInput[]
    connectOrCreate?: ReceiptItemSupplementTranslationCreateOrConnectWithoutSupplementInput | ReceiptItemSupplementTranslationCreateOrConnectWithoutSupplementInput[]
    upsert?: ReceiptItemSupplementTranslationUpsertWithWhereUniqueWithoutSupplementInput | ReceiptItemSupplementTranslationUpsertWithWhereUniqueWithoutSupplementInput[]
    createMany?: ReceiptItemSupplementTranslationCreateManySupplementInputEnvelope
    set?: ReceiptItemSupplementTranslationWhereUniqueInput | ReceiptItemSupplementTranslationWhereUniqueInput[]
    disconnect?: ReceiptItemSupplementTranslationWhereUniqueInput | ReceiptItemSupplementTranslationWhereUniqueInput[]
    delete?: ReceiptItemSupplementTranslationWhereUniqueInput | ReceiptItemSupplementTranslationWhereUniqueInput[]
    connect?: ReceiptItemSupplementTranslationWhereUniqueInput | ReceiptItemSupplementTranslationWhereUniqueInput[]
    update?: ReceiptItemSupplementTranslationUpdateWithWhereUniqueWithoutSupplementInput | ReceiptItemSupplementTranslationUpdateWithWhereUniqueWithoutSupplementInput[]
    updateMany?: ReceiptItemSupplementTranslationUpdateManyWithWhereWithoutSupplementInput | ReceiptItemSupplementTranslationUpdateManyWithWhereWithoutSupplementInput[]
    deleteMany?: ReceiptItemSupplementTranslationScalarWhereInput | ReceiptItemSupplementTranslationScalarWhereInput[]
  }

  export type ReceiptItemSupplementTranslationUncheckedUpdateManyWithoutSupplementNestedInput = {
    create?: XOR<ReceiptItemSupplementTranslationCreateWithoutSupplementInput, ReceiptItemSupplementTranslationUncheckedCreateWithoutSupplementInput> | ReceiptItemSupplementTranslationCreateWithoutSupplementInput[] | ReceiptItemSupplementTranslationUncheckedCreateWithoutSupplementInput[]
    connectOrCreate?: ReceiptItemSupplementTranslationCreateOrConnectWithoutSupplementInput | ReceiptItemSupplementTranslationCreateOrConnectWithoutSupplementInput[]
    upsert?: ReceiptItemSupplementTranslationUpsertWithWhereUniqueWithoutSupplementInput | ReceiptItemSupplementTranslationUpsertWithWhereUniqueWithoutSupplementInput[]
    createMany?: ReceiptItemSupplementTranslationCreateManySupplementInputEnvelope
    set?: ReceiptItemSupplementTranslationWhereUniqueInput | ReceiptItemSupplementTranslationWhereUniqueInput[]
    disconnect?: ReceiptItemSupplementTranslationWhereUniqueInput | ReceiptItemSupplementTranslationWhereUniqueInput[]
    delete?: ReceiptItemSupplementTranslationWhereUniqueInput | ReceiptItemSupplementTranslationWhereUniqueInput[]
    connect?: ReceiptItemSupplementTranslationWhereUniqueInput | ReceiptItemSupplementTranslationWhereUniqueInput[]
    update?: ReceiptItemSupplementTranslationUpdateWithWhereUniqueWithoutSupplementInput | ReceiptItemSupplementTranslationUpdateWithWhereUniqueWithoutSupplementInput[]
    updateMany?: ReceiptItemSupplementTranslationUpdateManyWithWhereWithoutSupplementInput | ReceiptItemSupplementTranslationUpdateManyWithWhereWithoutSupplementInput[]
    deleteMany?: ReceiptItemSupplementTranslationScalarWhereInput | ReceiptItemSupplementTranslationScalarWhereInput[]
  }

  export type ReceiptItemGroupCreateNestedOneWithoutTranslationsInput = {
    create?: XOR<ReceiptItemGroupCreateWithoutTranslationsInput, ReceiptItemGroupUncheckedCreateWithoutTranslationsInput>
    connectOrCreate?: ReceiptItemGroupCreateOrConnectWithoutTranslationsInput
    connect?: ReceiptItemGroupWhereUniqueInput
  }

  export type ReceiptItemGroupUpdateOneRequiredWithoutTranslationsNestedInput = {
    create?: XOR<ReceiptItemGroupCreateWithoutTranslationsInput, ReceiptItemGroupUncheckedCreateWithoutTranslationsInput>
    connectOrCreate?: ReceiptItemGroupCreateOrConnectWithoutTranslationsInput
    upsert?: ReceiptItemGroupUpsertWithoutTranslationsInput
    connect?: ReceiptItemGroupWhereUniqueInput
    update?: XOR<XOR<ReceiptItemGroupUpdateToOneWithWhereWithoutTranslationsInput, ReceiptItemGroupUpdateWithoutTranslationsInput>, ReceiptItemGroupUncheckedUpdateWithoutTranslationsInput>
  }

  export type ReceiptItemSupplementCreateNestedOneWithoutTranslationsInput = {
    create?: XOR<ReceiptItemSupplementCreateWithoutTranslationsInput, ReceiptItemSupplementUncheckedCreateWithoutTranslationsInput>
    connectOrCreate?: ReceiptItemSupplementCreateOrConnectWithoutTranslationsInput
    connect?: ReceiptItemSupplementWhereUniqueInput
  }

  export type ReceiptItemSupplementUpdateOneRequiredWithoutTranslationsNestedInput = {
    create?: XOR<ReceiptItemSupplementCreateWithoutTranslationsInput, ReceiptItemSupplementUncheckedCreateWithoutTranslationsInput>
    connectOrCreate?: ReceiptItemSupplementCreateOrConnectWithoutTranslationsInput
    upsert?: ReceiptItemSupplementUpsertWithoutTranslationsInput
    connect?: ReceiptItemSupplementWhereUniqueInput
    update?: XOR<XOR<ReceiptItemSupplementUpdateToOneWithWhereWithoutTranslationsInput, ReceiptItemSupplementUpdateWithoutTranslationsInput>, ReceiptItemSupplementUncheckedUpdateWithoutTranslationsInput>
  }

  export type ReceiptCreateNestedOneWithoutSmartReceiptsInput = {
    create?: XOR<ReceiptCreateWithoutSmartReceiptsInput, ReceiptUncheckedCreateWithoutSmartReceiptsInput>
    connectOrCreate?: ReceiptCreateOrConnectWithoutSmartReceiptsInput
    connect?: ReceiptWhereUniqueInput
  }

  export type UserCreateNestedManyWithoutSmartReceiptsInput = {
    create?: XOR<UserCreateWithoutSmartReceiptsInput, UserUncheckedCreateWithoutSmartReceiptsInput> | UserCreateWithoutSmartReceiptsInput[] | UserUncheckedCreateWithoutSmartReceiptsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutSmartReceiptsInput | UserCreateOrConnectWithoutSmartReceiptsInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type SmartReceiptPaymentCreateNestedManyWithoutSmartReceiptInput = {
    create?: XOR<SmartReceiptPaymentCreateWithoutSmartReceiptInput, SmartReceiptPaymentUncheckedCreateWithoutSmartReceiptInput> | SmartReceiptPaymentCreateWithoutSmartReceiptInput[] | SmartReceiptPaymentUncheckedCreateWithoutSmartReceiptInput[]
    connectOrCreate?: SmartReceiptPaymentCreateOrConnectWithoutSmartReceiptInput | SmartReceiptPaymentCreateOrConnectWithoutSmartReceiptInput[]
    createMany?: SmartReceiptPaymentCreateManySmartReceiptInputEnvelope
    connect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutSmartReceiptsInput = {
    create?: XOR<UserCreateWithoutSmartReceiptsInput, UserUncheckedCreateWithoutSmartReceiptsInput> | UserCreateWithoutSmartReceiptsInput[] | UserUncheckedCreateWithoutSmartReceiptsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutSmartReceiptsInput | UserCreateOrConnectWithoutSmartReceiptsInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type SmartReceiptPaymentUncheckedCreateNestedManyWithoutSmartReceiptInput = {
    create?: XOR<SmartReceiptPaymentCreateWithoutSmartReceiptInput, SmartReceiptPaymentUncheckedCreateWithoutSmartReceiptInput> | SmartReceiptPaymentCreateWithoutSmartReceiptInput[] | SmartReceiptPaymentUncheckedCreateWithoutSmartReceiptInput[]
    connectOrCreate?: SmartReceiptPaymentCreateOrConnectWithoutSmartReceiptInput | SmartReceiptPaymentCreateOrConnectWithoutSmartReceiptInput[]
    createMany?: SmartReceiptPaymentCreateManySmartReceiptInputEnvelope
    connect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ReceiptUpdateOneRequiredWithoutSmartReceiptsNestedInput = {
    create?: XOR<ReceiptCreateWithoutSmartReceiptsInput, ReceiptUncheckedCreateWithoutSmartReceiptsInput>
    connectOrCreate?: ReceiptCreateOrConnectWithoutSmartReceiptsInput
    upsert?: ReceiptUpsertWithoutSmartReceiptsInput
    connect?: ReceiptWhereUniqueInput
    update?: XOR<XOR<ReceiptUpdateToOneWithWhereWithoutSmartReceiptsInput, ReceiptUpdateWithoutSmartReceiptsInput>, ReceiptUncheckedUpdateWithoutSmartReceiptsInput>
  }

  export type UserUpdateManyWithoutSmartReceiptsNestedInput = {
    create?: XOR<UserCreateWithoutSmartReceiptsInput, UserUncheckedCreateWithoutSmartReceiptsInput> | UserCreateWithoutSmartReceiptsInput[] | UserUncheckedCreateWithoutSmartReceiptsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutSmartReceiptsInput | UserCreateOrConnectWithoutSmartReceiptsInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutSmartReceiptsInput | UserUpsertWithWhereUniqueWithoutSmartReceiptsInput[]
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutSmartReceiptsInput | UserUpdateWithWhereUniqueWithoutSmartReceiptsInput[]
    updateMany?: UserUpdateManyWithWhereWithoutSmartReceiptsInput | UserUpdateManyWithWhereWithoutSmartReceiptsInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type SmartReceiptPaymentUpdateManyWithoutSmartReceiptNestedInput = {
    create?: XOR<SmartReceiptPaymentCreateWithoutSmartReceiptInput, SmartReceiptPaymentUncheckedCreateWithoutSmartReceiptInput> | SmartReceiptPaymentCreateWithoutSmartReceiptInput[] | SmartReceiptPaymentUncheckedCreateWithoutSmartReceiptInput[]
    connectOrCreate?: SmartReceiptPaymentCreateOrConnectWithoutSmartReceiptInput | SmartReceiptPaymentCreateOrConnectWithoutSmartReceiptInput[]
    upsert?: SmartReceiptPaymentUpsertWithWhereUniqueWithoutSmartReceiptInput | SmartReceiptPaymentUpsertWithWhereUniqueWithoutSmartReceiptInput[]
    createMany?: SmartReceiptPaymentCreateManySmartReceiptInputEnvelope
    set?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    disconnect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    delete?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    connect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    update?: SmartReceiptPaymentUpdateWithWhereUniqueWithoutSmartReceiptInput | SmartReceiptPaymentUpdateWithWhereUniqueWithoutSmartReceiptInput[]
    updateMany?: SmartReceiptPaymentUpdateManyWithWhereWithoutSmartReceiptInput | SmartReceiptPaymentUpdateManyWithWhereWithoutSmartReceiptInput[]
    deleteMany?: SmartReceiptPaymentScalarWhereInput | SmartReceiptPaymentScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutSmartReceiptsNestedInput = {
    create?: XOR<UserCreateWithoutSmartReceiptsInput, UserUncheckedCreateWithoutSmartReceiptsInput> | UserCreateWithoutSmartReceiptsInput[] | UserUncheckedCreateWithoutSmartReceiptsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutSmartReceiptsInput | UserCreateOrConnectWithoutSmartReceiptsInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutSmartReceiptsInput | UserUpsertWithWhereUniqueWithoutSmartReceiptsInput[]
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutSmartReceiptsInput | UserUpdateWithWhereUniqueWithoutSmartReceiptsInput[]
    updateMany?: UserUpdateManyWithWhereWithoutSmartReceiptsInput | UserUpdateManyWithWhereWithoutSmartReceiptsInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type SmartReceiptPaymentUncheckedUpdateManyWithoutSmartReceiptNestedInput = {
    create?: XOR<SmartReceiptPaymentCreateWithoutSmartReceiptInput, SmartReceiptPaymentUncheckedCreateWithoutSmartReceiptInput> | SmartReceiptPaymentCreateWithoutSmartReceiptInput[] | SmartReceiptPaymentUncheckedCreateWithoutSmartReceiptInput[]
    connectOrCreate?: SmartReceiptPaymentCreateOrConnectWithoutSmartReceiptInput | SmartReceiptPaymentCreateOrConnectWithoutSmartReceiptInput[]
    upsert?: SmartReceiptPaymentUpsertWithWhereUniqueWithoutSmartReceiptInput | SmartReceiptPaymentUpsertWithWhereUniqueWithoutSmartReceiptInput[]
    createMany?: SmartReceiptPaymentCreateManySmartReceiptInputEnvelope
    set?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    disconnect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    delete?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    connect?: SmartReceiptPaymentWhereUniqueInput | SmartReceiptPaymentWhereUniqueInput[]
    update?: SmartReceiptPaymentUpdateWithWhereUniqueWithoutSmartReceiptInput | SmartReceiptPaymentUpdateWithWhereUniqueWithoutSmartReceiptInput[]
    updateMany?: SmartReceiptPaymentUpdateManyWithWhereWithoutSmartReceiptInput | SmartReceiptPaymentUpdateManyWithWhereWithoutSmartReceiptInput[]
    deleteMany?: SmartReceiptPaymentScalarWhereInput | SmartReceiptPaymentScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutPaymentsInput = {
    create?: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPaymentsInput
    connect?: UserWhereUniqueInput
  }

  export type SmartReceiptCreateNestedOneWithoutPaymentsInput = {
    create?: XOR<SmartReceiptCreateWithoutPaymentsInput, SmartReceiptUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: SmartReceiptCreateOrConnectWithoutPaymentsInput
    connect?: SmartReceiptWhereUniqueInput
  }

  export type ReceiptItemCreateNestedOneWithoutSmartPaymentsInput = {
    create?: XOR<ReceiptItemCreateWithoutSmartPaymentsInput, ReceiptItemUncheckedCreateWithoutSmartPaymentsInput>
    connectOrCreate?: ReceiptItemCreateOrConnectWithoutSmartPaymentsInput
    connect?: ReceiptItemWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutPaymentsNestedInput = {
    create?: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPaymentsInput
    upsert?: UserUpsertWithoutPaymentsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPaymentsInput, UserUpdateWithoutPaymentsInput>, UserUncheckedUpdateWithoutPaymentsInput>
  }

  export type SmartReceiptUpdateOneWithoutPaymentsNestedInput = {
    create?: XOR<SmartReceiptCreateWithoutPaymentsInput, SmartReceiptUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: SmartReceiptCreateOrConnectWithoutPaymentsInput
    upsert?: SmartReceiptUpsertWithoutPaymentsInput
    disconnect?: SmartReceiptWhereInput | boolean
    delete?: SmartReceiptWhereInput | boolean
    connect?: SmartReceiptWhereUniqueInput
    update?: XOR<XOR<SmartReceiptUpdateToOneWithWhereWithoutPaymentsInput, SmartReceiptUpdateWithoutPaymentsInput>, SmartReceiptUncheckedUpdateWithoutPaymentsInput>
  }

  export type ReceiptItemUpdateOneRequiredWithoutSmartPaymentsNestedInput = {
    create?: XOR<ReceiptItemCreateWithoutSmartPaymentsInput, ReceiptItemUncheckedCreateWithoutSmartPaymentsInput>
    connectOrCreate?: ReceiptItemCreateOrConnectWithoutSmartPaymentsInput
    upsert?: ReceiptItemUpsertWithoutSmartPaymentsInput
    connect?: ReceiptItemWhereUniqueInput
    update?: XOR<XOR<ReceiptItemUpdateToOneWithWhereWithoutSmartPaymentsInput, ReceiptItemUpdateWithoutSmartPaymentsInput>, ReceiptItemUncheckedUpdateWithoutSmartPaymentsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type ReceiptCreateWithoutCreatedByInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    merchantName: string
    receiptType?: string | null
    receiptDate?: Date | string | null
    totalPrice: number
    currencyCode?: string | null
    itemGroups?: ReceiptItemGroupCreateNestedManyWithoutReceiptInput
    smartReceipts?: SmartReceiptCreateNestedManyWithoutReceiptInput
  }

  export type ReceiptUncheckedCreateWithoutCreatedByInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    merchantName: string
    receiptType?: string | null
    receiptDate?: Date | string | null
    totalPrice: number
    currencyCode?: string | null
    itemGroups?: ReceiptItemGroupUncheckedCreateNestedManyWithoutReceiptInput
    smartReceipts?: SmartReceiptUncheckedCreateNestedManyWithoutReceiptInput
  }

  export type ReceiptCreateOrConnectWithoutCreatedByInput = {
    where: ReceiptWhereUniqueInput
    create: XOR<ReceiptCreateWithoutCreatedByInput, ReceiptUncheckedCreateWithoutCreatedByInput>
  }

  export type ReceiptCreateManyCreatedByInputEnvelope = {
    data: ReceiptCreateManyCreatedByInput | ReceiptCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type SmartReceiptPaymentCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    smartReceipt?: SmartReceiptCreateNestedOneWithoutPaymentsInput
    item: ReceiptItemCreateNestedOneWithoutSmartPaymentsInput
  }

  export type SmartReceiptPaymentUncheckedCreateWithoutUserInput = {
    id?: string
    smartReceiptId: string
    receiptItemId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SmartReceiptPaymentCreateOrConnectWithoutUserInput = {
    where: SmartReceiptPaymentWhereUniqueInput
    create: XOR<SmartReceiptPaymentCreateWithoutUserInput, SmartReceiptPaymentUncheckedCreateWithoutUserInput>
  }

  export type SmartReceiptPaymentCreateManyUserInputEnvelope = {
    data: SmartReceiptPaymentCreateManyUserInput | SmartReceiptPaymentCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SmartReceiptCreateWithoutUsersInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedTotalPrice?: number | null
    updatedCurrencyCode?: string | null
    receipt: ReceiptCreateNestedOneWithoutSmartReceiptsInput
    payments?: SmartReceiptPaymentCreateNestedManyWithoutSmartReceiptInput
  }

  export type SmartReceiptUncheckedCreateWithoutUsersInput = {
    id?: string
    receiptId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedTotalPrice?: number | null
    updatedCurrencyCode?: string | null
    payments?: SmartReceiptPaymentUncheckedCreateNestedManyWithoutSmartReceiptInput
  }

  export type SmartReceiptCreateOrConnectWithoutUsersInput = {
    where: SmartReceiptWhereUniqueInput
    create: XOR<SmartReceiptCreateWithoutUsersInput, SmartReceiptUncheckedCreateWithoutUsersInput>
  }

  export type ReceiptUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: ReceiptWhereUniqueInput
    update: XOR<ReceiptUpdateWithoutCreatedByInput, ReceiptUncheckedUpdateWithoutCreatedByInput>
    create: XOR<ReceiptCreateWithoutCreatedByInput, ReceiptUncheckedCreateWithoutCreatedByInput>
  }

  export type ReceiptUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: ReceiptWhereUniqueInput
    data: XOR<ReceiptUpdateWithoutCreatedByInput, ReceiptUncheckedUpdateWithoutCreatedByInput>
  }

  export type ReceiptUpdateManyWithWhereWithoutCreatedByInput = {
    where: ReceiptScalarWhereInput
    data: XOR<ReceiptUpdateManyMutationInput, ReceiptUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type ReceiptScalarWhereInput = {
    AND?: ReceiptScalarWhereInput | ReceiptScalarWhereInput[]
    OR?: ReceiptScalarWhereInput[]
    NOT?: ReceiptScalarWhereInput | ReceiptScalarWhereInput[]
    id?: StringFilter<"Receipt"> | string
    userId?: StringFilter<"Receipt"> | string
    createdAt?: DateTimeFilter<"Receipt"> | Date | string
    updatedAt?: DateTimeFilter<"Receipt"> | Date | string
    merchantName?: StringFilter<"Receipt"> | string
    receiptType?: StringNullableFilter<"Receipt"> | string | null
    receiptDate?: DateTimeNullableFilter<"Receipt"> | Date | string | null
    totalPrice?: FloatFilter<"Receipt"> | number
    currencyCode?: StringNullableFilter<"Receipt"> | string | null
  }

  export type SmartReceiptPaymentUpsertWithWhereUniqueWithoutUserInput = {
    where: SmartReceiptPaymentWhereUniqueInput
    update: XOR<SmartReceiptPaymentUpdateWithoutUserInput, SmartReceiptPaymentUncheckedUpdateWithoutUserInput>
    create: XOR<SmartReceiptPaymentCreateWithoutUserInput, SmartReceiptPaymentUncheckedCreateWithoutUserInput>
  }

  export type SmartReceiptPaymentUpdateWithWhereUniqueWithoutUserInput = {
    where: SmartReceiptPaymentWhereUniqueInput
    data: XOR<SmartReceiptPaymentUpdateWithoutUserInput, SmartReceiptPaymentUncheckedUpdateWithoutUserInput>
  }

  export type SmartReceiptPaymentUpdateManyWithWhereWithoutUserInput = {
    where: SmartReceiptPaymentScalarWhereInput
    data: XOR<SmartReceiptPaymentUpdateManyMutationInput, SmartReceiptPaymentUncheckedUpdateManyWithoutUserInput>
  }

  export type SmartReceiptPaymentScalarWhereInput = {
    AND?: SmartReceiptPaymentScalarWhereInput | SmartReceiptPaymentScalarWhereInput[]
    OR?: SmartReceiptPaymentScalarWhereInput[]
    NOT?: SmartReceiptPaymentScalarWhereInput | SmartReceiptPaymentScalarWhereInput[]
    id?: StringFilter<"SmartReceiptPayment"> | string
    userId?: StringFilter<"SmartReceiptPayment"> | string
    smartReceiptId?: StringFilter<"SmartReceiptPayment"> | string
    receiptItemId?: StringFilter<"SmartReceiptPayment"> | string
    createdAt?: DateTimeFilter<"SmartReceiptPayment"> | Date | string
    updatedAt?: DateTimeFilter<"SmartReceiptPayment"> | Date | string
  }

  export type SmartReceiptUpsertWithWhereUniqueWithoutUsersInput = {
    where: SmartReceiptWhereUniqueInput
    update: XOR<SmartReceiptUpdateWithoutUsersInput, SmartReceiptUncheckedUpdateWithoutUsersInput>
    create: XOR<SmartReceiptCreateWithoutUsersInput, SmartReceiptUncheckedCreateWithoutUsersInput>
  }

  export type SmartReceiptUpdateWithWhereUniqueWithoutUsersInput = {
    where: SmartReceiptWhereUniqueInput
    data: XOR<SmartReceiptUpdateWithoutUsersInput, SmartReceiptUncheckedUpdateWithoutUsersInput>
  }

  export type SmartReceiptUpdateManyWithWhereWithoutUsersInput = {
    where: SmartReceiptScalarWhereInput
    data: XOR<SmartReceiptUpdateManyMutationInput, SmartReceiptUncheckedUpdateManyWithoutUsersInput>
  }

  export type SmartReceiptScalarWhereInput = {
    AND?: SmartReceiptScalarWhereInput | SmartReceiptScalarWhereInput[]
    OR?: SmartReceiptScalarWhereInput[]
    NOT?: SmartReceiptScalarWhereInput | SmartReceiptScalarWhereInput[]
    id?: StringFilter<"SmartReceipt"> | string
    receiptId?: StringFilter<"SmartReceipt"> | string
    createdAt?: DateTimeFilter<"SmartReceipt"> | Date | string
    updatedAt?: DateTimeFilter<"SmartReceipt"> | Date | string
    updatedTotalPrice?: FloatNullableFilter<"SmartReceipt"> | number | null
    updatedCurrencyCode?: StringNullableFilter<"SmartReceipt"> | string | null
  }

  export type UserCreateWithoutReceiptsInput = {
    id: string
    email: string
    createdAt?: Date | string
    avatarUrl?: string | null
    admin?: boolean
    payments?: SmartReceiptPaymentCreateNestedManyWithoutUserInput
    smartReceipts?: SmartReceiptCreateNestedManyWithoutUsersInput
  }

  export type UserUncheckedCreateWithoutReceiptsInput = {
    id: string
    email: string
    createdAt?: Date | string
    avatarUrl?: string | null
    admin?: boolean
    payments?: SmartReceiptPaymentUncheckedCreateNestedManyWithoutUserInput
    smartReceipts?: SmartReceiptUncheckedCreateNestedManyWithoutUsersInput
  }

  export type UserCreateOrConnectWithoutReceiptsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutReceiptsInput, UserUncheckedCreateWithoutReceiptsInput>
  }

  export type ReceiptItemGroupCreateWithoutReceiptInput = {
    id?: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    quantity: number
    quantityUnit?: string | null
    unitPrice: number
    items?: ReceiptItemCreateNestedManyWithoutItemGroupInput
    translations?: ReceiptItemGroupTranslationCreateNestedManyWithoutItemGroupInput
  }

  export type ReceiptItemGroupUncheckedCreateWithoutReceiptInput = {
    id?: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    quantity: number
    quantityUnit?: string | null
    unitPrice: number
    items?: ReceiptItemUncheckedCreateNestedManyWithoutItemGroupInput
    translations?: ReceiptItemGroupTranslationUncheckedCreateNestedManyWithoutItemGroupInput
  }

  export type ReceiptItemGroupCreateOrConnectWithoutReceiptInput = {
    where: ReceiptItemGroupWhereUniqueInput
    create: XOR<ReceiptItemGroupCreateWithoutReceiptInput, ReceiptItemGroupUncheckedCreateWithoutReceiptInput>
  }

  export type ReceiptItemGroupCreateManyReceiptInputEnvelope = {
    data: ReceiptItemGroupCreateManyReceiptInput | ReceiptItemGroupCreateManyReceiptInput[]
    skipDuplicates?: boolean
  }

  export type SmartReceiptCreateWithoutReceiptInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedTotalPrice?: number | null
    updatedCurrencyCode?: string | null
    users?: UserCreateNestedManyWithoutSmartReceiptsInput
    payments?: SmartReceiptPaymentCreateNestedManyWithoutSmartReceiptInput
  }

  export type SmartReceiptUncheckedCreateWithoutReceiptInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedTotalPrice?: number | null
    updatedCurrencyCode?: string | null
    users?: UserUncheckedCreateNestedManyWithoutSmartReceiptsInput
    payments?: SmartReceiptPaymentUncheckedCreateNestedManyWithoutSmartReceiptInput
  }

  export type SmartReceiptCreateOrConnectWithoutReceiptInput = {
    where: SmartReceiptWhereUniqueInput
    create: XOR<SmartReceiptCreateWithoutReceiptInput, SmartReceiptUncheckedCreateWithoutReceiptInput>
  }

  export type SmartReceiptCreateManyReceiptInputEnvelope = {
    data: SmartReceiptCreateManyReceiptInput | SmartReceiptCreateManyReceiptInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutReceiptsInput = {
    update: XOR<UserUpdateWithoutReceiptsInput, UserUncheckedUpdateWithoutReceiptsInput>
    create: XOR<UserCreateWithoutReceiptsInput, UserUncheckedCreateWithoutReceiptsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutReceiptsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutReceiptsInput, UserUncheckedUpdateWithoutReceiptsInput>
  }

  export type UserUpdateWithoutReceiptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    admin?: BoolFieldUpdateOperationsInput | boolean
    payments?: SmartReceiptPaymentUpdateManyWithoutUserNestedInput
    smartReceipts?: SmartReceiptUpdateManyWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateWithoutReceiptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    admin?: BoolFieldUpdateOperationsInput | boolean
    payments?: SmartReceiptPaymentUncheckedUpdateManyWithoutUserNestedInput
    smartReceipts?: SmartReceiptUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type ReceiptItemGroupUpsertWithWhereUniqueWithoutReceiptInput = {
    where: ReceiptItemGroupWhereUniqueInput
    update: XOR<ReceiptItemGroupUpdateWithoutReceiptInput, ReceiptItemGroupUncheckedUpdateWithoutReceiptInput>
    create: XOR<ReceiptItemGroupCreateWithoutReceiptInput, ReceiptItemGroupUncheckedCreateWithoutReceiptInput>
  }

  export type ReceiptItemGroupUpdateWithWhereUniqueWithoutReceiptInput = {
    where: ReceiptItemGroupWhereUniqueInput
    data: XOR<ReceiptItemGroupUpdateWithoutReceiptInput, ReceiptItemGroupUncheckedUpdateWithoutReceiptInput>
  }

  export type ReceiptItemGroupUpdateManyWithWhereWithoutReceiptInput = {
    where: ReceiptItemGroupScalarWhereInput
    data: XOR<ReceiptItemGroupUpdateManyMutationInput, ReceiptItemGroupUncheckedUpdateManyWithoutReceiptInput>
  }

  export type ReceiptItemGroupScalarWhereInput = {
    AND?: ReceiptItemGroupScalarWhereInput | ReceiptItemGroupScalarWhereInput[]
    OR?: ReceiptItemGroupScalarWhereInput[]
    NOT?: ReceiptItemGroupScalarWhereInput | ReceiptItemGroupScalarWhereInput[]
    id?: StringFilter<"ReceiptItemGroup"> | string
    receiptId?: StringFilter<"ReceiptItemGroup"> | string
    description?: StringFilter<"ReceiptItemGroup"> | string
    price?: FloatFilter<"ReceiptItemGroup"> | number
    createdAt?: DateTimeFilter<"ReceiptItemGroup"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItemGroup"> | Date | string
    quantity?: FloatFilter<"ReceiptItemGroup"> | number
    quantityUnit?: StringNullableFilter<"ReceiptItemGroup"> | string | null
    unitPrice?: FloatFilter<"ReceiptItemGroup"> | number
  }

  export type SmartReceiptUpsertWithWhereUniqueWithoutReceiptInput = {
    where: SmartReceiptWhereUniqueInput
    update: XOR<SmartReceiptUpdateWithoutReceiptInput, SmartReceiptUncheckedUpdateWithoutReceiptInput>
    create: XOR<SmartReceiptCreateWithoutReceiptInput, SmartReceiptUncheckedCreateWithoutReceiptInput>
  }

  export type SmartReceiptUpdateWithWhereUniqueWithoutReceiptInput = {
    where: SmartReceiptWhereUniqueInput
    data: XOR<SmartReceiptUpdateWithoutReceiptInput, SmartReceiptUncheckedUpdateWithoutReceiptInput>
  }

  export type SmartReceiptUpdateManyWithWhereWithoutReceiptInput = {
    where: SmartReceiptScalarWhereInput
    data: XOR<SmartReceiptUpdateManyMutationInput, SmartReceiptUncheckedUpdateManyWithoutReceiptInput>
  }

  export type ReceiptCreateWithoutItemGroupsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    merchantName: string
    receiptType?: string | null
    receiptDate?: Date | string | null
    totalPrice: number
    currencyCode?: string | null
    createdBy: UserCreateNestedOneWithoutReceiptsInput
    smartReceipts?: SmartReceiptCreateNestedManyWithoutReceiptInput
  }

  export type ReceiptUncheckedCreateWithoutItemGroupsInput = {
    id?: string
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    merchantName: string
    receiptType?: string | null
    receiptDate?: Date | string | null
    totalPrice: number
    currencyCode?: string | null
    smartReceipts?: SmartReceiptUncheckedCreateNestedManyWithoutReceiptInput
  }

  export type ReceiptCreateOrConnectWithoutItemGroupsInput = {
    where: ReceiptWhereUniqueInput
    create: XOR<ReceiptCreateWithoutItemGroupsInput, ReceiptUncheckedCreateWithoutItemGroupsInput>
  }

  export type ReceiptItemCreateWithoutItemGroupInput = {
    id?: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    supplements?: ReceiptItemSupplementCreateNestedManyWithoutItemInput
    smartPayments?: SmartReceiptPaymentCreateNestedManyWithoutItemInput
  }

  export type ReceiptItemUncheckedCreateWithoutItemGroupInput = {
    id?: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    supplements?: ReceiptItemSupplementUncheckedCreateNestedManyWithoutItemInput
    smartPayments?: SmartReceiptPaymentUncheckedCreateNestedManyWithoutItemInput
  }

  export type ReceiptItemCreateOrConnectWithoutItemGroupInput = {
    where: ReceiptItemWhereUniqueInput
    create: XOR<ReceiptItemCreateWithoutItemGroupInput, ReceiptItemUncheckedCreateWithoutItemGroupInput>
  }

  export type ReceiptItemCreateManyItemGroupInputEnvelope = {
    data: ReceiptItemCreateManyItemGroupInput | ReceiptItemCreateManyItemGroupInput[]
    skipDuplicates?: boolean
  }

  export type ReceiptItemGroupTranslationCreateWithoutItemGroupInput = {
    id?: string
    label: string
    description: string
    language: string
    lightModeLabelHexColor: string
    darkModeLabelHexColor: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemGroupTranslationUncheckedCreateWithoutItemGroupInput = {
    id?: string
    label: string
    description: string
    language: string
    lightModeLabelHexColor: string
    darkModeLabelHexColor: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemGroupTranslationCreateOrConnectWithoutItemGroupInput = {
    where: ReceiptItemGroupTranslationWhereUniqueInput
    create: XOR<ReceiptItemGroupTranslationCreateWithoutItemGroupInput, ReceiptItemGroupTranslationUncheckedCreateWithoutItemGroupInput>
  }

  export type ReceiptItemGroupTranslationCreateManyItemGroupInputEnvelope = {
    data: ReceiptItemGroupTranslationCreateManyItemGroupInput | ReceiptItemGroupTranslationCreateManyItemGroupInput[]
    skipDuplicates?: boolean
  }

  export type ReceiptUpsertWithoutItemGroupsInput = {
    update: XOR<ReceiptUpdateWithoutItemGroupsInput, ReceiptUncheckedUpdateWithoutItemGroupsInput>
    create: XOR<ReceiptCreateWithoutItemGroupsInput, ReceiptUncheckedCreateWithoutItemGroupsInput>
    where?: ReceiptWhereInput
  }

  export type ReceiptUpdateToOneWithWhereWithoutItemGroupsInput = {
    where?: ReceiptWhereInput
    data: XOR<ReceiptUpdateWithoutItemGroupsInput, ReceiptUncheckedUpdateWithoutItemGroupsInput>
  }

  export type ReceiptUpdateWithoutItemGroupsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    merchantName?: StringFieldUpdateOperationsInput | string
    receiptType?: NullableStringFieldUpdateOperationsInput | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPrice?: FloatFieldUpdateOperationsInput | number
    currencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: UserUpdateOneRequiredWithoutReceiptsNestedInput
    smartReceipts?: SmartReceiptUpdateManyWithoutReceiptNestedInput
  }

  export type ReceiptUncheckedUpdateWithoutItemGroupsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    merchantName?: StringFieldUpdateOperationsInput | string
    receiptType?: NullableStringFieldUpdateOperationsInput | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPrice?: FloatFieldUpdateOperationsInput | number
    currencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    smartReceipts?: SmartReceiptUncheckedUpdateManyWithoutReceiptNestedInput
  }

  export type ReceiptItemUpsertWithWhereUniqueWithoutItemGroupInput = {
    where: ReceiptItemWhereUniqueInput
    update: XOR<ReceiptItemUpdateWithoutItemGroupInput, ReceiptItemUncheckedUpdateWithoutItemGroupInput>
    create: XOR<ReceiptItemCreateWithoutItemGroupInput, ReceiptItemUncheckedCreateWithoutItemGroupInput>
  }

  export type ReceiptItemUpdateWithWhereUniqueWithoutItemGroupInput = {
    where: ReceiptItemWhereUniqueInput
    data: XOR<ReceiptItemUpdateWithoutItemGroupInput, ReceiptItemUncheckedUpdateWithoutItemGroupInput>
  }

  export type ReceiptItemUpdateManyWithWhereWithoutItemGroupInput = {
    where: ReceiptItemScalarWhereInput
    data: XOR<ReceiptItemUpdateManyMutationInput, ReceiptItemUncheckedUpdateManyWithoutItemGroupInput>
  }

  export type ReceiptItemScalarWhereInput = {
    AND?: ReceiptItemScalarWhereInput | ReceiptItemScalarWhereInput[]
    OR?: ReceiptItemScalarWhereInput[]
    NOT?: ReceiptItemScalarWhereInput | ReceiptItemScalarWhereInput[]
    id?: StringFilter<"ReceiptItem"> | string
    itemGroupId?: StringFilter<"ReceiptItem"> | string
    price?: FloatFilter<"ReceiptItem"> | number
    createdAt?: DateTimeFilter<"ReceiptItem"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItem"> | Date | string
  }

  export type ReceiptItemGroupTranslationUpsertWithWhereUniqueWithoutItemGroupInput = {
    where: ReceiptItemGroupTranslationWhereUniqueInput
    update: XOR<ReceiptItemGroupTranslationUpdateWithoutItemGroupInput, ReceiptItemGroupTranslationUncheckedUpdateWithoutItemGroupInput>
    create: XOR<ReceiptItemGroupTranslationCreateWithoutItemGroupInput, ReceiptItemGroupTranslationUncheckedCreateWithoutItemGroupInput>
  }

  export type ReceiptItemGroupTranslationUpdateWithWhereUniqueWithoutItemGroupInput = {
    where: ReceiptItemGroupTranslationWhereUniqueInput
    data: XOR<ReceiptItemGroupTranslationUpdateWithoutItemGroupInput, ReceiptItemGroupTranslationUncheckedUpdateWithoutItemGroupInput>
  }

  export type ReceiptItemGroupTranslationUpdateManyWithWhereWithoutItemGroupInput = {
    where: ReceiptItemGroupTranslationScalarWhereInput
    data: XOR<ReceiptItemGroupTranslationUpdateManyMutationInput, ReceiptItemGroupTranslationUncheckedUpdateManyWithoutItemGroupInput>
  }

  export type ReceiptItemGroupTranslationScalarWhereInput = {
    AND?: ReceiptItemGroupTranslationScalarWhereInput | ReceiptItemGroupTranslationScalarWhereInput[]
    OR?: ReceiptItemGroupTranslationScalarWhereInput[]
    NOT?: ReceiptItemGroupTranslationScalarWhereInput | ReceiptItemGroupTranslationScalarWhereInput[]
    id?: StringFilter<"ReceiptItemGroupTranslation"> | string
    itemGroupId?: StringFilter<"ReceiptItemGroupTranslation"> | string
    label?: StringFilter<"ReceiptItemGroupTranslation"> | string
    description?: StringFilter<"ReceiptItemGroupTranslation"> | string
    language?: StringFilter<"ReceiptItemGroupTranslation"> | string
    lightModeLabelHexColor?: StringFilter<"ReceiptItemGroupTranslation"> | string
    darkModeLabelHexColor?: StringFilter<"ReceiptItemGroupTranslation"> | string
    createdAt?: DateTimeFilter<"ReceiptItemGroupTranslation"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItemGroupTranslation"> | Date | string
  }

  export type ReceiptItemGroupCreateWithoutItemsInput = {
    id?: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    quantity: number
    quantityUnit?: string | null
    unitPrice: number
    receipt: ReceiptCreateNestedOneWithoutItemGroupsInput
    translations?: ReceiptItemGroupTranslationCreateNestedManyWithoutItemGroupInput
  }

  export type ReceiptItemGroupUncheckedCreateWithoutItemsInput = {
    id?: string
    receiptId: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    quantity: number
    quantityUnit?: string | null
    unitPrice: number
    translations?: ReceiptItemGroupTranslationUncheckedCreateNestedManyWithoutItemGroupInput
  }

  export type ReceiptItemGroupCreateOrConnectWithoutItemsInput = {
    where: ReceiptItemGroupWhereUniqueInput
    create: XOR<ReceiptItemGroupCreateWithoutItemsInput, ReceiptItemGroupUncheckedCreateWithoutItemsInput>
  }

  export type ReceiptItemSupplementCreateWithoutItemInput = {
    id?: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    translations?: ReceiptItemSupplementTranslationCreateNestedManyWithoutSupplementInput
  }

  export type ReceiptItemSupplementUncheckedCreateWithoutItemInput = {
    id?: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    translations?: ReceiptItemSupplementTranslationUncheckedCreateNestedManyWithoutSupplementInput
  }

  export type ReceiptItemSupplementCreateOrConnectWithoutItemInput = {
    where: ReceiptItemSupplementWhereUniqueInput
    create: XOR<ReceiptItemSupplementCreateWithoutItemInput, ReceiptItemSupplementUncheckedCreateWithoutItemInput>
  }

  export type ReceiptItemSupplementCreateManyItemInputEnvelope = {
    data: ReceiptItemSupplementCreateManyItemInput | ReceiptItemSupplementCreateManyItemInput[]
    skipDuplicates?: boolean
  }

  export type SmartReceiptPaymentCreateWithoutItemInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutPaymentsInput
    smartReceipt?: SmartReceiptCreateNestedOneWithoutPaymentsInput
  }

  export type SmartReceiptPaymentUncheckedCreateWithoutItemInput = {
    id?: string
    userId: string
    smartReceiptId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SmartReceiptPaymentCreateOrConnectWithoutItemInput = {
    where: SmartReceiptPaymentWhereUniqueInput
    create: XOR<SmartReceiptPaymentCreateWithoutItemInput, SmartReceiptPaymentUncheckedCreateWithoutItemInput>
  }

  export type SmartReceiptPaymentCreateManyItemInputEnvelope = {
    data: SmartReceiptPaymentCreateManyItemInput | SmartReceiptPaymentCreateManyItemInput[]
    skipDuplicates?: boolean
  }

  export type ReceiptItemGroupUpsertWithoutItemsInput = {
    update: XOR<ReceiptItemGroupUpdateWithoutItemsInput, ReceiptItemGroupUncheckedUpdateWithoutItemsInput>
    create: XOR<ReceiptItemGroupCreateWithoutItemsInput, ReceiptItemGroupUncheckedCreateWithoutItemsInput>
    where?: ReceiptItemGroupWhereInput
  }

  export type ReceiptItemGroupUpdateToOneWithWhereWithoutItemsInput = {
    where?: ReceiptItemGroupWhereInput
    data: XOR<ReceiptItemGroupUpdateWithoutItemsInput, ReceiptItemGroupUncheckedUpdateWithoutItemsInput>
  }

  export type ReceiptItemGroupUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: FloatFieldUpdateOperationsInput | number
    quantityUnit?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: FloatFieldUpdateOperationsInput | number
    receipt?: ReceiptUpdateOneRequiredWithoutItemGroupsNestedInput
    translations?: ReceiptItemGroupTranslationUpdateManyWithoutItemGroupNestedInput
  }

  export type ReceiptItemGroupUncheckedUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    receiptId?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: FloatFieldUpdateOperationsInput | number
    quantityUnit?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: FloatFieldUpdateOperationsInput | number
    translations?: ReceiptItemGroupTranslationUncheckedUpdateManyWithoutItemGroupNestedInput
  }

  export type ReceiptItemSupplementUpsertWithWhereUniqueWithoutItemInput = {
    where: ReceiptItemSupplementWhereUniqueInput
    update: XOR<ReceiptItemSupplementUpdateWithoutItemInput, ReceiptItemSupplementUncheckedUpdateWithoutItemInput>
    create: XOR<ReceiptItemSupplementCreateWithoutItemInput, ReceiptItemSupplementUncheckedCreateWithoutItemInput>
  }

  export type ReceiptItemSupplementUpdateWithWhereUniqueWithoutItemInput = {
    where: ReceiptItemSupplementWhereUniqueInput
    data: XOR<ReceiptItemSupplementUpdateWithoutItemInput, ReceiptItemSupplementUncheckedUpdateWithoutItemInput>
  }

  export type ReceiptItemSupplementUpdateManyWithWhereWithoutItemInput = {
    where: ReceiptItemSupplementScalarWhereInput
    data: XOR<ReceiptItemSupplementUpdateManyMutationInput, ReceiptItemSupplementUncheckedUpdateManyWithoutItemInput>
  }

  export type ReceiptItemSupplementScalarWhereInput = {
    AND?: ReceiptItemSupplementScalarWhereInput | ReceiptItemSupplementScalarWhereInput[]
    OR?: ReceiptItemSupplementScalarWhereInput[]
    NOT?: ReceiptItemSupplementScalarWhereInput | ReceiptItemSupplementScalarWhereInput[]
    id?: StringFilter<"ReceiptItemSupplement"> | string
    itemId?: StringFilter<"ReceiptItemSupplement"> | string
    description?: StringFilter<"ReceiptItemSupplement"> | string
    price?: FloatFilter<"ReceiptItemSupplement"> | number
    createdAt?: DateTimeFilter<"ReceiptItemSupplement"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItemSupplement"> | Date | string
  }

  export type SmartReceiptPaymentUpsertWithWhereUniqueWithoutItemInput = {
    where: SmartReceiptPaymentWhereUniqueInput
    update: XOR<SmartReceiptPaymentUpdateWithoutItemInput, SmartReceiptPaymentUncheckedUpdateWithoutItemInput>
    create: XOR<SmartReceiptPaymentCreateWithoutItemInput, SmartReceiptPaymentUncheckedCreateWithoutItemInput>
  }

  export type SmartReceiptPaymentUpdateWithWhereUniqueWithoutItemInput = {
    where: SmartReceiptPaymentWhereUniqueInput
    data: XOR<SmartReceiptPaymentUpdateWithoutItemInput, SmartReceiptPaymentUncheckedUpdateWithoutItemInput>
  }

  export type SmartReceiptPaymentUpdateManyWithWhereWithoutItemInput = {
    where: SmartReceiptPaymentScalarWhereInput
    data: XOR<SmartReceiptPaymentUpdateManyMutationInput, SmartReceiptPaymentUncheckedUpdateManyWithoutItemInput>
  }

  export type ReceiptItemCreateWithoutSupplementsInput = {
    id?: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    itemGroup: ReceiptItemGroupCreateNestedOneWithoutItemsInput
    smartPayments?: SmartReceiptPaymentCreateNestedManyWithoutItemInput
  }

  export type ReceiptItemUncheckedCreateWithoutSupplementsInput = {
    id?: string
    itemGroupId: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    smartPayments?: SmartReceiptPaymentUncheckedCreateNestedManyWithoutItemInput
  }

  export type ReceiptItemCreateOrConnectWithoutSupplementsInput = {
    where: ReceiptItemWhereUniqueInput
    create: XOR<ReceiptItemCreateWithoutSupplementsInput, ReceiptItemUncheckedCreateWithoutSupplementsInput>
  }

  export type ReceiptItemSupplementTranslationCreateWithoutSupplementInput = {
    id?: string
    label: string
    description: string
    language: string
    lightModeLabelHexColor: string
    darkModeLabelHexColor: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemSupplementTranslationUncheckedCreateWithoutSupplementInput = {
    id?: string
    label: string
    description: string
    language: string
    lightModeLabelHexColor: string
    darkModeLabelHexColor: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemSupplementTranslationCreateOrConnectWithoutSupplementInput = {
    where: ReceiptItemSupplementTranslationWhereUniqueInput
    create: XOR<ReceiptItemSupplementTranslationCreateWithoutSupplementInput, ReceiptItemSupplementTranslationUncheckedCreateWithoutSupplementInput>
  }

  export type ReceiptItemSupplementTranslationCreateManySupplementInputEnvelope = {
    data: ReceiptItemSupplementTranslationCreateManySupplementInput | ReceiptItemSupplementTranslationCreateManySupplementInput[]
    skipDuplicates?: boolean
  }

  export type ReceiptItemUpsertWithoutSupplementsInput = {
    update: XOR<ReceiptItemUpdateWithoutSupplementsInput, ReceiptItemUncheckedUpdateWithoutSupplementsInput>
    create: XOR<ReceiptItemCreateWithoutSupplementsInput, ReceiptItemUncheckedCreateWithoutSupplementsInput>
    where?: ReceiptItemWhereInput
  }

  export type ReceiptItemUpdateToOneWithWhereWithoutSupplementsInput = {
    where?: ReceiptItemWhereInput
    data: XOR<ReceiptItemUpdateWithoutSupplementsInput, ReceiptItemUncheckedUpdateWithoutSupplementsInput>
  }

  export type ReceiptItemUpdateWithoutSupplementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    itemGroup?: ReceiptItemGroupUpdateOneRequiredWithoutItemsNestedInput
    smartPayments?: SmartReceiptPaymentUpdateManyWithoutItemNestedInput
  }

  export type ReceiptItemUncheckedUpdateWithoutSupplementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    itemGroupId?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    smartPayments?: SmartReceiptPaymentUncheckedUpdateManyWithoutItemNestedInput
  }

  export type ReceiptItemSupplementTranslationUpsertWithWhereUniqueWithoutSupplementInput = {
    where: ReceiptItemSupplementTranslationWhereUniqueInput
    update: XOR<ReceiptItemSupplementTranslationUpdateWithoutSupplementInput, ReceiptItemSupplementTranslationUncheckedUpdateWithoutSupplementInput>
    create: XOR<ReceiptItemSupplementTranslationCreateWithoutSupplementInput, ReceiptItemSupplementTranslationUncheckedCreateWithoutSupplementInput>
  }

  export type ReceiptItemSupplementTranslationUpdateWithWhereUniqueWithoutSupplementInput = {
    where: ReceiptItemSupplementTranslationWhereUniqueInput
    data: XOR<ReceiptItemSupplementTranslationUpdateWithoutSupplementInput, ReceiptItemSupplementTranslationUncheckedUpdateWithoutSupplementInput>
  }

  export type ReceiptItemSupplementTranslationUpdateManyWithWhereWithoutSupplementInput = {
    where: ReceiptItemSupplementTranslationScalarWhereInput
    data: XOR<ReceiptItemSupplementTranslationUpdateManyMutationInput, ReceiptItemSupplementTranslationUncheckedUpdateManyWithoutSupplementInput>
  }

  export type ReceiptItemSupplementTranslationScalarWhereInput = {
    AND?: ReceiptItemSupplementTranslationScalarWhereInput | ReceiptItemSupplementTranslationScalarWhereInput[]
    OR?: ReceiptItemSupplementTranslationScalarWhereInput[]
    NOT?: ReceiptItemSupplementTranslationScalarWhereInput | ReceiptItemSupplementTranslationScalarWhereInput[]
    id?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    supplementId?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    label?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    description?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    language?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    lightModeLabelHexColor?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    darkModeLabelHexColor?: StringFilter<"ReceiptItemSupplementTranslation"> | string
    createdAt?: DateTimeFilter<"ReceiptItemSupplementTranslation"> | Date | string
    updatedAt?: DateTimeFilter<"ReceiptItemSupplementTranslation"> | Date | string
  }

  export type ReceiptItemGroupCreateWithoutTranslationsInput = {
    id?: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    quantity: number
    quantityUnit?: string | null
    unitPrice: number
    receipt: ReceiptCreateNestedOneWithoutItemGroupsInput
    items?: ReceiptItemCreateNestedManyWithoutItemGroupInput
  }

  export type ReceiptItemGroupUncheckedCreateWithoutTranslationsInput = {
    id?: string
    receiptId: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    quantity: number
    quantityUnit?: string | null
    unitPrice: number
    items?: ReceiptItemUncheckedCreateNestedManyWithoutItemGroupInput
  }

  export type ReceiptItemGroupCreateOrConnectWithoutTranslationsInput = {
    where: ReceiptItemGroupWhereUniqueInput
    create: XOR<ReceiptItemGroupCreateWithoutTranslationsInput, ReceiptItemGroupUncheckedCreateWithoutTranslationsInput>
  }

  export type ReceiptItemGroupUpsertWithoutTranslationsInput = {
    update: XOR<ReceiptItemGroupUpdateWithoutTranslationsInput, ReceiptItemGroupUncheckedUpdateWithoutTranslationsInput>
    create: XOR<ReceiptItemGroupCreateWithoutTranslationsInput, ReceiptItemGroupUncheckedCreateWithoutTranslationsInput>
    where?: ReceiptItemGroupWhereInput
  }

  export type ReceiptItemGroupUpdateToOneWithWhereWithoutTranslationsInput = {
    where?: ReceiptItemGroupWhereInput
    data: XOR<ReceiptItemGroupUpdateWithoutTranslationsInput, ReceiptItemGroupUncheckedUpdateWithoutTranslationsInput>
  }

  export type ReceiptItemGroupUpdateWithoutTranslationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: FloatFieldUpdateOperationsInput | number
    quantityUnit?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: FloatFieldUpdateOperationsInput | number
    receipt?: ReceiptUpdateOneRequiredWithoutItemGroupsNestedInput
    items?: ReceiptItemUpdateManyWithoutItemGroupNestedInput
  }

  export type ReceiptItemGroupUncheckedUpdateWithoutTranslationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    receiptId?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: FloatFieldUpdateOperationsInput | number
    quantityUnit?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: FloatFieldUpdateOperationsInput | number
    items?: ReceiptItemUncheckedUpdateManyWithoutItemGroupNestedInput
  }

  export type ReceiptItemSupplementCreateWithoutTranslationsInput = {
    id?: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    item: ReceiptItemCreateNestedOneWithoutSupplementsInput
  }

  export type ReceiptItemSupplementUncheckedCreateWithoutTranslationsInput = {
    id?: string
    itemId: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemSupplementCreateOrConnectWithoutTranslationsInput = {
    where: ReceiptItemSupplementWhereUniqueInput
    create: XOR<ReceiptItemSupplementCreateWithoutTranslationsInput, ReceiptItemSupplementUncheckedCreateWithoutTranslationsInput>
  }

  export type ReceiptItemSupplementUpsertWithoutTranslationsInput = {
    update: XOR<ReceiptItemSupplementUpdateWithoutTranslationsInput, ReceiptItemSupplementUncheckedUpdateWithoutTranslationsInput>
    create: XOR<ReceiptItemSupplementCreateWithoutTranslationsInput, ReceiptItemSupplementUncheckedCreateWithoutTranslationsInput>
    where?: ReceiptItemSupplementWhereInput
  }

  export type ReceiptItemSupplementUpdateToOneWithWhereWithoutTranslationsInput = {
    where?: ReceiptItemSupplementWhereInput
    data: XOR<ReceiptItemSupplementUpdateWithoutTranslationsInput, ReceiptItemSupplementUncheckedUpdateWithoutTranslationsInput>
  }

  export type ReceiptItemSupplementUpdateWithoutTranslationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    item?: ReceiptItemUpdateOneRequiredWithoutSupplementsNestedInput
  }

  export type ReceiptItemSupplementUncheckedUpdateWithoutTranslationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    itemId?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptCreateWithoutSmartReceiptsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    merchantName: string
    receiptType?: string | null
    receiptDate?: Date | string | null
    totalPrice: number
    currencyCode?: string | null
    createdBy: UserCreateNestedOneWithoutReceiptsInput
    itemGroups?: ReceiptItemGroupCreateNestedManyWithoutReceiptInput
  }

  export type ReceiptUncheckedCreateWithoutSmartReceiptsInput = {
    id?: string
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    merchantName: string
    receiptType?: string | null
    receiptDate?: Date | string | null
    totalPrice: number
    currencyCode?: string | null
    itemGroups?: ReceiptItemGroupUncheckedCreateNestedManyWithoutReceiptInput
  }

  export type ReceiptCreateOrConnectWithoutSmartReceiptsInput = {
    where: ReceiptWhereUniqueInput
    create: XOR<ReceiptCreateWithoutSmartReceiptsInput, ReceiptUncheckedCreateWithoutSmartReceiptsInput>
  }

  export type UserCreateWithoutSmartReceiptsInput = {
    id: string
    email: string
    createdAt?: Date | string
    avatarUrl?: string | null
    admin?: boolean
    receipts?: ReceiptCreateNestedManyWithoutCreatedByInput
    payments?: SmartReceiptPaymentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSmartReceiptsInput = {
    id: string
    email: string
    createdAt?: Date | string
    avatarUrl?: string | null
    admin?: boolean
    receipts?: ReceiptUncheckedCreateNestedManyWithoutCreatedByInput
    payments?: SmartReceiptPaymentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSmartReceiptsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSmartReceiptsInput, UserUncheckedCreateWithoutSmartReceiptsInput>
  }

  export type SmartReceiptPaymentCreateWithoutSmartReceiptInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutPaymentsInput
    item: ReceiptItemCreateNestedOneWithoutSmartPaymentsInput
  }

  export type SmartReceiptPaymentUncheckedCreateWithoutSmartReceiptInput = {
    id?: string
    userId: string
    receiptItemId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SmartReceiptPaymentCreateOrConnectWithoutSmartReceiptInput = {
    where: SmartReceiptPaymentWhereUniqueInput
    create: XOR<SmartReceiptPaymentCreateWithoutSmartReceiptInput, SmartReceiptPaymentUncheckedCreateWithoutSmartReceiptInput>
  }

  export type SmartReceiptPaymentCreateManySmartReceiptInputEnvelope = {
    data: SmartReceiptPaymentCreateManySmartReceiptInput | SmartReceiptPaymentCreateManySmartReceiptInput[]
    skipDuplicates?: boolean
  }

  export type ReceiptUpsertWithoutSmartReceiptsInput = {
    update: XOR<ReceiptUpdateWithoutSmartReceiptsInput, ReceiptUncheckedUpdateWithoutSmartReceiptsInput>
    create: XOR<ReceiptCreateWithoutSmartReceiptsInput, ReceiptUncheckedCreateWithoutSmartReceiptsInput>
    where?: ReceiptWhereInput
  }

  export type ReceiptUpdateToOneWithWhereWithoutSmartReceiptsInput = {
    where?: ReceiptWhereInput
    data: XOR<ReceiptUpdateWithoutSmartReceiptsInput, ReceiptUncheckedUpdateWithoutSmartReceiptsInput>
  }

  export type ReceiptUpdateWithoutSmartReceiptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    merchantName?: StringFieldUpdateOperationsInput | string
    receiptType?: NullableStringFieldUpdateOperationsInput | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPrice?: FloatFieldUpdateOperationsInput | number
    currencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: UserUpdateOneRequiredWithoutReceiptsNestedInput
    itemGroups?: ReceiptItemGroupUpdateManyWithoutReceiptNestedInput
  }

  export type ReceiptUncheckedUpdateWithoutSmartReceiptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    merchantName?: StringFieldUpdateOperationsInput | string
    receiptType?: NullableStringFieldUpdateOperationsInput | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPrice?: FloatFieldUpdateOperationsInput | number
    currencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    itemGroups?: ReceiptItemGroupUncheckedUpdateManyWithoutReceiptNestedInput
  }

  export type UserUpsertWithWhereUniqueWithoutSmartReceiptsInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutSmartReceiptsInput, UserUncheckedUpdateWithoutSmartReceiptsInput>
    create: XOR<UserCreateWithoutSmartReceiptsInput, UserUncheckedCreateWithoutSmartReceiptsInput>
  }

  export type UserUpdateWithWhereUniqueWithoutSmartReceiptsInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutSmartReceiptsInput, UserUncheckedUpdateWithoutSmartReceiptsInput>
  }

  export type UserUpdateManyWithWhereWithoutSmartReceiptsInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutSmartReceiptsInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    avatarUrl?: StringNullableFilter<"User"> | string | null
    admin?: BoolFilter<"User"> | boolean
  }

  export type SmartReceiptPaymentUpsertWithWhereUniqueWithoutSmartReceiptInput = {
    where: SmartReceiptPaymentWhereUniqueInput
    update: XOR<SmartReceiptPaymentUpdateWithoutSmartReceiptInput, SmartReceiptPaymentUncheckedUpdateWithoutSmartReceiptInput>
    create: XOR<SmartReceiptPaymentCreateWithoutSmartReceiptInput, SmartReceiptPaymentUncheckedCreateWithoutSmartReceiptInput>
  }

  export type SmartReceiptPaymentUpdateWithWhereUniqueWithoutSmartReceiptInput = {
    where: SmartReceiptPaymentWhereUniqueInput
    data: XOR<SmartReceiptPaymentUpdateWithoutSmartReceiptInput, SmartReceiptPaymentUncheckedUpdateWithoutSmartReceiptInput>
  }

  export type SmartReceiptPaymentUpdateManyWithWhereWithoutSmartReceiptInput = {
    where: SmartReceiptPaymentScalarWhereInput
    data: XOR<SmartReceiptPaymentUpdateManyMutationInput, SmartReceiptPaymentUncheckedUpdateManyWithoutSmartReceiptInput>
  }

  export type UserCreateWithoutPaymentsInput = {
    id: string
    email: string
    createdAt?: Date | string
    avatarUrl?: string | null
    admin?: boolean
    receipts?: ReceiptCreateNestedManyWithoutCreatedByInput
    smartReceipts?: SmartReceiptCreateNestedManyWithoutUsersInput
  }

  export type UserUncheckedCreateWithoutPaymentsInput = {
    id: string
    email: string
    createdAt?: Date | string
    avatarUrl?: string | null
    admin?: boolean
    receipts?: ReceiptUncheckedCreateNestedManyWithoutCreatedByInput
    smartReceipts?: SmartReceiptUncheckedCreateNestedManyWithoutUsersInput
  }

  export type UserCreateOrConnectWithoutPaymentsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
  }

  export type SmartReceiptCreateWithoutPaymentsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedTotalPrice?: number | null
    updatedCurrencyCode?: string | null
    receipt: ReceiptCreateNestedOneWithoutSmartReceiptsInput
    users?: UserCreateNestedManyWithoutSmartReceiptsInput
  }

  export type SmartReceiptUncheckedCreateWithoutPaymentsInput = {
    id?: string
    receiptId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedTotalPrice?: number | null
    updatedCurrencyCode?: string | null
    users?: UserUncheckedCreateNestedManyWithoutSmartReceiptsInput
  }

  export type SmartReceiptCreateOrConnectWithoutPaymentsInput = {
    where: SmartReceiptWhereUniqueInput
    create: XOR<SmartReceiptCreateWithoutPaymentsInput, SmartReceiptUncheckedCreateWithoutPaymentsInput>
  }

  export type ReceiptItemCreateWithoutSmartPaymentsInput = {
    id?: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    itemGroup: ReceiptItemGroupCreateNestedOneWithoutItemsInput
    supplements?: ReceiptItemSupplementCreateNestedManyWithoutItemInput
  }

  export type ReceiptItemUncheckedCreateWithoutSmartPaymentsInput = {
    id?: string
    itemGroupId: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    supplements?: ReceiptItemSupplementUncheckedCreateNestedManyWithoutItemInput
  }

  export type ReceiptItemCreateOrConnectWithoutSmartPaymentsInput = {
    where: ReceiptItemWhereUniqueInput
    create: XOR<ReceiptItemCreateWithoutSmartPaymentsInput, ReceiptItemUncheckedCreateWithoutSmartPaymentsInput>
  }

  export type UserUpsertWithoutPaymentsInput = {
    update: XOR<UserUpdateWithoutPaymentsInput, UserUncheckedUpdateWithoutPaymentsInput>
    create: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPaymentsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPaymentsInput, UserUncheckedUpdateWithoutPaymentsInput>
  }

  export type UserUpdateWithoutPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    admin?: BoolFieldUpdateOperationsInput | boolean
    receipts?: ReceiptUpdateManyWithoutCreatedByNestedInput
    smartReceipts?: SmartReceiptUpdateManyWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateWithoutPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    admin?: BoolFieldUpdateOperationsInput | boolean
    receipts?: ReceiptUncheckedUpdateManyWithoutCreatedByNestedInput
    smartReceipts?: SmartReceiptUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type SmartReceiptUpsertWithoutPaymentsInput = {
    update: XOR<SmartReceiptUpdateWithoutPaymentsInput, SmartReceiptUncheckedUpdateWithoutPaymentsInput>
    create: XOR<SmartReceiptCreateWithoutPaymentsInput, SmartReceiptUncheckedCreateWithoutPaymentsInput>
    where?: SmartReceiptWhereInput
  }

  export type SmartReceiptUpdateToOneWithWhereWithoutPaymentsInput = {
    where?: SmartReceiptWhereInput
    data: XOR<SmartReceiptUpdateWithoutPaymentsInput, SmartReceiptUncheckedUpdateWithoutPaymentsInput>
  }

  export type SmartReceiptUpdateWithoutPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedTotalPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    updatedCurrencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    receipt?: ReceiptUpdateOneRequiredWithoutSmartReceiptsNestedInput
    users?: UserUpdateManyWithoutSmartReceiptsNestedInput
  }

  export type SmartReceiptUncheckedUpdateWithoutPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    receiptId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedTotalPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    updatedCurrencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    users?: UserUncheckedUpdateManyWithoutSmartReceiptsNestedInput
  }

  export type ReceiptItemUpsertWithoutSmartPaymentsInput = {
    update: XOR<ReceiptItemUpdateWithoutSmartPaymentsInput, ReceiptItemUncheckedUpdateWithoutSmartPaymentsInput>
    create: XOR<ReceiptItemCreateWithoutSmartPaymentsInput, ReceiptItemUncheckedCreateWithoutSmartPaymentsInput>
    where?: ReceiptItemWhereInput
  }

  export type ReceiptItemUpdateToOneWithWhereWithoutSmartPaymentsInput = {
    where?: ReceiptItemWhereInput
    data: XOR<ReceiptItemUpdateWithoutSmartPaymentsInput, ReceiptItemUncheckedUpdateWithoutSmartPaymentsInput>
  }

  export type ReceiptItemUpdateWithoutSmartPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    itemGroup?: ReceiptItemGroupUpdateOneRequiredWithoutItemsNestedInput
    supplements?: ReceiptItemSupplementUpdateManyWithoutItemNestedInput
  }

  export type ReceiptItemUncheckedUpdateWithoutSmartPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    itemGroupId?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    supplements?: ReceiptItemSupplementUncheckedUpdateManyWithoutItemNestedInput
  }

  export type ReceiptCreateManyCreatedByInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    merchantName: string
    receiptType?: string | null
    receiptDate?: Date | string | null
    totalPrice: number
    currencyCode?: string | null
  }

  export type SmartReceiptPaymentCreateManyUserInput = {
    id?: string
    smartReceiptId: string
    receiptItemId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    merchantName?: StringFieldUpdateOperationsInput | string
    receiptType?: NullableStringFieldUpdateOperationsInput | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPrice?: FloatFieldUpdateOperationsInput | number
    currencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    itemGroups?: ReceiptItemGroupUpdateManyWithoutReceiptNestedInput
    smartReceipts?: SmartReceiptUpdateManyWithoutReceiptNestedInput
  }

  export type ReceiptUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    merchantName?: StringFieldUpdateOperationsInput | string
    receiptType?: NullableStringFieldUpdateOperationsInput | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPrice?: FloatFieldUpdateOperationsInput | number
    currencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    itemGroups?: ReceiptItemGroupUncheckedUpdateManyWithoutReceiptNestedInput
    smartReceipts?: SmartReceiptUncheckedUpdateManyWithoutReceiptNestedInput
  }

  export type ReceiptUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    merchantName?: StringFieldUpdateOperationsInput | string
    receiptType?: NullableStringFieldUpdateOperationsInput | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPrice?: FloatFieldUpdateOperationsInput | number
    currencyCode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SmartReceiptPaymentUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    smartReceipt?: SmartReceiptUpdateOneWithoutPaymentsNestedInput
    item?: ReceiptItemUpdateOneRequiredWithoutSmartPaymentsNestedInput
  }

  export type SmartReceiptPaymentUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    smartReceiptId?: StringFieldUpdateOperationsInput | string
    receiptItemId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SmartReceiptPaymentUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    smartReceiptId?: StringFieldUpdateOperationsInput | string
    receiptItemId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SmartReceiptUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedTotalPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    updatedCurrencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    receipt?: ReceiptUpdateOneRequiredWithoutSmartReceiptsNestedInput
    payments?: SmartReceiptPaymentUpdateManyWithoutSmartReceiptNestedInput
  }

  export type SmartReceiptUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    receiptId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedTotalPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    updatedCurrencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    payments?: SmartReceiptPaymentUncheckedUpdateManyWithoutSmartReceiptNestedInput
  }

  export type SmartReceiptUncheckedUpdateManyWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    receiptId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedTotalPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    updatedCurrencyCode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ReceiptItemGroupCreateManyReceiptInput = {
    id?: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    quantity: number
    quantityUnit?: string | null
    unitPrice: number
  }

  export type SmartReceiptCreateManyReceiptInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedTotalPrice?: number | null
    updatedCurrencyCode?: string | null
  }

  export type ReceiptItemGroupUpdateWithoutReceiptInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: FloatFieldUpdateOperationsInput | number
    quantityUnit?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: FloatFieldUpdateOperationsInput | number
    items?: ReceiptItemUpdateManyWithoutItemGroupNestedInput
    translations?: ReceiptItemGroupTranslationUpdateManyWithoutItemGroupNestedInput
  }

  export type ReceiptItemGroupUncheckedUpdateWithoutReceiptInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: FloatFieldUpdateOperationsInput | number
    quantityUnit?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: FloatFieldUpdateOperationsInput | number
    items?: ReceiptItemUncheckedUpdateManyWithoutItemGroupNestedInput
    translations?: ReceiptItemGroupTranslationUncheckedUpdateManyWithoutItemGroupNestedInput
  }

  export type ReceiptItemGroupUncheckedUpdateManyWithoutReceiptInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: FloatFieldUpdateOperationsInput | number
    quantityUnit?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: FloatFieldUpdateOperationsInput | number
  }

  export type SmartReceiptUpdateWithoutReceiptInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedTotalPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    updatedCurrencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    users?: UserUpdateManyWithoutSmartReceiptsNestedInput
    payments?: SmartReceiptPaymentUpdateManyWithoutSmartReceiptNestedInput
  }

  export type SmartReceiptUncheckedUpdateWithoutReceiptInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedTotalPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    updatedCurrencyCode?: NullableStringFieldUpdateOperationsInput | string | null
    users?: UserUncheckedUpdateManyWithoutSmartReceiptsNestedInput
    payments?: SmartReceiptPaymentUncheckedUpdateManyWithoutSmartReceiptNestedInput
  }

  export type SmartReceiptUncheckedUpdateManyWithoutReceiptInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedTotalPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    updatedCurrencyCode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ReceiptItemCreateManyItemGroupInput = {
    id?: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemGroupTranslationCreateManyItemGroupInput = {
    id?: string
    label: string
    description: string
    language: string
    lightModeLabelHexColor: string
    darkModeLabelHexColor: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemUpdateWithoutItemGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    supplements?: ReceiptItemSupplementUpdateManyWithoutItemNestedInput
    smartPayments?: SmartReceiptPaymentUpdateManyWithoutItemNestedInput
  }

  export type ReceiptItemUncheckedUpdateWithoutItemGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    supplements?: ReceiptItemSupplementUncheckedUpdateManyWithoutItemNestedInput
    smartPayments?: SmartReceiptPaymentUncheckedUpdateManyWithoutItemNestedInput
  }

  export type ReceiptItemUncheckedUpdateManyWithoutItemGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemGroupTranslationUpdateWithoutItemGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lightModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    darkModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemGroupTranslationUncheckedUpdateWithoutItemGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lightModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    darkModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemGroupTranslationUncheckedUpdateManyWithoutItemGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lightModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    darkModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemSupplementCreateManyItemInput = {
    id?: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SmartReceiptPaymentCreateManyItemInput = {
    id?: string
    userId: string
    smartReceiptId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemSupplementUpdateWithoutItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    translations?: ReceiptItemSupplementTranslationUpdateManyWithoutSupplementNestedInput
  }

  export type ReceiptItemSupplementUncheckedUpdateWithoutItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    translations?: ReceiptItemSupplementTranslationUncheckedUpdateManyWithoutSupplementNestedInput
  }

  export type ReceiptItemSupplementUncheckedUpdateManyWithoutItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SmartReceiptPaymentUpdateWithoutItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPaymentsNestedInput
    smartReceipt?: SmartReceiptUpdateOneWithoutPaymentsNestedInput
  }

  export type SmartReceiptPaymentUncheckedUpdateWithoutItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    smartReceiptId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SmartReceiptPaymentUncheckedUpdateManyWithoutItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    smartReceiptId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemSupplementTranslationCreateManySupplementInput = {
    id?: string
    label: string
    description: string
    language: string
    lightModeLabelHexColor: string
    darkModeLabelHexColor: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReceiptItemSupplementTranslationUpdateWithoutSupplementInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lightModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    darkModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemSupplementTranslationUncheckedUpdateWithoutSupplementInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lightModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    darkModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReceiptItemSupplementTranslationUncheckedUpdateManyWithoutSupplementInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lightModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    darkModeLabelHexColor?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SmartReceiptPaymentCreateManySmartReceiptInput = {
    id?: string
    userId: string
    receiptItemId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateWithoutSmartReceiptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    admin?: BoolFieldUpdateOperationsInput | boolean
    receipts?: ReceiptUpdateManyWithoutCreatedByNestedInput
    payments?: SmartReceiptPaymentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSmartReceiptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    admin?: BoolFieldUpdateOperationsInput | boolean
    receipts?: ReceiptUncheckedUpdateManyWithoutCreatedByNestedInput
    payments?: SmartReceiptPaymentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutSmartReceiptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    admin?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SmartReceiptPaymentUpdateWithoutSmartReceiptInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPaymentsNestedInput
    item?: ReceiptItemUpdateOneRequiredWithoutSmartPaymentsNestedInput
  }

  export type SmartReceiptPaymentUncheckedUpdateWithoutSmartReceiptInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    receiptItemId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SmartReceiptPaymentUncheckedUpdateManyWithoutSmartReceiptInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    receiptItemId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}