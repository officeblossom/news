# コトノハ

ニュースに出てくる難しい言葉を、中学生にもわかる表現で解説するWebアプリです。

意味だけでなく、理解に必要な歴史・政治・宗教などの背景、関連語、実際のニュースへのリンクをまとめて確認できます。

## 主な機能

- ニュース用語のやさしい説明
- 身近なたとえによる補足
- 歴史・政治などの背景解説
- 関連語の紹介
- Googleニュース検索へのリンク
- 最近1か月の重要ニュース単語10選
- 検索履歴と今月の10語から出題する4択クイズ
- スマートフォン・タブレット対応

検索履歴はブラウザ内に保存され、10問クイズの出題候補として使われます。

## 開発

Node.js 22以上とpnpmを使用します。

```bash
pnpm install
pnpm dev
```

ブラウザで `http://localhost:3000` を開いてください。

## ビルド

```bash
pnpm build
pnpm start
```

## Vercel

GitHubリポジトリをVercelへインポートすると、Next.jsプロジェクトとして自動認識されます。特別な環境変数は必要ありません。
# コトノハ

ニュースに出てくる難しい言葉を、中学生にもわかる日本語で解説するNext.jsアプリです。

## 無料検索の仕組み

- 登録済みの主要語は静的データから即時表示
- 任意の言葉はWikipediaとGoogleニュースRSSから最新情報を取得
- `GEMINI_API_KEY`がある場合はGeminiでやさしい説明に編集
- API未設定・無料枠超過・障害時はWikipediaベースの解説へ自動切り替え
- 動的な検索結果はブラウザに7日間保存

## 環境変数

VercelのProject Settings → Environment Variablesに設定します。

```text
GEMINI_API_KEY=Google AI Studioで発行したキー
GEMINI_MODEL=gemini-2.5-flash-lite
```

`GEMINI_API_KEY`は任意です。設定しなくてもWikipediaとニュース検索は動作します。APIキーをGitHubへコミットしたり、`NEXT_PUBLIC_`を付けたりしないでください。
