---
title: "Ruby で value object"
date: "2021-04-29"
---

Ruby で value object をつくるときに考えていること。

## Value Object

同一性 identity ではなく、等価性 equality に着目して比較するオブジェクト。\
https://www.martinfowler.com/eaaCatalog/valueObject.html

equality については同値性という訳もあるが、ここでは等価性とする。

### 例として扱うオブジェクト

バージョン番号を表す `VersionNumber` を例として用いる。

```ruby
class VersionNumber
  # @param major [Integer]
  # @param minor [Integer]
  # @param patch [Integer]
  def initialize(mejor = 0, minor = 0, patch = 0)
    @major = major
    @minor = minor
    @patch = patch
  end
  
  attr_reader :major, :minor, :patch
  
  # @return [String]
  def to_s
    [@major, @minor, @patch].map(&:to_s).join('.')
  end
end
```

エラーハンドリングはアプリケーションによってわりと変わるので、以下のサンプルコードには基本的に含めない。

## 同一性 Identity

Object#equal? で定義されているが、再定義しない（してはいけない）。\
https://docs.ruby-lang.org/ja/latest/method/Object/i/equal=3f.html

## 等価性 Equality

Value object の定義上、等価性を適切に再定義する必要がある。

Ruby において、等価性を考えるときに意識するメソッドは4つ。

- `==`
- `===`
- `eql?`
- `hash`

### ==

最も基本的な等価性判定のためのメソッド。適切に再定義する必要がある。\
https://docs.ruby-lang.org/ja/latest/class/Object.html#I_--3D--3D

```ruby
# @param other [Object]
# @return [Boolean]
def ==(other)
  self.class == other.class
    && self.major == other.major
    && self.minor == other.minor
    && self.patch == other.patch
end
```

### ===

`case` で使われる比較メソッド。デフォルトで `==` の別名になっているので、多くの場合は再定義不要。\
https://docs.ruby-lang.org/ja/latest/class/Object.html#I_--3D--3D--3D

### eql?

Hash の key における等価性の判定に用いられるメソッド。デフォルトは `equal?` の別名、つまり同一性の比較になっているため適切に再定義する必要がある。\
https://docs.ruby-lang.org/ja/latest/class/Object.html#I_EQL--3F

リンク先にもあるように基本的には `==` の別名にすれば良い。

### hash

Hash にオブジェクトを格納するためのハッシュ値を返すメソッド。適切に再定義する必要がある。\
https://docs.ruby-lang.org/ja/latest/class/Object.html#I_HASH

「`a.eql?(b)` ならば `a.hash == b.hash`」を満たすように Integer を返せば何でも良いが、自分は以下のような実装にすることが多い。

```ruby
# @return [Integer]
def hash
  [self.class, @major, @minor, @patch].hash
end
```

## 比較可能性 Comparability

対象のオブジェクトに自然な順序が定義できる場合、`==` の他に `>`, `<`, `>=`, `<=` あたりもあると便利なので `<=>` と Comparable で定義する。\
https://docs.ruby-lang.org/ja/latest/class/Comparable.html

```ruby
include Comparable

# @param other [Object]
# @return [Integer, nil]
def <=>(other)
  if self.class != other.class
    nil
  elsif self.major != other.major
    self.major <=> other.major
  elsif self.minor != other.minor
    self.minor <=> other.minor
  else
    self.patch <=> other.patch
  end
end
```

この場合、`==` も自動的に定義されるので、自分で定義する必要がなくなる。

## 不変性 Immutability

Value object の定義に immutable であることは含まれていない。しかし、通常 value object は immutable にできるし、immutable にできるものは immutable にしておく方が便利なので immutable にする。

つまり、patch version をひとつ増やすメソッド `increment_patch` を実装する場合、以下のようにする。

```ruby
# Bad
# @return [VersionNumber]
def increment_patch
  @patch += 1
  self
end

# Good
# @return [VersionNumber]
def increment_patch
  self.class.new(@major, @minor, @patch + 1)
end
```

## 等価性にクラスを含めるか

ここまでの例では簡単のために value object の等価性の定義にクラスの同一性を含める実装を書いてきた。

結果、以下のようなことができない実装になっている。

- サブクラスを含めた等価性比較
- ダックタイピング的な等価性比較

上記のような等価性比較を実現するため、クラスの同一性を参照しない value object をつくるときに考える必要があることを思いつく範囲でざっと書いておく。

### ==

等価性比較に用いるメソッドによっては false positive を生まないように注意が必要。

```ruby
# 整数表現が同じ Integer と等価になってしまう（多くの場合、望んでいない挙動のはず）
def ==(other)
  self.to_i == other.to_i
end
```

### eql?

`==` で等価になるものは常に Hash の key としても同じものとして扱って良いのかは検討する必要がある。

場合によっては `eql?` の方だけクラスの同一性を含めるなど、より厳密にする必要が生じるかもしれない。
また、その場合、`==` の挙動と Hash の key としての挙動が異なることを意識しながらコードを読み書きしていく必要が生じる。

### 可換性

等価性比較 `==` は通常可換、つまり `a == b` と `b == a` の結果が一致することが期待されているので、複数クラスの間での等価性を定義する場合、異なるクラスのインスタンスを比較しても可換性を維持するように実装する必要がある。

逆に、可換ではない関係が欲しいのであれば、目的に応じて `a.match?(b)` や `a.include?(b)` のようなメソッドを定義するべきかもしれない。

### 必要性

そもそもの話として、柔軟な等価性比較が本当に必要なのかは考え直してみたほうが良いように思う。

自分の経験では、クラスをまたいだ等価性が欲しくなったケースに出会ったことはない。
