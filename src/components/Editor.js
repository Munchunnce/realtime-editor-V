import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';

const Editor = () => {
  const editorRef = useRef(null); // this will store the CodeMirror instance
  const textareaRef = useRef(null); // reference to the <textarea>

  useEffect(() => {
    if (editorRef.current) return; // prevent multiple initializations

    editorRef.current = Codemirror.fromTextArea(textareaRef.current, {
      mode: { name: 'javascript', json: true },
      theme: 'dracula',
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineNumbers: true,
    });


    // async function init() {
    //   Codemirror.fromTextArea(document.getElementById('realtimeEditor'), {
    //     mode: { name: 'javascript', json: true },
    //     theme: 'dracula',
    //     autoCloseTags: true,
    //     autoCloseBrackets: true,
    //     lineNumbers: true,
    //   });
    // }

    // init();
  }, []);
  return <textarea id="realtimeEditor" ref={textareaRef}></textarea>
}

export default Editor;
