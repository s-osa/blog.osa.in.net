---
title: "Damm Algorithm"
date: "2023-06-11"
---

## 背景

Check digit が必要になりそうになってきたので、改めて調べていると Damm algorithm という面白いアルゴリズムを見つけたので、メモしておく。

## 特徴

Wikipedia がよくまとめてくれている。

- [https://ja.wikipedia.org/wiki/Dammアルゴリズム](https://ja.wikipedia.org/wiki/Damm%E3%82%A2%E3%83%AB%E3%82%B4%E3%83%AA%E3%82%BA%E3%83%A0)
- https://en.wikipedia.org/wiki/Damm_algorithm

主要な点だけ抜き出すと、

- 古典的な [Luhn algorithm](https://ja.wikipedia.org/wiki/Luhn%E3%82%A2%E3%83%AB%E3%82%B4%E3%83%AA%E3%82%BA%E3%83%A0) などよりも検出できる誤りが多い
  - 1文字の誤りと連続する2文字の入れ替わりをすべて検出できる
- 任意の桁数に適用できる
- n種類の文字に対して同じ文字の範囲内で check digit を出力する
    - 数字の列に対しては数字の check digit を出力する（ISBN10の `X` のような11文字目を必要としない）
- 適切にパラメータを選べば、英語の聞き間違いによる誤り（13と30など）を訂正できる
- 使用する文字種は10に限らず、より多い文字種にも対応できる

といった感じ。

## 概要

数字の列に対して Damm algorithm を適用する場合、特定の性質を持った位数10の準群 quasigroup を用いる。
つまり、数学的な良い性質を持った変換表を使って check digit を計算していくアルゴリズムになっている。

たとえば、以下のようなもの。 

```
0 3 1 7 5 9 8 6 4 2
7 0 9 2 1 5 4 8 6 3
4 2 0 6 8 7 1 3 5 9
1 7 5 0 9 8 3 4 2 6
6 1 2 3 0 4 5 9 7 8
3 6 7 4 2 0 9 5 8 1
5 8 6 9 7 2 0 1 3 4
8 9 4 5 3 6 2 0 1 7
9 4 3 8 6 1 7 2 0 5
2 5 8 1 4 3 6 7 9 0
```

これはラテン方格 latin square になっていて、行・列それぞれについて、同じ行内・列内にはそれぞれの数字が一度しか登場しない。
また、check digit 計算の利便性のために対角成分がすべて0になっている。

### Check digit の計算

`572` という数字の列に対する check digit の計算は以下のようにおこなう。
行や列の番号は zero origin であることに注意。

1. 仮変数を `0` で初期化する
1. 仮変数の `0` と1文字目の `5` から、0行目5列目を参照して `9` を得て、仮変数に代入する
1. 仮変数の `9` と2文字目の `7` から、9行目7列目を参照して `7` を得て、仮変数に代入する
1. 仮変数の `7` と3文字目の `2` から、7行目2列目を参照して `4` を得て、仮変数に代入する
1. すべての桁の処理が終わったので、仮変数に入っている `4` が check digit である

つまり、check digit 付きの文字列は `5724` となる。

### Check digit の検証

同じラテン方格を使って、check digit を計算するときと同様に仮変数を更新していく。
最後の桁まで計算が終わったときに仮変数が `0` になっていれば、文字列は正当だと言える。

## 注意すべき点

Damm algorithm に使用できる位数nの準群（変換表）は一意に定まらない。

http://www.md-software.de/math/DAMM_Quasigruppen.txt によると、 位数10の準群（変換表）はたとえば以下の2つがある。

```
# A
0 3 1 7 5 9 8 6 4 2
7 0 9 2 1 5 4 8 6 3
4 2 0 6 8 7 1 3 5 9
1 7 5 0 9 8 3 4 2 6
6 1 2 3 0 4 5 9 7 8
3 6 7 4 2 0 9 5 8 1
5 8 6 9 7 2 0 1 3 4
8 9 4 5 3 6 2 0 1 7
9 4 3 8 6 1 7 2 0 5
2 5 8 1 4 3 6 7 9 0
```

```
# B
0 2 3 4 5 6 7 8 9 1 
2 0 4 1 7 9 5 3 8 6 
3 7 0 5 2 8 1 6 4 9 
4 1 8 0 6 3 9 2 7 5 
5 6 2 9 0 7 4 1 3 8 
6 9 7 3 1 0 8 5 2 4 
7 5 1 8 4 2 0 9 6 3 
8 4 6 2 9 5 3 0 1 7 
9 8 5 7 3 1 6 4 0 2 
1 3 9 6 8 4 2 7 5 0 
```

`572` に対してAを用いて求めた check digit は `4`、Bを用いて求めた check digit は `9` となり一致しない。

したがって、Damm algorithm を使用する際には check digit の生成・検証において一貫して同じ変換表を使用する必要があり、「位数10の Damm algorithm」と言っただけでは値が確定しない。
また、自分が調べた限りだと標準になっている変換表というのもないように見える。

これは Luhn algorithm や Modulus 10 Weight 3 (JAN/EAN, ISBN-13, etc) がアルゴリズムの名前だけから値まで確定できるため、ライブラリをポン置きで使用できるのと対照的になっている。

アルゴリズム自体とは別に変換表の取り決め・設定が必要だという性質は、check digit を複数の場所で生成・検証する場合には取り回しが少し面倒になりそうだと感じる。

上記の性質は Wikipedia などにも書かれていなかったが、実用上、この性質が気になる場合もあると思ったのでこうして書いておいた。

## おわりに

Damm algorithm の論文は以下のURLで公開されている。 \
http://archiv.ub.uni-marburg.de/diss/z2004/0516/pdf/dhmd.pdf

せっかくなので斜め読みしてみようかと思ったが、ドイツ語で書かれていたのでそっ閉じした。

Damm algorithm は誤り検出性能の高さをはじめ、良い性質を数多く持っている。一方で、事前に必要な取り決めが増えるので、どんな場合にも常に最善のアルゴリズムとは限らない。

また、今のところ実装はそれほど多くなさそうだが、（適切な準群の導出はともかくとして）check digit 生成・検証の実装自体は難しくないので適切なユースケースがあれば、自分で実装して使ってみることも視野に入れて良いと考えている。
