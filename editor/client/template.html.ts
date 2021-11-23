

 const htmlTemplate = `
 <!DOCTYPE html>
 <html>
 <head>
   <meta charset="utf-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   <title>Reactive Doc</title>

   <style>
    html, body { width: 100%; height: 100%; padding: 0; margin: 0; scrollbar-width: thin; scrollbar-color: lightgray rgba(0,0,0,0);}
    * { box-sizing: border-box; font-family: sans-serif; font-size: 16px;}
    #document {width: 100%; height: 100%; padding: 0; margin: 0;display:flex; flex-direction: column;align-items:center;}
    h1, h2, h3, h4, h5 {width:650px;}
    h1 {font-size: 24px;}
    h2 {font-size: 18px;}
    p {width: 650px; line-height:20px; margin-top:8px; margin-bottom:8px;}
 
     .rd-template {
       display: flex; flex-direction: row; width: 650px; margin-bottom: 10px;
     }
     .rd-inline-template {
      display: inline;
    }
    .rd-inline-template-content {
      width: inline;
      background-color: #fff59e;
      background-color: #F6F6EF;
      background-color: #F4F1E7;
      background-color: rgba(0,0,0,0.05);
      padding: 5px;
      border-radius: 5px;
      margin: 0;
    }
    .rd-inline-template-menu {
      display: inline;
      margin-right: 3px; padding: 0;
    }
    .rd-inline-template-menu button {
      width: 18px; height: 18px;
      outline: none; background-color: rgba(0,0,0,0); border: 0;
      cursor: pointer;
    }
     .rd-template-content {
      width: 650px;
      background-color: #fff59e;
      background-color: #F6F6EF;
      background-color: #F4F1E7;
      background-color: rgba(0,0,0,0.05);
      padding: 5px;
      border-radius: 5px;
      min-height: 30px;
      margin: 0;
      overflow-wrap: anywhere;
      overflow: auto;
     }
     .rd-template-menu {
       display: flex; flex-direction: column;
     }
     .copy-button {
      width: 20px; height: 26.5px;
      outline: none; background-color: rgba(0,0,0,0); border: 0;
      cursor: pointer;
      background-color: rgba(0,0,0,0);
      text-align: center;
      padding: 5px 3px;
    }
    .copy-button:hover {
      background-color: #fff59e;
    }
     path {
      stroke: lightgray;
      fill: rgba(0,0,0,0.5);
    }
     .rd-input-block {
      display: flex; flex-direction: column; width: 650px;
      margin-bottom: 12px;
     }
     .rd-input-block-label {
       width: 650px; 
       color: black;
     }
     .rd-input-block-ui  {
       width: 100%;
     }
    // input[type='text'] {
    //   width: 100%;
    // }
    //  input[type='color'] {
    //    width: 60px;
    //  }
     .rd-input-block-row {
      width: 100%;
      display: flex; flex-direction: row;
    }
     .rd-text-input {
       width: 100%; padding: 5px; border-radius: 3px; outline: none; border: solid 1px #888888;
     }
     .rd-ml-text-input {
      width: 100%; padding: 5px; border-radius: 3px; outline: none; border: solid 1px #888888; resize: vertical;
     }
     .rd-color-input {
      width: 60px; border-radius: 3px; outline: none; border: solid 1px #888888;
     }
     a.reactive-doc {
       text-decoration: none; padding: 30px 0; color: #3543E2; font-weight: bold;
     }
     .copy-button:focus {
      outline: solid 1px rgba(0,0,0,0.3);
      border-radius: 3px;
     }
     .rd-generic-block {
       width: 650px; min-height: 30px; background-color: rgba(0,0,0,0.05);
       padding: 5px;
       border-radius: 5px;
       margin: 0; margin-bottom: 10px;
     }
     .rd-note {
       background-color: rgba(0,255,0,0.15); border-radius: 5px; border: solid 1px rgba(0,255,0,0.6);
     }
     .rd-warning {
      background-color: rgba(255,0,0,0.1);  border-radius: 5px; border: solid 1px rgba(255,0,0,0.6);
    }
     @media only screen and (max-width: 650px) {
      h1, h2, h3, h4, h5, .rd-template, p, .rd-template-content, .rd-input-block, .rd-text-input, .rd-input-block-ui,
      .rd-input-block-label, .rd-ml-text-input  {width: 100%;}
      #document {padding: 10px;}
     }
   </style>
 </head>
 
 <body>
 
   <div id="document">
 
     REPLACE_HTML
 
     <div>Made with <a class="reactive-doc" href="https://reactivedoc.com/" target="_blank">ReactiveDoc</a></div>
   </div>
 
   <script>
     REPLACE_STATE
 
     REPLACE_TEMPLATES

     REPLACE_CODE

  
     const globalRegex = new RegExp('(\\\\{\\\\{\\\\s?([A-Za-z0-9_]+)\\\\s?\\\\}\\\\})', 'gm');

      (
        () => {
          const event = new Event('input', {
            bubbles: true,
            cancelable: true,
          });
          const changeEvent = new Event('change', {
            bubbles: true,
            cancelable: true,
          });
  
          const allInputs = document.getElementsByTagName('input')
          for(e of allInputs) {
            e.oninput(event)
          }
  
          const allTextAreas = document.getElementsByTagName('textarea')
          for(e of allTextAreas) {
            e.oninput(event)
          }
  
          const allSelects = document.getElementsByTagName('select')
          for(e of allSelects) {
            e.onchange(changeEvent)
          }
        }
      )()

     function setState(key, value) {
      state[key] = value
      replaceAllTemplates()
     }

     function getState(key) {
      return(state[key])
     }
 
     function updateState(input) {
       console.log('oooo')
       let stateKey = input.id.replace('rd-', '')
       state[stateKey] = input.value
       replaceAllTemplates()
     }
 
     function copyTemplate(templateId) {
       const elem = document.getElementById(templateId)
       const templateStr = templates[templateId]
       const content = renderString(templateStr, state);
       navigator.clipboard.writeText(content)
     }

     function copyInput(inputID) {
      const elem = document.getElementById(inputID)
      const content = elem.value;
      navigator.clipboard.writeText(content)
    }
 
     function replaceAllTemplates() {
       const allTemplateElems = document.getElementsByClassName('rd-template-content')
       const allInlineTemplateElems = document.getElementsByClassName('rd-inline-template-content')

       for (const el of allTemplateElems) {
         const templateId = el.id
         const templateStr = templates[templateId]
         const content = renderString(templateStr, state)
         el.innerText = content
       }
       for (const el of allInlineTemplateElems) {
        const templateId = el.id
        const templateStr = templates[templateId]
        const content = renderString(templateStr, state)
        el.innerText = content
      }
     }

     function renderString(templateStr, state) {
       return templateStr.replace(globalRegex, (a,b,c) => state[c])
     }
 
     // TODO
     // update templates at start - read all inputs
 
     
   </script>
 
 <script>
 
 replaceAllTemplates()
 
 </script>
 
 
 </body>

REPLACE_MD
 
 </html>
`




export default htmlTemplate