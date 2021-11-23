import React, { useEffect, useRef, useState } from "react";
import _ from 'underscore'
import RDConvertor from './convertor'
import "./editor.scss"
import getCaretCoordinates from "./utils/caret-coords";
import Modal from "./utils/modal";
import Popup from "./utils/popup";

const Editor = () => {

  const previewRef = useRef<any>(null)
  const mdEditor = useRef<any>(null)
  const lastSelectionPositionRef = useRef<any>(null)
  const nextSelectionPositionRef = useRef<any>(-1)
  const uploadFileButtonRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const changeContentTimerRef = useRef<any>(null)
  const tmpRef = useRef<any>(null)
  const [popupVisible, setPopupVisible] = useState(false)
  const [isAddBlockPopupVisible, setAddBlockPopupVisible] = useState(false)
  const [isSelectVarRefPopupVisible, setSelectVarRefPopupVisible] = useState(false)
  const [parentBBOX, setParentBBOX] = useState<any>(null)
  const [addBlockParentBBOX, setAddBlockParentBBOX] = useState<any>(null)
  const [addVarRefParentBBOX, setVarRefParentBBOX] = useState<any>(null)
  const [htmlContent, setHtmlContent] = useState('')
  const [allVariables, setAllVariables] = useState([])
  const [mdContent, setMdContent] = useState(`# Hello

\`\`\`@input
{
  "type": "text",
  "label": "Your Name",
  "defaultValue": "",
  "variableName": "name",
  "onChange": "capitalize()"
}
\`\`\`

\`\`\`@code
function capitalize() {
  const name = getState('name').split(/\\s/)
  const lower = name.map(n => n.toLowerCase())
  setState('name', lower.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' '))
}
\`\`\`

\`\`\`@template
Hello {{ name }} 
\`\`\`
`)

  useEffect(() => {
    if (previewRef.current) {
      const tmpObj = RDConvertor(mdContent)
      setAllVariables(tmpObj.allVariables)
      const html = tmpObj.templateFileContent
      previewRef.current.srcdoc = html
      setHtmlContent(html)
    }
  }, [])

  useEffect(() => {

    if (nextSelectionPositionRef.current > -1) {
      mdEditor.current.selectionStart = nextSelectionPositionRef.current
      mdEditor.current.selectionEnd = nextSelectionPositionRef.current
      nextSelectionPositionRef.current = -1
    }

    if (changeContentTimerRef.current) {
      clearTimeout(changeContentTimerRef.current)
    }
    changeContentTimerRef.current = setTimeout(() => {
      if (previewRef.current) {
        const tmpObj = RDConvertor(mdContent)
        setAllVariables(tmpObj.allVariables)
        const html = tmpObj.templateFileContent
        previewRef.current.srcdoc = html
        setHtmlContent(html)
      }
    }, 1000);    
  }, [mdContent])

  useEffect(() => {
    if (!isAddBlockPopupVisible) {
      mdEditor.current.focus({preventScroll: true})
    }
  }, [isAddBlockPopupVisible])

  useEffect(() => {
    if (parentBBOX) {
      setPopupVisible(true)
    }
  }, [parentBBOX]);

  useEffect(() => {
    if (addBlockParentBBOX) {
      setAddBlockPopupVisible(true)
    }
  }, [addBlockParentBBOX]);

  useEffect(() => {
    if (addVarRefParentBBOX) {
      setSelectVarRefPopupVisible(true)
    }
  }, [addVarRefParentBBOX]);

  const onNewContent = (e: any) => {
    setAddBlockPopupVisible(false)

    const content = e.target.value
    const start = e.target.selectionStart;
    const finish = e.target.selectionEnd;

    if (start === finish) {
      const lines = content.split('\n')
      const lineNr = content.substring(0, start).split('\n').length - 1
      const crtLine = lines[lineNr]
      const insideTemplate = isInsideTemplateBlock(content, lines, lineNr)

      if (crtLine.trim() === '/') {
        e.stopPropagation()

        const ccc = getCaretCoordinates(e.target, finish)

        setTimeout(() => {
          if (insideTemplate) {
            setVarRefParentBBOX({ top: ccc.top + 50 - e.target.scrollTop, left: ccc.left, y: ccc.top + 50 - e.target.scrollTop, x: ccc.left })
          } else {
            setAddBlockParentBBOX({ top: ccc.top + 50 - e.target.scrollTop, left: ccc.left, y: ccc.top + 50 - e.target.scrollTop, x: ccc.left })
          }
        }, 200);
      }
    }

    setMdContent(content)
  }

  const onEditorKeyDown = (e: any) => {
    const content = e.target.value
    const start = e.target.selectionStart;
    const finish = e.target.selectionEnd;

    if (e.key === 'Tab') {
      e.preventDefault()
      e.stopPropagation()
      const value = content.substring(0, start) + '    ' + content.substring(finish)
      const newE = { target: {...e, value}}
      nextSelectionPositionRef.current = start + 4
      onNewContent(newE)
    }

    if (e.keyCode === 191) {
      if (start === finish) {
        const lines = content.split('\n')
        const lineNr = content.substring(0, start).split('\n').length - 1
        const insideTemplate = isInsideTemplateBlock(content, lines, lineNr)

        if (insideTemplate) {
          const ccc = getCaretCoordinates(e.target, finish)
          setTimeout(() => {
            setVarRefParentBBOX({ top: ccc.top + 30 - e.target.scrollTop, left: ccc.left, y: ccc.top + 30 - e.target.scrollTop, x: ccc.left })
          }, 100);
        }
      }
    }

    if (e.keyCode === 40 && (isAddBlockPopupVisible || isSelectVarRefPopupVisible)) {    
      e.stopPropagation()
      e.preventDefault()
      if (tmpRef.current) {
        tmpRef.current.focus({preventScroll: true})
      }
    } else {
      setAddBlockPopupVisible(false)
      setPopupVisible(false)
      setSelectVarRefPopupVisible(false)
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    } 
    timerRef.current = setTimeout(() => {
      const position = getCaretCoordinates(e.target, e.target.selectionEnd)
      testSelection(e, position)
    }, 500);
  }

  const isInsideTemplateBlock = (content: string, lines: string[], lineNr: number): boolean => {
    
    let isTemplateHeader = false
    let isTemplateFooter = false

    for (let i = lineNr - 1; i >= 0; i--) {
      if (lines[i].trim() === '```') {
        break
      } 
      if (lines[i].startsWith('```@template')) {
        isTemplateHeader = true
      }
    }
    for (let i = lineNr + 1; i < lines.length; i++) {      
      if (lines[i].startsWith('```@')) {
        break
      }
      if (lines[i].trim() === '```') {
        isTemplateFooter = true
      } 
    }

    return isTemplateHeader && isTemplateFooter
  }

  const syncScroll = (e: any) => {
    if (!previewRef.current.contentDocument.body || !previewRef.current.contentWindow) {
      return
    }
    const prop = e.target.scrollTop / e.target.scrollHeight * previewRef.current.contentDocument.body.scrollHeight
    previewRef.current.contentWindow.scrollTo(0, prop)
  }

  //////
  //////
  //////

  const readFile = (e: any) => {
    e.preventDefault()
    const reader = new FileReader()
    reader.onload = async (ev: any) => {
      const text = (ev.target.result)
      let lines: string[] = text.split('\n')
      lines = lines.filter(l => l.trim().startsWith('<!--')).map(l => _.unescape(l.replace('<!--', '').replace('-->', '')))
      console.log(lines.join('\n'))
      setMdContent(lines.join('\n'))
    };
    reader.readAsText(e.target.files[0])
  }

  const saveFile = () => {
    var pom = document.createElement('a');
    var textFileAsBlob = new Blob([htmlContent], { type: 'text/plain;charset=utf-8' });

    pom.setAttribute('href', window.URL.createObjectURL(textFileAsBlob));
    pom.setAttribute('download', 'reactive-doc.html');
    pom.click();
  }

  /////
  /////
  /////

  const testSelection = (e: any, position: any = null) => {
    const start = e.target.selectionStart;
    const finish = e.target.selectionEnd;
    const text = e.target.value.substring(start, finish)

    if (text.trim().length > 0) {
      const cX = position ? position.left : e.clientX;
      const sX = e.screenX;
      const cY = position ? position.top + 20 : e.clientY;
      const sY = e.screenY;

      setTimeout(() => {
        setParentBBOX({ top: cY + 8, left: cX - cX / 2, y: cY + 8, x: cX - cX / 2 })
      }, 200);
    }
  }

  const createTemplateVar = () => {
    const e = mdEditor.current
    const start = e.selectionStart;
    const finish = e.selectionEnd;
    const text = e.value.substring(start, finish)
    const newStr = mdContent.substring(0, start) + `{{ ${text} }}` + mdContent.substring(finish);
    setMdContent(newStr)
  }

  const createTemplateBlock = (fromQuickMenu = false) => {
    const e = mdEditor.current
    const start = fromQuickMenu ? e.selectionStart - 1 : e.selectionStart;
    const finish = e.selectionEnd
    const text = fromQuickMenu ? '' : e.value.substring(start, finish)
    const newStr = mdContent.substring(0, start) + `\n\`\`\`@template\n${text.trim()}\n\`\`\`\n` + mdContent.substring(finish);

    nextSelectionPositionRef.current = start + 14

    setMdContent(newStr)
  }

  ////

  const insertVarRef = (varName: string) => {
    console.log('varName', varName);
    ///
    const e = mdEditor.current
    const start = e.selectionStart;
    const finish = e.selectionEnd;
    const newStr = mdContent.substring(0, start - 1) + `{{ ${varName} }} ` + mdContent.substring(finish);
    nextSelectionPositionRef.current = start + `{{ ${varName} }} `.length - 1
    setMdContent(newStr)
    mdEditor.current.focus({preventScroll: true})
  }

  const insertBlock = (type: string, fromQuickMenu = false) => {
    const selStart = mdEditor.current.selectionStart
    console.log(selStart);

    const lines = mdContent.split('\n')
    const lineNr = mdContent.substring(0, selStart).split('\n').length - 1
    const crtLine = lines[lineNr]
    let tmpText = ''

    const p1 = fromQuickMenu ? mdContent.substring(0, selStart - 1) : mdContent.substring(0, selStart)
    const p2 = mdContent.substring(selStart)

    if (type === 'text') {
      tmpText = `\`\`\`@input
{
  "type": "text",
  "label": "Text1",
  "defaultValue": "",
  "variableName": "text1",
  "onChange": ""
}
\`\`\`` 
    } else if (type === 'multiline-text') {
      tmpText = `\`\`\`@input
{
  "type": "multiline-text",
  "label": "Multiline Text",
  "defaultValue": "",
  "variableName": "mlText1",
  "onChange": ""
}
\`\`\``
    } else if (type === 'number') {
      tmpText = `\`\`\`@input
{
  "type": "number",
  "label": "Number",
  "defaultValue": "42",
  "variableName": "nr1",
  "onChange": ""
}
\`\`\``
    } else if (type === 'password') {
      tmpText = `
\`\`\`@input
{
  "type": "password",
  "label": "Password",
  "variableName": "pass1",
  "onChange": ""
}
\`\`\``
    } else if (type === 'list') {
      tmpText = `\`\`\`@input
{
  "type": "list",
  "label": "List",
  "values": ["option 1", "option 2", "option 3"],
  "defaultValue": "option 1",
  "variableName": "list1",
  "onChange": ""
}
\`\`\``
    } else if (type === 'color') {
      tmpText = `
\`\`\`@input
{
  "type": "color",
  "label": "Color",
  "defaultValue": "#007fff",
  "variableName": "color1",
  "onChange": ""
}
\`\`\``
    } else if (type === 'date') {
      tmpText = `
\`\`\`@input
{
  "type": "date",
  "label": "Date",
  "defaultValue": "",
  "variableName": "date1",
  "onChange": ""
}
\`\`\``
    } else if (type === 'button') {
      tmpText = `
\`\`\`@input
{
  "type": "button",
  "label": "Click",
  "trigger": "setState('key', 'value')"
}
\`\`\``
    } else if (type === 'template') {
      tmpText = `\`\`\`@template

\`\`\``
    } else if (type === 'code') {
      tmpText = `\`\`\`@code

\`\`\``
    }

    const newMdContent = p1 + tmpText + p2
    nextSelectionPositionRef.current = selStart + tmpText.length - (fromQuickMenu ? 5 : 4)
    setMdContent(newMdContent)
    mdEditor.current.focus({preventScroll: true})

    // setTimeout(() => {
    //   mdEditor.current.focus()
    // }, 20);

  }

  ////

  return (
    <div className="rf-editor">
      <div className="top-menu">
        <div className="left-menu">
          <a href="" className="title">Reactive Doc</a>
        </div>
        <div className="right-menu">
          <div className="menu-container">
            <div className="file-upload-button action-button action-button-large" 
                onClick={() => uploadFileButtonRef.current?.click()} 
                title="Load MarkDown from HTML Document"
                ><input ref={uploadFileButtonRef} type="file" onChange={readFile} /><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/></svg></div>
              <button className="action-button action-button-large" 
                      onClick={saveFile}
                      title="Save Document as HTML"
                      >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 4.2v10.3"/></svg>
              </button>
          
            </div>
        </div> 
      </div>
      <div className="rf-editor-container">
        <div className="md-input-menu">
          <button className="action-button" 
                  onClick={() => insertBlock('text')}
                  title="Text Input"
                  >Abc</button>
          <button className="action-button" 
                  onClick={() => insertBlock('multiline-text')}
                  title="Multiline Text Input"
                  >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M17 9.5H3M21 4.5H3M21 14.5H3M17 19.5H3"/></svg>
          </button>
          <button className="action-button" 
                  onClick={() => insertBlock('number')}
                  title="Number Input"
                  >123</button>
          <button className="action-button" 
                  onClick={() => insertBlock('password')}
                  title="Password Input"
                  >***</button>
          <button className="action-button" 
                  onClick={() => insertBlock('list')}
                  title="List Input"
                  >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          </button>
          <button className="action-button" 
                  onClick={() => insertBlock('color')}
                  title="Color Input"
                  ><div className="color-input-button" style={{width:'20px', height: '20px'}}></div></button>
          <button className="action-button" 
                  onClick={() => insertBlock('date')}
                  title="Date Input"
                  >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </button>
          <button className="action-button" 
                  onClick={() => insertBlock('button')}
                  title="Button"
                  >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <button className="action-button" 
                  onClick={() => insertBlock('template')}
                  title="Template Block"
                  >{"{ }"}</button>
           <button className="action-button" 
                  onClick={() => insertBlock('code')}
                  title="Code Block"
                  >{"JS"}</button>
        </div>
        <div className="md-input">
          <textarea onChange={onNewContent} 
                    value={mdContent} 
                    ref={mdEditor} 
                    onKeyDown={onEditorKeyDown}
                    onScroll={syncScroll}
                    spellCheck={false} 
                    onMouseUp={testSelection}>
          </textarea>
        </div>
        <div className="preview">
          <iframe id="previewIframe" className="preview-frame" ref={previewRef}></iframe>
        </div>
      </div>

      <Popup isVisible={popupVisible} parentBBOX={parentBBOX} onClose={() => setPopupVisible(false)} minWidth={200}>
        <div className="command-context-menu">
          <button className="menu-btn"
            onClick={() => { setPopupVisible(false); createTemplateVar(); }}>Create Template Variable</button>
          <button className="menu-btn"
            onClick={() => { setPopupVisible(false); createTemplateBlock(); }}>Create Template Block</button>
        </div>
      </Popup>

      <Popup isVisible={isAddBlockPopupVisible} 
              parentBBOX={addBlockParentBBOX} 
              onClose={() => setAddBlockPopupVisible(false)} 
              minWidth={200}
              >
        <div className="command-context-menu">
          <button className="menu-btn" tabIndex={0}
            ref={tmpRef}
            onKeyUp={(e: any) => e.keyCode === 40 ? e.target.nextElementSibling?.focus() : e.keyCode === 38 ? e.target.previousElementSibling?.focus() : null}
            onClick={() => { setAddBlockPopupVisible(false); insertBlock('text', true) }}>Text</button>
          <button className="menu-btn" tabIndex={1}
            onKeyUp={(e: any) => e.keyCode === 40 ? e.target.nextElementSibling?.focus() : e.keyCode === 38 ? e.target.previousElementSibling?.focus() : null}
            onClick={() => { setAddBlockPopupVisible(false); insertBlock('multiline-text', true) }}>Multiline Text</button>
          <button className="menu-btn" tabIndex={2}
            onKeyUp={(e: any) => e.keyCode === 40 ? e.target.nextElementSibling?.focus() : e.keyCode === 38 ? e.target.previousElementSibling?.focus() : null}
            onClick={() => { setAddBlockPopupVisible(false); insertBlock('number', true) }}>Number</button>
          <button className="menu-btn" tabIndex={3}
            onKeyUp={(e: any) => e.keyCode === 40 ? e.target.nextElementSibling?.focus() : e.keyCode === 38 ? e.target.previousElementSibling?.focus() : null}
            onClick={() => { setAddBlockPopupVisible(false); insertBlock('password', true) }}>Password</button>
          <button className="menu-btn" tabIndex={4}
            onKeyUp={(e: any) => e.keyCode === 40 ? e.target.nextElementSibling?.focus() : e.keyCode === 38 ? e.target.previousElementSibling?.focus() : null}
            onClick={() => { setAddBlockPopupVisible(false); insertBlock('list', true) }}>List</button>
          <button className="menu-btn" tabIndex={5}
            onKeyUp={(e: any) => e.keyCode === 40 ? e.target.nextElementSibling?.focus() : e.keyCode === 38 ? e.target.previousElementSibling?.focus() : null}
            onClick={() => { setAddBlockPopupVisible(false); insertBlock('color', true) }}>Color</button>
          <button className="menu-btn" tabIndex={6}
            onKeyUp={(e: any) => e.keyCode === 40 ? e.target.nextElementSibling?.focus() : e.keyCode === 38 ? e.target.previousElementSibling?.focus() : null}
            onClick={() => { setAddBlockPopupVisible(false); insertBlock('date', true) }}>Date</button>
           <button className="menu-btn" tabIndex={6}
            onKeyUp={(e: any) => e.keyCode === 40 ? e.target.nextElementSibling?.focus() : e.keyCode === 38 ? e.target.previousElementSibling?.focus() : null}
            onClick={() => { setAddBlockPopupVisible(false); insertBlock('button', true) }}>Button</button>
          <button className="menu-btn" tabIndex={7}
            onKeyUp={(e: any) => e.keyCode === 40 ? e.target.nextElementSibling?.focus() : e.keyCode === 38 ? e.target.previousElementSibling?.focus() : null}
            onClick={() => { setAddBlockPopupVisible(false); insertBlock('template', true) }}>Template</button>
          <button className="menu-btn" tabIndex={7}
            onKeyUp={(e: any) => e.keyCode === 40 ? e.target.nextElementSibling?.focus() : e.keyCode === 38 ? e.target.previousElementSibling?.focus() : null}
            onClick={() => { setAddBlockPopupVisible(false); insertBlock('code', true) }}>Code</button>
        </div>
      </Popup>

      <Popup isVisible={isSelectVarRefPopupVisible} 
          onClose={() => setSelectVarRefPopupVisible(false) }
          parentBBOX={addVarRefParentBBOX}
          minWidth={200}
          >

        <div className="command-context-menu">
        {
          allVariables.map((v: any, index: number) => (
            <button className="menu-btn" tabIndex={1} key={index}
            ref={index === 0 ? tmpRef : null}
            onKeyUp={(e: any) => e.keyCode === 40 ? e.target.nextElementSibling?.focus() : e.keyCode === 38 ? e.target.previousElementSibling?.focus() : null}
            onClick={() => { setSelectVarRefPopupVisible(false); insertVarRef(v) }}>{v}</button>
          ))
        }
        </div>
      </Popup>
    </div>
  )
}

export default Editor