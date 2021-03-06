---
title: "決済で気をつけること 入門編"
date: "2020-09-17"
---

最近、立て続けに決済について相談を受ける機会があったので、全般的かつ初歩的なことをざっくりまとめておく。

当然、ここに書いてあることは注意すべきことの一部でしかない。より高度な内容や各サービス固有の注意点などは詳しい人に相談するなどしてほしい。

## クレジットカード情報の非保持化

2018年6月1日以降、割賦販売法の改正により非対面（つまりインターネットなど）でクレジットカード決済を行なう場合、以下のいずれかを満たす必要があるようになった。

- クレジットカード情報の非保持化
- PCI DSS という基準への準拠

現実的には PCI DSS 準拠を選ぶことはあまりないはずだし、自分自身が PCI DSS に準拠する経験をしたことがないので、ここではクレジットカード情報の非保持化についてのみ書く。

「非保持化」という言葉が少し紛らわしいが、非保持は

- 非保存
- 非通過
- 非処理

のすべてを満たす必要がある。

つまり、クレジットカード情報を DB に保存していなくても、非保持化できているとは限らない。サーバでクレジットカード情報を受け取った時点で非通過を満たせなくなるため、非保持化できていないことになる。

Stripe などの決済代行業者では非保持化を実現するためにフロントエンド向けに SDK を提供していて、

1. クライアントが決済代行業者のサーバに対してクレジットカード情報を送信する
1. 決済代行業者はクライアントに token を返す
1. クライアントは token をサービス提供者（我々）のサーバに送る
1. サービス提供者は token を使用して決済代行業者の API を叩くことで決済を実行する

という手順をとっている。

ドキュメントを読んで、普通に SDK を使っていれば非保持化は実現できるが、誤ってクレジットカード情報をサーバに送ってしまったりしないよう、背景にある考え方は知っておいた方が良い。

## 浮動小数点数

コンピュータでよく使われる小数は浮動小数点数だが、浮動小数点数は十進数の小数を（一般には）完全な精度で表すことはできないため、税率や手数料率などを表すときに浮動小数点数を使ってはいけない。

このあたりの回避方法は言語によるが、たとえば Ruby だと BigDecimal, Rational あたりを使うことになる。

```ruby
# Bad
tax_rate = 0.08

# Good
tax_rate = BigDecimal.new("0.08")

# Good
tax_rate = 0.08r
```

DB の型も同様で、たとえば PostgreSQL の場合だと numeric, decimal を使う必要がある。

## 端数処理

ある金額（整数）に消費税率や手数料率などの小数を掛けた結果は小数になるので、端数処理を行なう必要が生じる。

端数処理をどういった方法で行なうかは契約や利用規約などによるが、いずれの場合も切り上げ・切り捨て・四捨五入などの端数処理用のメソッドを使うべきで、整数への変換などを使うべきではない。

```ruby
# Bad
tax = (price * tax_rate).to_i

# Good
tax = (price * tax_rate).ceil

# Good
tax = (price * tax_rate).floor

# Good
tax = (price * tax_rate).round
```

Ruby の `to_i` は仕様として切り捨てを行なうので切り上げ・四捨五入の場合に使うのは問題外だが、切り捨ての場合も適切とは言えない。
`to_i` を使っても値自体は `floor` と同じ結果になるためバグにはならないが、「切り捨てを行なっている」という仕様・意図がコードに表現されなくなってしまう。可読性・保守性の話。

## 端数処理と足し算の順序

以下の2つは一般には一致しない。

- 複数の小数を合計してから端数処理したもの
- 複数の小数に対して端数処理をしてから合計を求めたもの

つまり、擬似数式で書くと `round(sum(x)) = sum(round(x))` は一般には成り立たない。

どちらで計算すべきかは契約や利用規約によるので一概にどちらにすべきとは言えないが、異なる結果が返ってくるということについては自覚的である必要がある。

また、消費税の計算は「請求ごと・税率ごと」に端数処理（方法は任意）をするということが定められている。
したがって、同じ《モノを売る》という商売でも、小売なのか卸売（掛売）なのかで端数処理をするタイミングが変わってくるので注意。

## オーソリとキャプチャ

クレジットカードに対する操作としてオーソリ（authorization）とキャプチャ（capture）がある。

オーソリは与信枠の確保を行なうことで、この時点では実際の請求は行なわれない。キャプチャは確保した与信枠に対して実際に請求を行なう。

一般的に、オーソリは（取りっぱぐれを防ぐために）注文時に行なわれるが、キャプチャのタイミングはサービスによる。
EC などでは契約成立時点以降にキャプチャすることになるが、契約成立時点はサービスによって異なるので注意が必要（注文確認メール送付時、商品出荷時など）。

また、デビットカードはクレジットカードのインターフェイスを持っているが、

- 与信確保という概念がなくオーソリ実行時に即引き落としされる
- カードの有効性確認のために少額決済・即返金されることがある

などクレジットカードと違う点がいくつかあるということを知っておくと、問い合わせがあったときなどに便利かもしれない。

## 注文のライフサイクル

注文にはライフサイクルがある。
注文からそのままサービス提供完了までまっすぐ進むのが一番ハッピーなルートだが、現実ではキャンセルや返金などが発生する。

そこで、決済を実装するにあたって、注文がたどる一生を考えて整理しておく必要がある。サービスによって異なるが、パッと思いつく一般的なものだと以下のようなもの。

- キャンセル・返金をどうするか
- ひとつの注文のうち、一部だけをキャンセル・返金することはあるか
- 上記の部分返金が複数回発生することはあるか
- プラットフォーム型サービスの場合、販売者に入金した後に購入者に返金することはあり得るか、あるとしたらその分の回収はどうするか
- 返金が発生するような場合、速やかな対応が求められることが多いが、どれくらいの時間で対応できる必要があるか、その時間内に対応できそうか

下の方の項目になると実装だけでなく、サービスレベルやオペレーションまで含めて考える必要がある。一方、すべてを実装で解決する必要はなく、オペレーションで解決できる場合もあるかもしれない（システム上の返金機能ではなく、カスタマーサポートによるコミュニケーションと銀行振込で解決など）。

## さいごに

決済は難しいしプレッシャーがかかる部分ではあるけど、サービスを事業として継続していくために必要不可欠な部分でもあるのでやっていきましょう。
