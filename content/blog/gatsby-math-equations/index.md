---
title: "Gatsby で数式を表示する"
date: "2021-03-21"
---

細々とした数式を書きたいことがそこそこあるので、数式を表示できるようにする。
このブログは Gatsby で出来ているので、Gatsby での数式表示を実現する。

## gatsby-remark-katex

[gatsby-remark-katex](https://www.gatsbyjs.com/plugins/gatsby-remark-katex/) というプラグインがあるのでこれを使う。

[KaTeX](https://katex.org/) は HTML と CSS で数式描画を実現していて、MathJax よりも高速に数式を描画してくれるとのこと。

## 数式を書いてみる

数式じゃないけど、hello world 的なものから。

$$
\KaTeX
$$

簡単な数式。

$$
\tag{1} a^2 + b^2 = c^3
$$

もちろん、インラインでも $a^2 + b^2 = c^3$ 書けます。

もうちょっとだけ複雑な数式。

$$
\tag{2} F_n = \frac{1}{\sqrt 5} \left [ \left ( \frac{1 + \sqrt 5}{2} \right ) ^n - \left ( \frac{1 - \sqrt 5}{2} \right ) ^n \right ]
$$

$$
\tag{3} \sum_{n = 1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$

$$
\tag{4} e^{i\theta} = \cos \theta + i \sin \theta
$$

キレイな数式はテンションが上がりますね。

元の Markdown がどうなっているか見たい方は右下の Revisions からどうぞ。
