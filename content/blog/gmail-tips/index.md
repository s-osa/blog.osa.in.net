---
title: "Gmail Tips"
date: "2021-01-17"
---

## `+` による拡張

`john@example.com` という Gmail のアドレスがあったときに、同じメールボックスで 

- `john+foo@example.com`
- `john+bar@example.com`

などのメールアドレスに宛てたメールも受け取ることができる。

フィルタ適用などに使いやすいので覚えておくと便利。

詳細： https://support.google.com/a/users/answer/9308648

## 無視されるドット

同様に `john@example.com` という Gmail のアドレスがあったとき、同じメールボックスで

- `j.ohn@example.com`
- `jo.hn@example.com`
- `joh.n@example.com`
- `j.o.h.n@example.com`

などのメールアドレスに宛てたメールも受け取ることができる。

逆も成り立つので `j.ohn@example.com` というメールアドレスを所有している場合、`john@example.com` 宛てのメールを受け取ることができる。

`+` による拡張とは異なり、こちらはドットの有無や位置の違いによるなりすましアカウントの取得を防ぐのが主目的の模様。

詳細： https://support.google.com/mail/answer/7436150

### 検索しやすいユーザー名

このドットが無視されるという仕様がある関係だと思われるが、`john.doe@example.com` のようなアドレスに対して `doe` で検索をかけてもうまくヒットしないことがある。

Google Workspace ではあらゆる箇所でユーザー検索を使用する。そこで、ドット区切りではなくハイフン区切り（e.g., `john-doe@example.com`）などのユーザー名にすると、姓名の区切りが認識されて検索しやすくなるため便利。

これが書きたかったのでこのエントリを書いた。
