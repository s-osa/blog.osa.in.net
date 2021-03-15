---
title: "整数の分割"
date: "2021-03-16"
---

## 問題

突然ですが問題です。10個のりんごを4人で分けると1人あたりいくつ食べられるでしょう？

簡単ですね。1人あたり2.5個食べられます。

次の問題です。10個の小籠包を4人で分けると1人あたりいくつ食べられるでしょう？

これは1人あたり2.5個というわけにはいきません。小籠包を割ってしまうとせっかくのスープがこぼれてしまうからです。

## 整数を分割する

小籠包しかり、人間しかり、整数としてしか扱えないものがある。

ある自然数を自然数の和で表す行為には「分割」という名前がついている模様。
https://ja.wikipedia.org/wiki/%E8%87%AA%E7%84%B6%E6%95%B0%E3%81%AE%E5%88%86%E5%89%B2

上のリンク先にあるように、分割は一般に様々な組み合わせが考えられるが、ここでは多数ある分割のうち長さが `n` で《概ね均等になる》分割を得る方法を考える。つまり、分割して得られる各部分（配列の要素）の最大値と最小値の差が高々1になるようにする。

Ruby で実装するとこんな感じだろうか。

```ruby
# @param n [Integer]
# @param length [Integer] Length of return value
# @return [Array<Integer>]
def flat_partition(n, length)
  quotient, reminder = n.divmod(length)
  ary = Array.new(length, quotient)
  
  i = 0
  
  while i < reminder
    ary[i] += 1
    i += 1
  end
  
  ary
end

flat_partition(10, 4) # => [3, 3, 2, 2]
flat_partition(1, 3) # => [1, 0, 0]
```

《概ね均等》を表すのに even や equal だと強すぎると思ったので flat という単語を選んでいる。

なお、楽しい書き方としては以下のようなものも考えられるが、`n` が大きい場合を考えると現実的ではなさそう。

```ruby
# Ruby >= 2.7
def flat_partition(n, length)
  (1..n).to_a.map { |num| num % length }.tally.values
end

# Ruby < 2.7
def flat_partition(n, length)
  (1..n).to_a.group_by { |num| num % length }.values.map(&:count)
end
```

## 重み付きの分割

《概ね均等な分割》があるなら意図的に《均等ではなくした分割》、つまり重み付き分割も考えることができる。インターフェイスとしては以下のような感じだろうか。

```ruby
flat_partition(12, [3, 2, 1]) # => [6, 4, 2]
```

ただ、重みに合わせた端数処理の場合、一般的に通用する妥当な仕様を定めるのが難しいように感じる。

```ruby
flat_partition(10, [3, 2, 1]) # => ?
# 重みなしの場合のように [3, 2, 1] に余りを足していく？ [5, 3, 2] ?
# [5, 3.333..., 1.666...] を元に考える？ [6, 3, 1]? [5, 4, 1]? [5, 3, 2]?
```

## おわりに

整数の概ね均等な分割、概念として確立されていそうなのに検索しても見つけられなかったので書いてみた。

Integer#flat_partition がちょっとだけ欲しい。

```ruby
10.flat_partition(4) # => [3, 3, 2, 2]
```
