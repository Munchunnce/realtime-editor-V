import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Action';

const Editor = ({ socketRef, roomId, onChangeCode }) => {
  const editorRef = useRef(null); // this will store the CodeMirror instance
  const textareaRef = useRef(null); // reference to the <textarea>

  useEffect(() => {
    // Prevent multiple initializations
    if (!textareaRef.current || editorRef.current) return;

    editorRef.current = Codemirror.fromTextArea(textareaRef.current, {
      mode: { name: 'javascript', json: true },
      theme: 'dracula',
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineNumbers: true,
    });

    // emit change
    editorRef.current.on('change', (instance, changes) => {
      console.log('changes', changes);
      const { origin } = changes;
      const code = instance.getValue();
      onChangeCode(code);
      if(origin !== 'SetValue'){
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          code,
        });
      };
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

  useEffect(() => {
      const socket = socketRef.current;
      if (!socket) return;

      // Listen for code changes from server
      const handleCodeChange = ({ code }) => {
        const currentCode = editorRef.current.getValue();
        if (code !== currentCode) {
          editorRef.current.setValue(code);
        }
      };

      socket.on(ACTIONS.CODE_CHANGE, handleCodeChange);

      return () => {
        socket.off(ACTIONS.CODE_CHANGE, handleCodeChange);
      };
    }, [socketRef.current, socketRef]);

  return <textarea ref={textareaRef} id="realtimeEditor"></textarea>
}

export default Editor;
