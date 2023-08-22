import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import CircularProgress from '@mui/material/CircularProgress';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Button } from '@mui/material'

export default function Home() {

  const [userInput, setUserInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      "content": "Hello, how can I help you?",
      "role": "assistant"
    }
  ]);

  // Use for upload file
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const messageListRef = useRef(null);
  const textAreaRef = useRef(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    const messageList = messageListRef.current;
    messageList.scrollTop = messageList.scrollHeight;
  }, [messages]);

  // Focus on text field on load
  useEffect(() => {
    textAreaRef.current.focus();
  }, []);

  // Handle file
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      console.log(formData)

      console.log("Upload file")
      // You can send formData to your server using fetch or a library like axios.
      // Example: 
      // await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      .then(() => console.log("File uploaded."))

      // Reset selectedFile state after successful upload
      setSelectedFile(null);
    }
  };

  // Handle errors
  const handleError = () => {
    setMessages((prevMessages) => [...prevMessages, { "content": "Oops! There seems to be an error. Please try again.", "role": "assistant" }]);
    setLoading(false);
    setUserInput("");
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userInput.trim() === "") {
      return;
    }

    setLoading(true);
    setMessages((prevMessages) => [...prevMessages, { "content": userInput, "role": "user" }]);

    // Send user question and history to API
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: userInput, history: history }),
    });

    if (!response.ok) {
      handleError();
      return;
    }

    // Reset user input
    setUserInput("");
    const data = await response.json();

    if (data.result.error === "Unauthorized") {
      handleError();
      return;
    }

    setMessages((prevMessages) => [...prevMessages, { "content": data.result.answer, "role": "assistant", "docs": data.result.docs }]);
    setLoading(false);

  };

  // Prevent blank submissions and allow for multiline input
  const handleEnter = (e) => {
    if (e.key === "Enter" && userInput) {
      if (!e.shiftKey && userInput) {
        handleSubmit(e);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  // Keep history in sync with messages
  useEffect(() => {
    if (messages.length >= 3) {
      setHistory([
        {
          "content": messages[messages.length - 2].content,
          "role": "user"
        },
        {
          "content": messages[messages.length - 1].content,
          "role": "assistant"
        }
      ]);

    }
  }, [messages])

  return (
    <>
      <Head>
        <title>Reading Copilot</title>
        <meta name="description" content="LangChain documentation chatbot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.topnav}>
        <div className={styles.navlogo}>
          <a href="/">Reading Copilot</a>
        </div>
        <div className={styles.navlinks}>
          {/** TODO: upload file */}
        </div>
      </div>
      <main className={styles.main}>
        <div className={styles.cloud}>
          <div ref={messageListRef} className={styles.messagelist}>
            {messages.map((message, index) => {
              return (
                // The latest message sent by the user will be animated while waiting for a response
                <div key={index} className={message.role === "user" && loading && index === messages.length - 1 ? styles.usermessagewaiting : message.role === "assistant" ? styles.apimessage : styles.usermessage}>
                  {/* Display the correct icon depending on the message type */}
                  {message.role === "assistant" ? <Image src="/parroticon.png" alt="AI" width="30" height="30" className={styles.boticon} priority={true} /> : <Image src="/usericon.png" alt="Me" width="30" height="30" className={styles.usericon} priority={true} />}
                  <div className={styles.markdownanswer}>
                    {/* Messages are being rendered in Markdown format */}
                    <ReactMarkdown linkTarget={"_blank"}>{message.content}</ReactMarkdown>
                    {
                      message.docs && message.docs.length > 0 &&
                      <Accordion className={styles.docs}>
                        <AccordionSummary
                          expandIcon={<svg viewBox='0 0 20 20' className={styles.svgicon} xmlns='http://www.w3.org/2000/svg'>
                            <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
                          </svg>}
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                        >
                          <h3>Related Documents</h3>
                        </AccordionSummary>
                        <AccordionDetails>
                          <div className={styles.docslist}>
                            {message.docs.map((doc, index) => {
                              return (
                                <div key={index} className={styles.doc}>
                                  <div className={styles.doccontent}>
                                    <ReactMarkdown linkTarget={"_blank"}>{doc}</ReactMarkdown>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </AccordionDetails>
                      </Accordion>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className={styles.center}>

          <div className={styles.cloudform}>
            <form onSubmit={handleSubmit}>
              <textarea
                disabled={loading}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                autoFocus={false}
                rows={1}
                maxLength={512}
                type="text"
                id="userInput"
                name="userInput"
                placeholder={loading ? "Waiting for response..." : "Type your question..."}
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                className={styles.textarea}
              />
              <button
                type="submit"
                disabled={loading}
                className={styles.generatebutton}
              >
                {loading ? <div className={styles.loadingwheel}><CircularProgress color="inherit" size={20} /> </div> :
                  // Send icon SVG in input field
                  <svg viewBox='0 0 20 20' className={styles.svgicon} xmlns='http://www.w3.org/2000/svg'>
                    <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
                  </svg>}
              </button>
            </form>
          </div>
          <div className={styles.footer}>
            <p>Powered by <a href="https://github.com/hwchase17/langchain" target="_blank">LangChain</a>. Built by <a href="https://twitter.com/chillzaza_" target="_blank">Zahid</a>.</p>
          </div>
        </div>
      </main>
    </>
  )
}
