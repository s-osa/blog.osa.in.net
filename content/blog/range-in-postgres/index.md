---
title: "PostgreSQL の範囲型"
date: "2021-03-28"
---

## これは何？

前から気になっていた PostgreSQL の範囲型を触ってみたのでメモ。

以下の公式ドキュメントに書かれている以上のことはほとんどしていない。\
https://www.postgresql.jp/document/12/html/rangetypes.html

また、試してみる中で使った SQL は以下のリポジトリに置いてある。\
https://github.com/s-osa/postgres-playground/tree/master/range/sql

## 動機

アプリケーションで何かしらの範囲を扱いたいケースが存在する。

例として会議室を予約するアプリケーションを考える。
会議室予約アプリケーションでは以下のような要求があり、日時の範囲を扱う必要がある。

- ある時刻に予約されている（あるいは予約されていない）会議室を探す
- 任意の時刻において会議室を予約しているのは高々ひとつの予約であることを保証する
    - 平たく言うとダブルブッキングを防ぐ

### 予約されている会議室を探す

「予約」を（範囲型を使わずに）素直にテーブルにすると、たとえば以下のようなテーブルになる。

```sql
create table reservations (
    room_id   integer,
    start_at  timestamptz,
    finish_at timestamptz
);
```

このテーブルに対して `2021-03-27T12:34:56Z` を含む予約がある `room_id` を取得するクエリを素直に書くなら以下のようになるだろうか。\
（予約時間は始端を含み、終端を含まない半開区間にしている。詳しくは[時間の歩き方](/time-tips/#時間の始点と終点)参照）

```sql
select distinct
    room_id
from
    reservations r
where
      r.start_at <= '2021-03-27T12:34:56Z'
  and r.finish_at > '2021-03-27T12:34:56Z'
;
```

このテーブル構造とクエリには `start_at` と `finish_at` 両方にインデックスを効かせられないという問題がある。

つまり、`start_at` か `finish_at` のいずれかで絞り込むところまではインデックスが効くが、残りの片方についてはたとえ `start_at` と `finish_at` に複合インデックスを張っていたとしてもインデックスが使われない。\
（なお、今回のアプリケーションと上のクエリでは `start_at` より `finish_at` のインデックスを使った方が効率が良くなる。`start_at` で絞られる件数はアプリケーションの運用とともに増えていくのに対して、`finish_at` で絞れる件数は一定の範囲内に収まると考えられるため）

このあたりの考え方についてわかりやすいのはたぶん下のエントリ。MySQL についてのエントリだけど B+ tree についての基本的な考え方がわかりやすく書かれている。\
https://techlife.cookpad.com/entry/2017/04/18/092524

### ダブルブッキングを防ぐ

データベースには不正なデータを防ぐために制約があるが、上記のテーブル構造に対してダブルブッキングを防ぐための制約はかけられない。

テーブル構造を大きく変更してデータモデルに対して一定の前提を加えた上でデータベースの制約やロックを用いて不正データの挿入を防ぐことはできるが、少なくとも自分が思いつく範囲ではあまり効率的なデータ構造にならないし、ロックを適切に取るようにアプリケーションを保ち続けるのはとても難しい。

## 範囲型

PostgreSQL には範囲を扱うための型、その名も範囲型がある。\
https://www.postgresql.jp/document/12/html/rangetypes.html （再掲）

範囲型は数値・日時・日付などについての範囲が組み込みで定義されているほか、独自の範囲型が欲しい場合は自分で定義することもできる。

また、範囲型に対して自然に定義できる演算についても演算子が提供される。\
https://www.postgresql.jp/document/12/html/functions-range.html

範囲型を用いて前述の `reservations` テーブルを定義し直してみるとこうなる。

```sql
create table reservations (
    room_id   integer,
    duration  tstzrange -- timestamp with timezone の range
);
```

同様に範囲型の演算子を使ってクエリも書き換えると以下のようになる。


```sql
select distinct
    room_id
from
    reservations r
where
    r.duration @> '2021-03-27T12:34:56Z' :: timestamptz
;
```

## 範囲型に対するインデックス

便利そうな範囲型だが、インデックスを活用した効率的なクエリを実行できるのか試す。

### 前提

以下のテーブルの `during`, `indexed_during` に同じデータを入れたレコードを100万行つくった。
サンプルデータ生成を楽にするために int8 の範囲型にしている。

```sql
create table reservations (
    during         int8range,
    indexed_during int8range
);

create index reservations_indexed_during_idx on reservations using gist (indexed_during);
```

クエリは以下の通り。

```sql
-- インデックスなし
explain analyze
select *
from
    reservations r
where
    r.during @> 123456 :: int8
;


-- インデックスあり
explain analyze
select *
from
    reservations r
where
    r.indexed_during @> 123456 :: int8
;
```

その他の詳細は[リポジトリ](https://github.com/s-osa/postgres-playground/tree/master/range/sql)の `03` から始まるファイルに書かれている。
また、全体を通して実行環境は MacBook Pro (16-inch, 2019), 2.4 GHz 8-Core Intel Core i9, 32GB 2667 MHz DDR4 上で Docker を動かしているが、複数回計っているわけでもなければ他のプロセスの影響を考慮しているわけでもない。実際にはクラウドサービスのインスタンス上で実行すると思うので、個々の具体的な数字自体にはあまり意味を求めていない。

### 結果

#### インデックスなし

368ms

正直、思っていたより速かった。

```sql
                                                             QUERY PLAN                                            
-------------------------------------------------------------------------------------------------------------------------------------
 Gather  (cost=1000.00..141405.12 rows=41122 width=64) (actual time=17.116..367.608 rows=10 loops=1)
   Workers Planned: 2
   Workers Launched: 2
   ->  Parallel Seq Scan on reservations r  (cost=0.00..136292.92 rows=17134 width=64) (actual time=229.908..345.090 rows=3 loops=3)
         Filter: (during @> '123456'::bigint)
         Rows Removed by Filter: 3333330
 Planning Time: 0.128 ms
 JIT:
   Functions: 6
   Options: Inlining false, Optimization false, Expressions true, Deforming true
   Timing: Generation 1.105 ms, Inlining 0.000 ms, Optimization 0.629 ms, Emission 5.443 ms, Total 7.177 ms
 Execution Time: 368.201 ms
(12 rows)
```

#### インデックスあり

0.2ms

圧倒的。

```sql
                                                                   QUERY PLAN                                      
------------------------------------------------------------------------------------------------------------------------------------------------
 Bitmap Heap Scan on reservations r  (cost=2107.11..76720.55 rows=41122 width=64) (actual time=0.052..0.112 rows=10 loops=1)
   Recheck Cond: (indexed_during @> '123456'::bigint)
   Heap Blocks: exact=1
   ->  Bitmap Index Scan on reservations_indexed_during_idx  (cost=0.00..2096.83 rows=41122 width=0) (actual time=0.038..0.043 rows=10 loops=1)
         Index Cond: (indexed_during @> '123456'::bigint)
 Planning Time: 0.096 ms
 Execution Time: 0.189 ms
(7 rows)
```

## 範囲型に対する制約

以下のようなテーブル定義で範囲型に対して「範囲が重ならない」という制約をかけられる。

```sql
create table reservations
(
    during  tsrange, -- Range of timestamp
    exclude using gist (during with &&) -- 他のレコードと `during` が重複 `&&` したら fail
);
```

上のテーブルに対して、以下のような insert を走らせると、2つ目は制約に違反して insert に失敗する。

```sql
insert into
    reservations (during)
values
    ('[2021-03-01 10:00:00, 2021-03-01 12:00:00)')
  , ('[2021-03-01 13:00:00, 2021-03-01 13:30:00)')
;

-- This insert will fail
insert into
    reservations (during)
values
    ('[2021-03-01 09:30:00, 2021-03-01 10:30:00)')
;
```

## 複数カラムに対するインデックスと制約

現実的なユースケースでは範囲型単体に対してクエリしたり制約をかけたりというより、冒頭の会議室予約の例にもあるように何かしらの関連リソースと絡めてクエリしたり制約をかけたいことが多い。

そういったユースケースについても [btree_gist](https://www.postgresql.jp/document/12/html/btree-gist.html) という拡張を入れることで対応可能になる。

### 前提

`room_id` と `during` で複合的なインデックスと制約をつくる。

```sql
create extension btree_gist;

create table reservations (
    room_id bigint,
    during  int8range,
    exclude using gist (room_id with =, during with &&) -- room_id が一致 `=` し、かつ、during が重複 `&&` したら fail
);

create index reservations_room_id_during_idx on reservations using gist (room_id, during);
create index reservations_during_idx on reservations using gist (during);
```

クエリは包含と重複の2種類を試した。

```sql
-- 指定した点を包含する範囲を持つ行を検索
-- 絞り込み条件に `room_id` を含めていないので `reservations_during_idx` を使う想定
explain analyze
select *
from
    reservations r
where
    r.during @> (1614556800 + 123456) :: int8
;

-- room_id が一致し、かつ、指定した範囲と重複する範囲を持つ行を検索
-- 絞り込み条件に `room_id` を含めているので `reservations_room_id_during_idx` を使う想定
explain analyze
select *
from
    reservations r
where
      r.room_id = 1
  and r.during && int8range(1614556800 + 123456, 1614556800 + 234567)
;
```

また、サンプルデータの行数について、1-1000の `room_id` それぞれに対して、均等に

- 1,000件の `reservations` を insert するパターン（計100万行）
- 10,000件の `reservations` を insert するパターン（計1,000万行）

を試した。

### 結果

#### 包含 / 計100万行

14.8ms

Index Only Scan にしたいからなのか、このクエリのために用意した `reservations_during_idx` を使わずに `reservations_room_id_during_idx` を使っている。

```sql
                                                                          QUERY PLAN                               
--------------------------------------------------------------------------------------------------------------------------------------------------------------
 Index Only Scan using reservations_room_id_during_idx on reservations r  (cost=0.41..69.91 rows=1000 width=30) (actual time=0.153..11.154 rows=1000 loops=1)
   Index Cond: (during @> '1614680256'::bigint)
   Heap Fetches: 0
 Planning Time: 0.075 ms
 Execution Time: 14.787 ms
```

#### 包含 / 計1,000万行

8.8ms

100万行のときと異なり、想定通り `reservations_during_idx` を使ってくれた結果なのか、100万行のときよりも速くなっている。

```sql
                                                                QUERY PLAN                                         
------------------------------------------------------------------------------------------------------------------------------------------
 Bitmap Heap Scan on reservations r  (cost=1890.33..69022.77 rows=44118 width=40) (actual time=0.311..5.297 rows=1000 loops=1)
   Recheck Cond: (during @> '1614680256'::bigint)
   Heap Blocks: exact=1000
   ->  Bitmap Index Scan on reservations_during_idx  (cost=0.00..1879.30 rows=44118 width=0) (actual time=0.218..0.221 rows=1000 loops=1)
         Index Cond: (during @> '1614680256'::bigint)
 Planning Time: 0.064 ms
 Execution Time: 8.768 ms

```

#### 重複 / 計100万行

12.2ms

素直なインデックスの使い方をしてくれているように見える。

```sql
                                                                         QUERY PLAN                                
------------------------------------------------------------------------------------------------------------------------------------------------------------
 Index Only Scan using reservations_room_id_during_idx on reservations r  (cost=0.41..2144.71 rows=31 width=30) (actual time=8.884..12.026 rows=32 loops=1)
   Index Cond: (during && '[1614680256,1614791367)'::int8range)
   Filter: (room_id = 1)
   Rows Removed by Filter: 31968
   Heap Fetches: 0
 Planning Time: 0.131 ms
 Execution Time: 12.161 ms
```

#### 重複 / 計1,000万行

7.4ms

またしても100万行より速い。

ここでも `reservations_during_idx` を使っていて、このクエリでの使用を想定している `reservations_room_id_during_idx` を使っていない。`room_id` のカーディナリティが低いからとかかもしれない。

```sql
                                                                QUERY PLAN                                         
-------------------------------------------------------------------------------------------------------------------------------------------
 Bitmap Heap Scan on reservations r  (cost=3754.30..82390.48 rows=441 width=40) (actual time=3.957..7.203 rows=32 loops=1)
   Recheck Cond: (during && '[1614680256,1614791367)'::int8range)
   Filter: (room_id = 1)
   Rows Removed by Filter: 31968
   Heap Blocks: exact=1236
   ->  Bitmap Index Scan on reservations_during_idx  (cost=0.00..3754.18 rows=88236 width=0) (actual time=3.831..3.836 rows=32000 loops=1)
         Index Cond: (during && '[1614680256,1614791367)'::int8range)
 Planning Time: 0.110 ms
 Execution Time: 7.409 ms
```

## おわりに

正直、GiST インデックスや実行計画についてまだあまり理解できていないが、1,000万行ある範囲に対して雑にクエリを投げて10ms程度で返ってきたり、データベースレイヤで制約をかけられたりするのは非常に魅力的に感じる。

普通にめっちゃ便利なので使っていきたいし、やっぱり RDBMS は自分より賢い。
