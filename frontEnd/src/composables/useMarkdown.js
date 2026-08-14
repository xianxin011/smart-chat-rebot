import { ref } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

export function useMarkdown() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value
        } catch (__) {}
      }
      return ''
    }
  })

  // 自定义代码块渲染
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const code = token.content
    const lang = token.info.trim() || 'text'

    let highlightedCode = code
    if (lang && hljs.getLanguage(lang)) {
      try {
        highlightedCode = hljs.highlight(code, { language: lang }).value
      } catch (__) {}
    }

    return `<div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="code-lang">${lang}</span>
        <button class="copy-code-btn" data-code="${encodeURIComponent(code)}">复制</button>
      </div>
      <pre class="code-block"><code class="hljs language-${lang}">${highlightedCode}</code></pre>
    </div>`
  }

  // 自定义引用块
  md.renderer.rules.blockquote_open = () => {
    return '<blockquote class="custom-blockquote">'
  }

  const render = (content) => {
    if (!content) return ''
    return md.render(content)
  }

  return {
    render,
    md
  }
}