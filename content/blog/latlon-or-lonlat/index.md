---
title: "緯度と経度の順序"
date: "2021-09-15"
---

## 統一されていない順序

緯度 latitude と経度 longitude の順序がサービスや API によって違う。

たとえば、Google Maps は `latitude, longitude` の順になっている。

* https://www.google.com/maps/@35,135,15z

一方、オープンソースの経路探索エンジンである [OSRM](http://project-osrm.org/) の API では `longitude, latitude` という順になっている。

* http://router.project-osrm.org/route/v1/car/135,35;135,35.1
* http://project-osrm.org/docs/v5.24.0/api/

そんな OSRM も [Web UI](https://map.project-osrm.org/?z=15&center=35.002107%2C135.000000&hl=en&alt=0&srv=1) では `latitude, longitude` になっていたり、[RGeo](https://github.com/rgeo/rgeo) は `longitude, latitude` だったりと、順序はわりと揺れている印象がある。

## 指針

関連する規格に ISO 6709 がある。

* En: https://en.wikipedia.org/wiki/ISO_6709
* Ja: https://ja.wikipedia.org/wiki/ISO_6709

要点だけ抜粋すると以下の通り。

> * Latitude comes before longitude
> * North latitude is positive
> * East longitude is positive

つまり、ISO 6709 的には `latitude, longitude` の順序が正しいことになる。

なお、緯度経度の符号も定義されているが、さすがにこっちが揺れているのは見たことがない。

## ISO 6709 による文字列表現

ISO 6709 の付属書では座標の文字列表現も定められている。
`(35, 135)` を ISO 6709 形式で表現すると、`+35+135/` になる。

ただし、この文字列表現は度数の小数ではなく度分秒を使うことになっていたり、ゼロ埋めが必要な固定長の表現になっていたり、末尾にスラッシュが必要で URL との相性が悪かったりと、結構使いにくいように思う。

## 結論

基本的には ISO 6709 にならって `latitude, longitude` の順が良いのではないかと思う。
結果として日本語の「緯度経度」と順序が一致していて便利でもある。

一方、ISO 6709 の文字列表現は（特に Web では）使いにくいので、無理に準拠する必要はないと考えている。
現実的には Google Maps の `135.678,35.890` くらいの表現で充分であることが多い。

自分が実装するときには、順序を定める必要がある場合は `latitude, longitude` の順序にしているが、メソッドの引数などは原則としてキーワード引数にして順序についての知識を排除するようにしている。
