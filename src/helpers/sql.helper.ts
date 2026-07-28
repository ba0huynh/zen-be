import {
  SQL,
  sql,
  Table,
  getTableColumns,
  Subquery,
  Column,
  is,
} from "drizzle-orm";
type TableOrSubquery = Table | Subquery;

type ColumnsOf<T extends TableOrSubquery> = T extends Table
  ? keyof ReturnType<typeof getTableColumns<T>>
  : //@ts-ignore
    keyof T["_"]["selectedFields"];

export function jsonBuildObjectArgs<T extends TableOrSubquery>(
  source: T,
  columns: ColumnsOf<T>[] = [],
  mode: "include" | "exclude" = "exclude",
): SQL {
  const allColumns =
    source instanceof Table ? getTableColumns(source) : source._.selectedFields;

  const columnSet = new Set(columns as string[]);

  const pairs = Object.entries(allColumns)
    .filter(([key]) =>
      mode === "include" ? columnSet.has(key) : !columnSet.has(key),
    )
    .map(([key, col]) => sql`${sql.raw(`'${key}'`)}, ${col}`)
    .reduce((acc, cur) => sql`${acc}, ${cur}`);

  return pairs;
}

function toSQL(source: SQL | SQL.Aliased | Column): SQL | SQL.Aliased {
  return is(source, Column) ? source.getSQL() : source;
}
export function coalesce<T = unknown, D = any>(
  source: Column | SQL | SQL.Aliased,
  defaultValue: D,
): SQL<T extends unknown ? D : T> {
  return sql`COALESCE(${toSQL(source)}, ${defaultValue})` as SQL<
    T extends unknown ? D : T
  >;
}

export function coalesceArray<T = unknown>(
  source: Column | SQL | SQL.Aliased,
): SQL<T[]> {
  // We force the return type by explicitly passing T[] as the first generic
  // and using the cast to ensure the return type matches T[]
  return coalesce<T[]>(source, sql`'[]'`) as SQL<T[]>;
}
export function jsonBuildObjectFromColumns<
  T extends Record<string, Column | SQL | SQL.Aliased>,
>(columns: T): SQL {
  const pairs = Object.entries(columns)
    .map(([key, col]) => sql`${sql.raw(`'${key}'`)}, ${col}`)
    .reduce((acc, cur) => sql`${acc}, ${cur}`);

  return sql`json_build_object(${pairs})`;
}

export function jsonAgg<T extends TableOrSubquery>(
  source: T,
  columns?: ColumnsOf<T>[],
  mode?: "include" | "exclude",
): SQL;
export function jsonAgg(source: SQL | SQL.Aliased | Column): SQL;
export function jsonAgg<T extends Record<string, Column | SQL | SQL.Aliased>>(
  source: T,
): SQL;
export function jsonAgg(
  source:
    | SQL
    | SQL.Aliased
    | Column
    | TableOrSubquery
    | Record<string, Column | SQL | SQL.Aliased>,
  columns: any[] = [],
  mode: "include" | "exclude" = "exclude",
): SQL {
  const target = toJsonAggTarget(source, columns, mode);
  return sql`json_agg(${target})`;
}

function toJsonAggTarget(
  source:
    | SQL
    | SQL.Aliased
    | Column
    | TableOrSubquery
    | Record<string, Column | SQL | SQL.Aliased>,
  columns: any[],
  mode: "include" | "exclude",
): SQL | SQL.Aliased | Column {
  // already a raw expression -> pass through unchanged
  if (is(source, Column) || is(source, SQL) || is(source, SQL.Aliased)) {
    return source;
  }

  // a Table or Subquery -> reuse jsonBuildObject's column-collection logic
  if (source instanceof Table || is(source, Subquery)) {
    return jsonBuildObject(source as TableOrSubquery, columns, mode);
  }

  // otherwise assume it's a plain map of columns/SQL, e.g. from
  // extractTableColumns / excludeTableColumns / a manual spread
  return jsonBuildObjectFromColumns(
    source as Record<string, Column | SQL | SQL.Aliased>,
  );
}
export function jsonBuildObject<
  TResult = unknown,
  T extends TableOrSubquery = TableOrSubquery
>(
  source: T,
  columns?: ColumnsOf<T>[],
  mode?: "include" | "exclude",
): SQL<TResult>;

export function jsonBuildObject<TResult = unknown>(
  source: Record<string, Column | SQL | SQL.Aliased>,
): SQL<TResult>;

export function jsonBuildObject(
  source: TableOrSubquery | Record<string, Column | SQL | SQL.Aliased>,
  columns: any[] = [],
  mode: "include" | "exclude" = "exclude",
): SQL<any> {
  if (source instanceof Table || is(source, Subquery)) {
    return sql`json_build_object(${jsonBuildObjectArgs(
      source as TableOrSubquery,
      columns,
      mode,
    )})`;
  }

  return jsonBuildObjectFromColumns(
    source as Record<string, Column | SQL | SQL.Aliased>,
  );
}