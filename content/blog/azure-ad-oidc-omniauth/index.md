---
title: "Azure AD OIDC を OmniAuth で実現する"
date: "2020-09-20"
---

Azure AD を OpenID Connect の OP (OpenID Provider) とした上で、RP (Relying Party) として動く Rails アプリケーションを書く機会があったので、そのときに調べたことを残しておく。

OmniAuth を使う前提で、どの strategy を使うかという話。

# 結論

omniauth\_openid\_connect を使った。<br>
https://github.com/m0n9oose/omniauth_openid_connect

[omniauth-openid-connect](https://github.com/jjbohn/omniauth-openid-connect) （snake\_case と spinal-case の違い）というのもあって紛らわしいが、omniauth-openid-connect の開発が止まって fork されたのが omniauth\_openid\_connect なので注意。

OpenID Connect Discovery にも対応しているので、下記のような感じでテキトーにパラメータを食わせてやると discovery して動いてくれる。

```ruby
Rails.application.config.middleware.use OmniAuth::Builder do
  azure_tenant_id = ENV['AZURE_AD_TENANT_ID']
  azure_client_id = ENV['AZURE_AD_CLIENT_ID']
  azure_client_secret = ENV['AZURE_AD_CLIENT_SECRET']
  azure_issuer = "https://login.microsoftonline.com/#{azure_tenant_id}/v2.0"

  provider :openid_connect, {
    discovery: true,
    issuer: azure_issuer,
    client_options: {
      identifier: azure_client_id,
      secret: azure_client_secret,
    },
  }
end
```

# 検討した他の選択肢

## omniauth-azure-activedirectory

https://github.com/AzureAD/omniauth-azure-activedirectory

Azure AD 公式なのではじめに当たってみた。
最終更新が5年前なのが気になりつつ単に枯れてるだけかもしれないと思って触ってみたが、implicit grant しか対応してなくて終了。

## omniauth-azure-oauth2

https://github.com/marknadig/omniauth-azure-oauth2

OIDC は OAuth 2.0 の拡張なので、OIDC 部分を自分で書く前提でベースに使えないか調べてみた。

開発が止まっていて、

- 近年の Ruby で動かない
    - うろ覚えだけど 2.4 以降とかで動かなかった気がする
- 依存ライブラリもバージョンが古くて他のライブラリの依存と衝突する

などの問題があり、サクッと解決できないか fork してみたけど、大消耗が発生したので終了。
