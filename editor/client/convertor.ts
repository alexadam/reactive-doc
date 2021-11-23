
import MarkdownIt from 'markdown-it'
import Renderer from 'markdown-it/lib/renderer'
import Token from 'markdown-it/lib/token'
import _ from 'underscore'
import htmlTemplate from './template.html'

let stateObj: any = {}
let templatesObj: any = {}
let allVariables: any = []
let codeBlocks: any = []

const generateInputHTML = (data: any) => {
  let htmlInput = ``

  if (data.type !== 'button') {
    stateObj[data.variableName] = data.defaultValue
    allVariables.push(data.variableName)
  }

  const onChangeText = `updateState(this); ${data.onChange + ';'}`

  if (data.type === 'text') {
    htmlInput = `<input id="rd-${data.variableName}" class="rd-text-input rd-input" type="text" oninput="${onChangeText}" value="${data.defaultValue}" />`
  } else if (data.type === 'multiline-text') {
    htmlInput = `<textarea id="rd-${data.variableName}" class="rd-ml-text-input rd-input" type="text" oninput="${onChangeText}">${data.defaultValue}</textarea>`
  } else if (data.type === 'number') {
    htmlInput = `<input id="rd-${data.variableName}" class="rd-text-input rd-input" type="number" oninput="${onChangeText}" value="${data.defaultValue}" />`
  } else if (data.type === 'password') {
    htmlInput = `<input id="rd-${data.variableName}" class="rd-text-input rd-input" type="password" oninput="${onChangeText}" />`
  } else if (data.type === 'list') {
    htmlInput = `<select id="rd-${data.variableName}" class="rd-text-input rd-input" onchange="${onChangeText}" value="${data.defaultValue}" >
      ${data.values.map((v: any) => '<option value="'+v+'" '+(data.defaultValue === v ? 'selected' : '')+'>'+v+'</option>').join('\n')}
    </select>`
  } else if (data.type === 'color') {
    htmlInput = `<input id="rd-${data.variableName}" class="rd-color-input rd-input" type="color" oninput="${onChangeText}" value="${data.defaultValue}" />`
  } else if (data.type === 'date') {
    htmlInput = `<input id="rd-${data.variableName}" class="rd-text-input rd-input" type="date" oninput="${onChangeText}" value="${data.defaultValue}" />`
  } else if (data.type === 'button') {
    htmlInput = `<button id="rd-${data.variableName}" class="rd-button rd-input" onclick="${data.trigger}">${data.label}</button>`
  }

  let html = `
    <div class="rd-input-block">
      <div class="rd-input-block-label">
        ${data.label}
      </div>
      <div class="rd-input-block-row">
        ${htmlInput}  
        <button class="copy-button" onclick="copyInput('rd-${data.variableName}')">
          <svg width="16px" height="16px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100.56 122.88" style="enable-background:new 0 0 100.56 122.88" xml:space="preserve"><g><path d="M72.15,112.2L90.4,93H72.15V112.2L72.15,112.2z M81.75,9.2c0,1.69-1.37,3.05-3.05,3.05c-1.69,0-3.05-1.37-3.05-3.05V6.11 H6.11v92.24h3.01c1.69,0,3.05,1.37,3.05,3.05c0,1.69-1.37,3.05-3.05,3.05H5.48c-1.51,0-2.88-0.61-3.87-1.61l0.01-0.01 c-1-1-1.61-2.37-1.61-3.87V5.48C0,3.97,0.61,2.6,1.61,1.61C2.6,0.61,3.97,0,5.48,0h70.79c1.5,0,2.87,0.62,3.86,1.61l0,0l0.01,0.01 c0.99,0.99,1.61,2.36,1.61,3.86V9.2L81.75,9.2z M100.56,90.55c0,1.4-0.94,2.58-2.22,2.94l-26.88,28.27 c-0.56,0.68-1.41,1.11-2.36,1.11c-0.06,0-0.12,0-0.19-0.01c-0.06,0-0.12,0.01-0.18,0.01H24.29c-1.51,0-2.88-0.61-3.87-1.61 l0.01-0.01l-0.01-0.01c-0.99-0.99-1.61-2.36-1.61-3.86v-93.5c0-1.51,0.62-2.88,1.61-3.87l0.01,0.01c1-0.99,2.37-1.61,3.86-1.61 h70.79c1.5,0,2.87,0.62,3.86,1.61l0,0l0.01,0.01c0.99,0.99,1.61,2.36,1.61,3.86V90.55L100.56,90.55z M94.45,86.9V24.54H24.92v92.24 h41.13V89.95c0-1.69,1.37-3.05,3.05-3.05H94.45L94.45,86.9z"/></g></svg>
        </button>
      </div>
    </div>
    `
  if (data.type === 'button') {
    html = `
    <div class="rd-input-block">
      <div class="rd-input-block-row">
        ${htmlInput}
      </div>
    </div>
    `
  }
  return html
}

