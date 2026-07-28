import {
  type Table,
  type Subquery,
  getTableColumns,
} from "drizzle-orm";

type TableColumnsOf<T extends Table> = ReturnType<typeof getTableColumns<T>>;
type SubqueryColumnsOf<T extends Subquery> = T["_"]["selectedFields"];
// ---------- Table ----------

export function extractTableColumns<
  T extends Table,
  const K extends keyof T["_"]["columns"],
>(table: T, keys: readonly K[]): Pick<T["_"]["columns"], K> {
  const columns = getTableColumns(table);
  const result = {} as any;
  for (const key of keys) {
    result[key] = columns[key as string];
  }
  return result;
}
export function excludeTableColumns<
  T extends Table,
  K extends keyof TableColumnsOf<T> = never, // <-- default fixes inference
>(source: T, excludeKeys: K[] = []): Omit<TableColumnsOf<T>, K> {
  const columns = getTableColumns(source);

  const allKeys = Object.keys(columns) as Array<keyof TableColumnsOf<T>>;
  const remainingKeys = allKeys.filter(
    (k) => !excludeKeys.includes(k as K),
  ) as Array<Exclude<keyof TableColumnsOf<T>, K>>;

  return extractTableColumns(source, remainingKeys as any) as unknown as Omit<
    TableColumnsOf<T>,
    K
  >;
}

// ---------- Subquery ----------

// export function extractSubqueryColumns<
//   T extends Subquery,
//   K extends keyof SubqueryColumnsOf<T>,
// >(source: T, keys: K[]): Pick<SubqueryColumnsOf<T>, K> {
//   const columns = source._.selectedFields as SubqueryColumnsOf<T>;

//   return keys.reduce(
//     (acc, key) => {
//       if (columns[key]) {
//         acc[key] = columns[key];
//       }
//       return acc;
//     },
//     {} as Pick<SubqueryColumnsOf<T>, K>,
//   );
// }

// export function excludeSubqueryColumns<
//   T extends Subquery,
//   K extends keyof SubqueryColumnsOf<T> = never, // <-- default fixes inference
// >(source: T, excludeKeys: K[] = []): Omit<SubqueryColumnsOf<T>, K> {
//   const columns = source._.selectedFields as SubqueryColumnsOf<T>;

//   const allKeys = Object.keys(columns) as Array<keyof SubqueryColumnsOf<T>>;
//   const remainingKeys = allKeys.filter(
//     (k) => !excludeKeys.includes(k as K),
//   ) as Array<Exclude<keyof SubqueryColumnsOf<T>, K>>;

//   return extractSubqueryColumns(
//     source,
//     remainingKeys as any,
//   ) as unknown as Omit<SubqueryColumnsOf<T>, K>;
// }
// This helper extracts only the requested keys from the table's column object

// import { getTableColumns, type Table, type Subquery } from "drizzle-orm";

// export function excludeTableColumns<
//   T extends Table,
//   const K extends keyof T["_"]["columns"]
// >(table: T, excludeKeys: readonly K[]): Omit<T["_"]["columns"], K> {
//   const columns = getTableColumns(table);
//   const allKeys = Object.keys(columns) as Array<keyof T["_"]["columns"]>;

//   const remainingKeys = allKeys.filter(
//     (k) => !excludeKeys.includes(k as any)
//   );

//   return pickColumns(table, remainingKeys as any) as any;
// }

// // ---------- Subquery Helpers ----------

export function extractSubqueryColumns<
  T extends Subquery,
  const K extends keyof T["_"]["selectedFields"]
>(source: T, keys: readonly K[]): Pick<T["_"]["selectedFields"], K> {
  const columns = source._.selectedFields;
  const result = {} as any;
  for (const key of keys) {
    result[key] = columns[key as string];
  }
  return result;
}
type Simplify<T> = { [K in keyof T]: T[K] } & {};

export function excludeSubqueryColumns<
  T extends Subquery,
  K extends keyof T["_"]["selectedFields"] = never,
>(
  source: T,
  excludeKeys: K[] = [],
): Simplify<Omit<T["_"]["selectedFields"], K>> {
  const columns = source._.selectedFields as T["_"]["selectedFields"];
  const allKeys = Object.keys(columns) as Array<
    keyof T["_"]["selectedFields"]
  >;

  const remainingKeys = allKeys.filter(
    (k) => !excludeKeys.includes(k as K),
  ) as Array<Exclude<keyof T["_"]["selectedFields"], K>>;

  return extractSubqueryColumns(source, remainingKeys as any) as unknown as Simplify<
    Omit<T["_"]["selectedFields"], K>
  >;
}