const generateTemplateHTML = (data: any, type = '') => {
  const id = `template-${Math.floor(Math.random()*1000000000)}`
  let html = `
  <div class="rd-template">
    <pre id="${id}" class="rd-template-content ${type.length > 0 ? 'rd-' + type : ''}">${data}</pre>
    <div class="rd-template-menu"><button class="copy-button" onclick="copyTemplate('${id}')">
      <svg width="16px" height="16px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100.56 122.88" style="enable-background:new 0 0 100.56 122.88" xml:space="preserve"><g><path d="M72.15,112.2L90.4,93H72.15V112.2L72.15,112.2z M81.75,9.2c0,1.69-1.37,3.05-3.05,3.05c-1.69,0-3.05-1.37-3.05-3.05V6.11 H6.11v92.24h3.01c1.69,0,3.05,1.37,3.05,3.05c0,1.69-1.37,3.05-3.05,3.05H5.48c-1.51,0-2.88-0.61-3.87-1.61l0.01-0.01 c-1-1-1.61-2.37-1.61-3.87V5.48C0,3.97,0.61,2.6,1.61,1.61C2.6,0.61,3.97,0,5.48,0h70.79c1.5,0,2.87,0.62,3.86,1.61l0,0l0.01,0.01 c0.99,0.99,1.61,2.36,1.61,3.86V9.2L81.75,9.2z M100.56,90.55c0,1.4-0.94,2.58-2.22,2.94l-26.88,28.27 c-0.56,0.68-1.41,1.11-2.36,1.11c-0.06,0-0.12,0-0.19-0.01c-0.06,0-0.12,0.01-0.18,0.01H24.29c-1.51,0-2.88-0.61-3.87-1.61 l0.01-0.01l-0.01-0.01c-0.99-0.99-1.61-2.36-1.61-3.86v-93.5c0-1.51,0.62-2.88,1.61-3.87l0.01,0.01c1-0.99,2.37-1.61,3.86-1.61 h70.79c1.5,0,2.87,0.62,3.86,1.61l0,0l0.01,0.01c0.99,0.99,1.61,2.36,1.61,3.86V90.55L100.56,90.55z M94.45,86.9V24.54H24.92v92.24 h41.13V89.95c0-1.69,1.37-3.05,3.05-3.05H94.45L94.45,86.9z"/></g></svg>
    </button></div>
  </div>
  `
  templatesObj[id] = data

  return html
}

const generateInlineTemplateHTML = (data: any) => {
  const id = `template-${Math.floor(Math.random()*1000000000)}`

  let html = `
  <span class="rd-inline-template">
    <span id="${id}" class="rd-inline-template-content">${data}</span>
  </span>
  `
  templatesObj[id] = data

  return html
}

const createGenericBlock = (content: string, type = '') => {
  return `
  <pre class="rd-generic-block ${type.length > 0 ? 'rd-' + type : ''}">${content}</pre>
  `
}

/////
/////
/////
/////

const RDConvertor = (mdContent: string) => {


stateObj = {}
templatesObj = {}
allVariables = []
codeBlocks = []

  // const md = new MDIT({
  //   html:         true,        // Enable HTML tags in source
  //   xhtmlOut:     false,        // Use '/' to close single tags (<br />).
  //                               // This is only for full CommonMark compatibility.
  //   breaks:       true,        // Convert '\n' in paragraphs into <br>
  //   langPrefix:   'language-',  // CSS language prefix for fenced blocks. Can be
  //                               // useful for external highlighters.
  //   linkify:      true,        // Autoconvert URL-like text to links
  //   typographer:  false,
  // })

  const md = MarkdownIt().set({ html: true, breaks: true, xhtmlOut: false, typographer: false, linkify: true })


  md.renderer.rules.code_inline = (tokens: Token[],
    idx: number,
    options: MarkdownIt.Options,
    env: any,
    self: Renderer,) => {

    const token = tokens[idx]
    const content = token.content.trim()
    return generateInlineTemplateHTML(content)
  }


  md.renderer.rules.fence = (tokens: Token[],
    idx: number,
    options: MarkdownIt.Options,
    env: any,
    self: Renderer,) => {
    // a code block
    const token = tokens[idx]

    if (token.tag === 'code') {
      const parts = token.info.split(/\s+/)
      let tokenName = token.info
      if (parts.length > 1) {
        tokenName = parts[0]
      }

      if (tokenName === '@input') {
        const content = token.content.trim()
        try {
          const jsonContent = JSON.parse(content)
          const html = generateInputHTML(jsonContent)
          return html
        } catch (error) {
          return content
        }
      } else if (tokenName === '@template') {
        const content = token.content.trim()
        try {
          const html = generateTemplateHTML(content, parts[1])
          return html
        } catch (error) {
          return content
        }
      } else if (tokenName === '@code') {
        const content = token.content.trim()
        codeBlocks.push(content)
        return ''
      } else {        
        const content = token.content.trim()
        return createGenericBlock(content, tokenName)
      }
    } 

    return token.content
  }


  const html = md.render(mdContent)
  let templateFileContent = htmlTemplate.replace('REPLACE_HTML', html)
  
  const stateStr = `var state = ${JSON.stringify(stateObj)}`
  templateFileContent = templateFileContent.replace('REPLACE_STATE', stateStr)

  const templatesStr = `var templates = ${JSON.stringify(templatesObj)}`
  templateFileContent = templateFileContent.replace('REPLACE_TEMPLATES', templatesStr)

  const codeBlocksStr = codeBlocks.join('\n\n')
  templateFileContent = templateFileContent.replace('REPLACE_CODE', codeBlocksStr)

  const mdLines = mdContent.split('\n')
  const mdHtmlLines = mdLines.map(e => `<!--${_.escape(e)}-->`)
  const mdLinesStr = mdHtmlLines.join('\n')
  templateFileContent = templateFileContent.replace('REPLACE_MD', mdLinesStr)
  
  return {templateFileContent, allVariables}
}

export default RDConvertor